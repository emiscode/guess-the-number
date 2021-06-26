'use strict';

let gameLevel, attempts, tracking, timer, countdown, theNumber;

const minValue = 1;

const game = {
  easy: {
    value: 100,
    attempts: 15,
    tracking: true,
    timer: {
      enabled: false,
      value: 0,
    },
    msg: function () {
      return `Between ${minValue} and ${this.value}, ${this.attempts} attempts with tracking, and no timer.`;
    },
  },
  normal: {
    value: 500,
    attempts: 15,
    tracking: true,
    timer: {
      enabled: true,
      value: 45,
    },
    msg: function () {
      return `Between ${minValue} and ${this.value}, ${this.attempts} attempts with tracking, and a timer.`;
    },
  },
  hard: {
    value: 1000,
    attempts: 20,
    tracking: false,
    timer: {
      enabled: true,
      value: 30,
    },
    msg: function () {
      return `Between ${minValue} and ${this.value}, ${this.attempts} attempts without tracking, and a timer.`;
    },
  },
};

loadGame();
updatePlaceholders();
addEventListeners();

function loadGame() {
  attempts = 0;
  tracking = [];

  gameLevel =
    isWebStorageSupported() &&
    localStorage.GTN_gameLevel &&
    game[localStorage.GTN_gameLevel].value
      ? localStorage.GTN_gameLevel
      : 'normal';

  timer = game[gameLevel].timer.value;
  document.querySelector(`#${gameLevel}`).checked = true;
  document
    .querySelector(`#text-${gameLevel}`)
    .classList.add('btn-radio-selected');

  if (isWebStorageSupported()) {
    if (localStorage.GTN_easy_BestResult === undefined)
      localStorage.GTN_easy_BestResult = 0;
    if (localStorage.GTN_normal_BestResult === undefined)
      localStorage.GTN_normal_BestResult = 0;
    if (localStorage.GTN_hard_BestResult === undefined)
      localStorage.GTN_hard_BestResult = 0;

    if (localStorage.GTN_easy_BestTime === undefined)
      localStorage.GTN_easy_BestTime = 0;
    if (localStorage.GTN_normal_BestTime === undefined)
      localStorage.GTN_normal_BestTime = 0;
    if (localStorage.GTN_hard_BestTime === undefined)
      localStorage.GTN_hard_BestTime = 0;
  }

  disableElements(['btn-restart', 'btn-check', 'input-guess'], true);
  updateTextBestResult();
  updateTextAttempts();
  updateTextTracking();
  getTimer();
}

function isWebStorageSupported() {
  return typeof Storage !== 'undefined';
}

function updatePlaceholders() {
  const DOM_textGameLevel = document.querySelector('#text-game-level');

  const DOM_placeholders =
    DOM_textGameLevel.textContent.match(/\{\{(.*?)\}\}/g);

  DOM_placeholders.forEach(placeholder => {
    const textGameLevel = game[gameLevel].msg();

    DOM_textGameLevel.textContent = DOM_textGameLevel.textContent.replace(
      placeholder,
      textGameLevel
    );
  });
}

function addEventListeners() {
  const DOM_inputGameLevel = gameLevelEvent();
  playEvent(DOM_inputGameLevel);
  restartEvent(DOM_inputGameLevel);
  checkEvent();
  inputGuessEvent();
}

function gameLevelEvent() {
  const DOM_inputGameLevel = document.querySelectorAll(
    'input[name="input-game-level"]'
  );

  DOM_inputGameLevel.forEach(level => {
    level.addEventListener('click', () => {
      gameLevel = level.value;
      timer = game[gameLevel].timer.value;

      DOM_inputGameLevel.forEach(level => {
        if (level.checked) {
          document
            .querySelector(`#text-${level.value}`)
            .classList.add('btn-radio-selected');
        } else {
          document
            .querySelector(`#text-${level.value}`)
            .classList.remove('btn-radio-selected');
        }
      });

      if (isWebStorageSupported()) localStorage.GTN_gameLevel = gameLevel;

      document.querySelector('#text-game-level').textContent =
        game[gameLevel].msg();

      updateTextBestResult();
      updateTextAttempts();
      updateTextTracking();
      getTimer();
    });
  });

  return DOM_inputGameLevel;
}

