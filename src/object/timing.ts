import { delay } from "../util/delay.js";

type Test = {
  a: number;
  b: string;
};

const func = async (obj: Test) => {
  console.log("start");
  await delay(1000);
  console.log(`a: ${obj.a}, b: ${obj.b}`);
};

const testObj: Test = { a: 42, b: "hello" };

func(testObj);

testObj.a = 100;
testObj.b = "world";
console.log("updated");
func(testObj);

const func2 = async (a: number) => {
  console.log("func2 start");
  await delay(500);
  console.log(`func2 a: ${a}`);
};

let a = 5;
func2(a);
a = 10;
console.log("func2 updated");
func2(a);
