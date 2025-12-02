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
  {
    type: "select",
    name: "fruit",
    message: "Select a fruit:",
    choices: [
      { name: "Apple", value: "apple" },
      { name: "Banana", value: "banana" },
      { name: "Orange", value: "orange" },
    ],
  },
  {
    type: "confirm",
    name: "confirm",
    message: "Do you want to proceed?",
    initial: true,
  },
];

prompt(questions).then((answer) => {
  console.log(answer);
});
