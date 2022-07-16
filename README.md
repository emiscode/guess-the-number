# GUESS THE NUMBER
### Guess The Number is a fun game that challenges you to find a number within a pre-defined range, and gives you hints along the way based on a greater or less mechanic.

There are three different levels of play that vary the range of numbers, and adds or removes some game mechanics, such as a timer, a tracking for the numbers that you already choose, and the amount of attempts you may spend trying to guess the number.

[DEMO](https://emiscode-guess-the-number.herokuapp.com/)

run local with docker:

```bash
docker build . -t guess-the-number
```

```bbash
docker run -d -p 8090:80 guess-the-number
```

In the browser go to http://localhost:8090
