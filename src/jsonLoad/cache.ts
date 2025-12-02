import NodeCache from "node-cache";
import fs from "node:fs";

const cache = new NodeCache();

const main = () => {
  console.log("111111111111111111111111111", new Date());
  const data = fs.readFileSync("./src/jsonLoad/data/output.txt");
  console.log("222222222222222222222222222", new Date());
  console.log("333333333333333333333333333", new Date());
  cache.set("data", data);
  console.log("444444444444444444444444444", new Date());

  return "end";
};

main();
