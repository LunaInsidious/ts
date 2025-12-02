import { PassThrough, Writable } from "node:stream";

// PassThroughストリームを作成
const passThrough = new PassThrough();

// 1つ目のWritableストリーム
const writable1 = new Writable({
  write(chunk: { toString: () => any }, _encoding: any, callback: () => void) {
    console.log(`Writable 1 received: ${chunk.toString()}`);
    callback();
  },
});

// 2つ目のWritableストリーム
const writable2 = new Writable({
  write(chunk: { toString: () => any }, _encoding: any, callback: () => void) {
    console.log(`Writable 2 received: ${chunk.toString()}`);
    callback();
  },
});

passThrough.write("Hello, World!\n");
passThrough.write("Another message.\n");
passThrough.pipe(writable1);
passThrough.on("data", () => {
  console.log(passThrough.readableLength, passThrough.writableLength);
  console.log(passThrough);
});
passThrough.pipe(writable2);
console.log(passThrough.readableLength, passThrough.writableLength);
passThrough.end();
