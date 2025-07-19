import { prompt } from "enquirer";

prompt({
  type: "input",
  name: "username",
  message: "What is your username?",
}).then((answer: any) => {
  console.log(`Hello, ${answer.username}!`);
});
