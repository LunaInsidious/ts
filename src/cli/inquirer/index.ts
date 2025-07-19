import { input } from "@inquirer/prompts";

input({ message: "Enter your name: " })
  .then((name) => {
    console.log(`Hello, ${name}!`);
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