function playEvent(DOM_inputGameLevel) {
  const DOM_btnPlay = document.querySelector('#btn-play');

  DOM_btnPlay.addEventListener('click', () => {
    theNumber = getTheRandomNumber();
    countdown = setInterval(getTimer, 1000);

    DOM_inputGameLevel.forEach(level => {
      level.disabled = true;

      if (!level.checked) {
        document
          .querySelector(`#text-${level.value}`)
          .classList.add('btn-radio-disabled');
      }
    });

    if (document.querySelector(`#text-${gameLevel}`))
      disableElements(['btn-play'], true);
    disableElements(['btn-restart', 'btn-check', 'input-guess'], false);

    DOM_btnPlay.classList.add('btn-play-disabled');
    document.querySelector('#input-guess').focus();
    document.querySelector('#btn-check').classList.add('btn-check-enabled');
    document.querySelector('#game-status').classList.add('game-status-play');
    document.querySelector('#btn-restart').classList.add('btn-restart-enabled');
    document
      .querySelector('#text-tracking')
      .classList.remove('text-tracking-disabled');
  });
}

function restartEvent(DOM_inputGameLevel) {
  const DOM_btnRestart = document.querySelector('#btn-restart');

  DOM_btnRestart.addEventListener('click', () => {
    DOM_inputGameLevel.forEach(level => {
      level.disabled = false;
      getTimer();
    });

    document.querySelector('#input-guess').value = null;

    disableElements(['btn-play'], false);
    disableElements(['btn-restart', 'btn-check', 'input-guess'], true);

    window.location.reload();
  });
}

function checkEvent() {
  const DOM_btnCheck = document.querySelector('#btn-check');

  DOM_btnCheck.addEventListener('click', () => {
    const DOM_inputGuess = document.querySelector('#input-guess');
    const DOM_textTracking = document.querySelector('#text-tracking');
    const guessValue = Number(DOM_inputGuess.value);

    if (guessValue >= minValue && guessValue <= game[gameLevel].value) {
      attempts++;
      updateTextAttempts();

      if (game[gameLevel].tracking) {
        tracking.push(guessValue);
        DOM_textTracking.textContent = tracking;
      } else {
        DOM_textTracking.textContent = 'N/A';
      }

      switch (true) {
        case theNumber === guessValue:
          clearInterval(countdown);
          disableElements(['btn-check', 'input-guess'], true);

          document
            .querySelector('#btn-check')
            .classList.remove('.btn-check-enabled');

          let finalResult = attempts;
          let finalTime = game[gameLevel].timer.value - timer;

          let victoryMessage = `Victory! ${attempts}/${game[gameLevel].attempts}`;

          if (gameLevel != 'easy')
            victoryMessage += ` in ${getTimerForBestResults(finalTime)}`;

          if (isWebStorageSupported()) {
            let localStorage_BestResult =
              localStorage[`GTN_${gameLevel}_BestResult`];

            let localStorage_BestTime =
              localStorage[`GTN_${gameLevel}_BestTime`];

            if (
              (!Number(localStorage_BestResult) &&
                !Number(localStorage_BestTime)) ||
              (localStorage_BestResult >= finalResult &&
                localStorage_BestTime >= finalTime)
            ) {
              localStorage[`GTN_${gameLevel}_BestResult`] = finalResult;
              localStorage[`GTN_${gameLevel}_BestTime`] = finalTime;
              victoryMessage += ' (New Record)';
            } else {
              finalResult = localStorage[`GTN_${gameLevel}_BestResult`];
              finalTime = localStorage[`GTN_${gameLevel}_BestTime`];
            }
          }

          const DOM_textBestResult =
            document.querySelector('#text-best-result');

          if (gameLevel !== 'easy') {
            DOM_textBestResult.textContent = `${finalResult}/${
              game[gameLevel].attempts
            } in ${getTimerForBestResults(finalTime)}`;
          } else {
            DOM_textBestResult.textContent = `${finalResult}/${game[gameLevel].attempts}`;
          }

          updateTextMessage(victoryMessage);
          updateTextTimerAfterVictory(finalTime);

          break;

        case theNumber > guessValue:
          updateTextMessage('The number is higher');
          document.querySelector('#input-guess').focus();
          checkGameOver();
          break;
        case theNumber < guessValue:
          updateTextMessage('The number is lower');
          document.querySelector('#input-guess').focus();
          checkGameOver();
          break;
        default:
      }
    } else {
      updateTextMessage(
        `Choose a number between ${minValue} and ${game[gameLevel].value}`
      );
    }
  });
}

