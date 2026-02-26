// repro-finished-hang.js
import { PassThrough, Readable } from "node:stream";
import { finished } from "node:stream/promises";
import streamHead from "stream-head";

const passThroughTest = async () => {
  const s = new PassThrough({ autoDestroy: false, emitClose: true });

  s.end("abc");
  s.resume();

  await new Promise((resolve) => s.once("end", resolve));

  console.log("state:", {
    readableEnded: s.readableEnded,
    writableFinished: s.writableFinished,
    readable: s.readable,
    writable: s.writable,
    destroyed: s.destroyed,
    emitClose: s._writableState.emitClose,
    autoDestroy: s._readableState.autoDestroy,
  });

  const timeout1 = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), 1000),
  );

  try {
    console.log("waiting for finished...");
    // ここが止まる（close待ちになりやすい）
    await Promise.race([finished(s), timeout1]);
    console.log("default finished: resolved");
  } catch (e) {
    console.log("default finished: pending ->", e.message);
  }

  // readable側だけ待つと解決する
  await finished(s, { readable: true, writable: false });
  console.log("readable-only finished: resolved");

  // writable側だけ待っても解決する
  await finished(s, { readable: false, writable: true });
  console.log("writable-only finished: resolved");

  const timeout2 = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), 1000),
  );

  // 両方待ったら解決しない
  // (片方だけ待つとcloseまで待たないため。)
  try {
    console.log("waiting for finished (both)...");
    await Promise.race([finished(s, { readable: true, writable: true }), timeout2]);
    console.log("both finished: resolved");
  } catch (e) {
    console.log("both finished: pending ->", e.message);
  }

  s.destroy();
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function consumeToEnd(stream) {
  stream.resume();
  await new Promise((resolve, reject) => {
    stream.once("end", resolve);
    stream.once("error", reject);
  });
}

async function createEndedStreamByStreamHead() {
  const source = Readable.from([Buffer.from("abcdef")]);
  const { stream, head } = await streamHead(source, { bytes: 3 });
  await consumeToEnd(stream);
  return { stream, head };
}

// One practical fix for stream-head/through2 streams.
async function discardStreamDataFixed(readableStream) {
  if (readableStream.readableEnded ?? readableStream._readableState?.ended) {
    return;
  }
  const streamFinished = finished(readableStream, {
    readable: true,
    writable: false,
  });
  readableStream.resume();
  await streamFinished;
}

const streamHeadTest = async () => {
  const { stream: hangStream, head: hangHead } = await createEndedStreamByStreamHead();
  console.log("[stream-head/hang] head =", Buffer.from(hangHead).toString());
  console.log("[stream-head/hang] state =", {
    readableEnded: hangStream.readableEnded ?? hangStream._readableState?.ended,
    writableFinished: hangStream.writableFinished ?? hangStream._writableState?.finished,
    readable: hangStream.readable,
    writable: hangStream.writable,
    destroyed: hangStream.destroyed,
    autoDestroy: hangStream._readableState.autoDestroy,
    emitClose: hangStream._writableState.emitClose,
  });

  try {
    await Promise.race([
      (async () => {
        const streamFinished = finished(readableStream);
        readableStream.resume();
        await streamFinished;
      })(),
      (async () => {
        await wait(1000);
        throw new Error("timeout");
      })(),
    ]);
    console.log("[stream-head/hang] unexpected: resolved");
  } catch (err) {
    console.log("[stream-head/hang] expected: pending ->", err.message);
  } finally {
    hangStream.destroy();
  }

  const { stream: okStream, head: okHead } = await createEndedStreamByStreamHead();
  console.log("[stream-head/non-hang] head =", Buffer.from(okHead).toString());
  await discardStreamDataFixed(okStream);
  console.log("[stream-head/non-hang] resolved");
  okStream.destroy();
}

const main = async () => {
  await streamHeadTest();
  await passThroughTest();
}

main().catch((e) => {
  console.error("Error in main:", e);
  process.exit(1);
});
