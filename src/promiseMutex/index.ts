import { Semaphore } from "async-mutex";
import { delay } from "../util/delay";

const semaphore = new Semaphore(10);

const execSemaphore = async () => {
  return semaphore.runExclusive<string>(async (value) => {
    console.log(`exclusive: ${value}/10`);
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        console.log(`resolved: ${value}`);
        resolve(`${value}`);
      }, 5000);
    });
  });
};

const main = async () => {
  console.log("Hello World");

  await delay(1000);

  console.log("delayed");

  [...Array(20)].forEach(execSemaphore);
};

main().then((value) => {
  console.log(value);
});