function inputGuessEvent() {
  const DOM_inputGuess = document.querySelector('#input-guess');

  DOM_inputGuess.addEventListener('input', () => {
    document.querySelector('#text-message').textContent = null;
  });

  DOM_inputGuess.addEventListener('keyup', event => {
    const enterKey = 13;

    if (event.keyCode === enterKey) {
      event.preventDefault();
      document.querySelector('#btn-check').click();
    }
  });
}

function getTheRandomNumber() {
  return (
    Math.floor(
      Math.random() * (Number(game[gameLevel].value) - Number(minValue))
    ) + Number(minValue)
  );
}

function disableElements(elements, disabled) {
  elements.forEach(el => {
    if (document.querySelector(`#${el}`))
      document.querySelector(`#${el}`).disabled = disabled;
  });
}

function checkGameOver(timeIsUp) {
  if (game[gameLevel].attempts - attempts === 0 || timeIsUp) {
    document.querySelector('#btn-check').classList.remove('btn-check-enabled');
    disableElements(['btn-check', 'input-guess'], true);
    clearInterval(countdown);

    document.querySelector('#btn-check').classList.remove('.btn-check-enabled');

    if (game[gameLevel].attempts - attempts === 0)
      updateTextMessage('Game Over! No attempts remaining!');
    else updateTextMessage('Game Over! Time is up!');
  }
}

function updateTextBestResult() {
  const DOM_textBestResult = document.querySelector('#text-best-result');

  if (gameLevel !== 'easy') {
    DOM_textBestResult.textContent =
      isWebStorageSupported() && localStorage[`GTN_${gameLevel}_BestResult`] > 0
        ? `${localStorage[`GTN_${gameLevel}_BestResult`]}/${
            game[gameLevel].attempts
          } in ${getTimerForBestResults()}`
        : 'N/A';
  } else {
    DOM_textBestResult.textContent =
      isWebStorageSupported() && localStorage[`GTN_${gameLevel}_BestResult`] > 0
        ? `${localStorage[`GTN_${gameLevel}_BestResult`]}/${
            game[gameLevel].attempts
          }`
        : 'N/A';
  }
}

function updateTextAttempts() {
  document.querySelector(
    '#text-attempts'
  ).textContent = `${attempts}/${game[gameLevel].attempts}`;
}

function updateTextMessage(msg) {
  document.querySelector('#text-message').textContent = msg;
}

function getTimer() {
  let minutes, seconds;
  const DOM_textTimer = document.querySelector('#text-timer');

  if (game[gameLevel].timer.enabled) {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    DOM_textTimer.textContent = `${minutes}:${seconds}`;

    if (--timer < 0) checkGameOver(true);
  } else {
    DOM_textTimer.textContent = 'N/A';
  }
}

function getTimerForBestResults(finalTime) {
  let timer, minutes, seconds;
  timer = finalTime ? finalTime : localStorage[`GTN_${gameLevel}_BestTime`];

  minutes = parseInt(timer / 60, 10);
  seconds = parseInt(timer % 60, 10);

  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return `${minutes}:${seconds}`;
}

function updateTextTimerAfterVictory(finalTime) {
  let timer, minutes, seconds;
  timer = game[gameLevel].timer.value - finalTime;

  minutes = parseInt(timer / 60, 10);
  seconds = parseInt(timer % 60, 10);

  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  document.querySelector('#text-timer').textContent =
    gameLevel !== 'easy' ? `${minutes}:${seconds}` : 'N/A';
}

function updateTextTracking() {
  const DOM_textTracking = document.querySelector('#text-tracking');

  DOM_textTracking.textContent = !game[gameLevel].tracking ? 'N/A' : null;
  DOM_textTracking.classList.add('text-tracking-disabled');
}
