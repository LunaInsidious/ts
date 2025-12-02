import { input, select } from "@inquirer/prompts";

input({ message: "Enter your name: " })
  .then((name) => {
    console.log(`Hello, ${name}!`);
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });

select({
  message: "Select a fruit:",
  choices: [
    { name: "Apple", value: "apple" },
    { name: "Banana", value: "banana" },
    { name: "Orange", value: "orange" },
  ],
})
  .then((fruit) => {
    console.log(`You selected: ${fruit}`);
  })
  .catch((error) => {
    console.error("An error occurred:", error);
  });
