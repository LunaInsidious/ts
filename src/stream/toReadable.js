import { Readable } from "node:stream";
import tar from "tar-stream";

const logStreamEvents = (name, stream) => {
  for (const event of ["data", "end", "close", "finish", "error"]) {
    stream.on(event, (...args) => {
      if (event === "data") {
        const [chunk] = args;
        console.log(`[${name}] data`, {
          length: Buffer.byteLength(chunk),
        });
        return;
      }

      if (event === "error") {
        const [error] = args;
        console.error(`[${name}] error`, error);
        return;
      }

      console.log(`[${name}] ${event}`);
    });
  }
};

async function main() {
  const pack = tar.pack();

  console.log("pack properties", {
    readable: !!pack.readable,
    hasPipe: typeof pack.pipe === "function",
    hasAsyncIterator: !!pack[Symbol.asyncIterator],
    isReadable: pack instanceof Readable,
  });

  logStreamEvents("pack", pack);

  pack.entry({ name: "hello.txt" }, "hello");
  pack.entry({ name: "nested/world.txt" }, "world");
  pack.finalize();

  // const wrapped = Readable.from(pack);にすると安定する
  const wrapped = new Readable().wrap(pack);

  console.log("wrapped properties", {
    readable: !!wrapped.readable,
    hasPipe: typeof wrapped.pipe === "function",
    hasAsyncIterator: !!wrapped[Symbol.asyncIterator],
    isReadable: wrapped instanceof Readable,
  });

  logStreamEvents("wrapped", wrapped);

  let totalBytes = 0;

  try {
    for await (const chunk of wrapped) {
      totalBytes += Buffer.byteLength(chunk);
    }

    console.log("wrapped stream consumed successfully", { totalBytes });
  } catch (error) {
    console.error("wrapped stream consumption failed", error);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("unexpected failure", error);
  process.exitCode = 1;
});
