import { delay } from "../util/delay.js";

const promise = async () => {
  await delay(1000);
  console.log("promise");
};

const main = async () => {
  const a = [1, 2, 3].map(() => promise());
  await Promise.all(a);
  console.log("main");
};

main();
