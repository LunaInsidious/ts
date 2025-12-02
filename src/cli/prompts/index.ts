import prompts from "prompts";

const choices: prompts.Choice[] = [
  { title: "Apple", value: "apple" },
  { title: "Banana", value: "banana" },
  { title: "Orange", value: "orange" },
];

(async () => {
  const response = await prompts({
    type: "autocompleteMultiselect",
    choices: choices,
    name: "value",
    message: "How old are you?",
    validate: (value: any) => (value < 18 ? `Nightclub is 18+ only` : true),
  });

  console.log(response); // => { value: 24 }
})();
