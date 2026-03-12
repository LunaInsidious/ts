import { Duplex, Readable } from "node:stream";
import { once } from "node:events";

function createDelayedReadableEndStream({ delayMs = 1000, text = "delayed-readable-end" } = {}) {
  let started = false;
  return new Readable({
    read() {
      if (started) {
        return;
      }
      started = true;
      this.push(text);
      setTimeout(() => {
        this.push(null);
      }, delayMs);
    },
  });
}

function createDelayedDuplexEndStream({
  readableDelayMs = 1000,
  writableDelayMs = readableDelayMs,
  text = "delayed-duplex-end",
} = {}) {
  let started = false;
  const stream = new Duplex({
    read() {
      if (started) {
        return;
      }
      started = true;
      this.push(text);
      setTimeout(() => {
        this.push(null);
      }, readableDelayMs);
    },
    write(_chunk, _encoding, callback) {
      callback();
    },
    final(callback) {
      setTimeout(callback, writableDelayMs);
    },
  });

  stream.end();
  return stream;
}

function observeStream(label, stream, startAt) {
  const log = (event, detail = "") => {
    const elapsedMs = Date.now() - startAt;
    const suffix = detail === "" ? "" : ` ${detail}`;
    console.log(`[${label}] +${elapsedMs}ms ${event}${suffix}`);
  };

  stream.on("data", (chunk) => {
    log("data", JSON.stringify(chunk.toString()));
  });
  stream.on("end", () => {
    log("end");
  });
  stream.on("finish", () => {
    log("finish");
  });
  stream.on("close", () => {
    log("close");
  });
  stream.on("error", (error) => {
    log("error", error instanceof Error ? error.message : String(error));
  });
}

async function runReadableDemo() {
  console.log("=== delayedReadableEndStream ===");
  const startAt = Date.now();
  const stream = createDelayedReadableEndStream({ delayMs: 1500 });
  observeStream("readable", stream, startAt);
  stream.resume();
  await once(stream, "end");
  console.log("");
}

async function runDuplexDemo() {
  console.log("=== delayedDuplexEndStream ===");
  const startAt = Date.now();
  const stream = createDelayedDuplexEndStream({
    readableDelayMs: 1500,
    writableDelayMs: 2500,
  });
  observeStream("duplex", stream, startAt);
  stream.resume();
  await Promise.all([once(stream, "end"), once(stream, "finish")]);
  console.log("");
}

async function main() {
  await runReadableDemo();
  await runDuplexDemo();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
