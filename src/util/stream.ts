import { Readable } from "node:stream";

export const stringToStream = (
  str: string,
  chunkSize: number = str.length,
): NodeJS.ReadableStream => {
  let currentIndex = 0;

  return new Readable({
    read() {
      if (currentIndex < str.length) {
        const chunk = str.slice(currentIndex, currentIndex + chunkSize);
        currentIndex += chunkSize;
        this.push(chunk);
      } else {
        this.push(null); // ストリームの終了を示す
      }
    },
  });
};

console.log(stringToStream("Hello, World!"));
