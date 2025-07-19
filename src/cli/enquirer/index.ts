import { prompt } from "enquirer";

const questions = [
  {
    type: "autocomplete",
    multiple: true,
    choices: ["apple", "banana", "orange"],
    name: "username",
    message: "What is your username?",
  },
  {
    type: "password",
    name: "password",
    initial: "defaultPassword",
    message: "What is your password?",
  },
];

prompt(questions).then((answer) => {
  console.log(answer);
});
