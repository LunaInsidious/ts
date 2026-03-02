import tar from "tar-stream";
import { finished } from "node:stream/promises";

async function waitTarPackFinalize(pack, timeoutMs = 1000) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  try {
    // Keep the readable side flowing, otherwise backpressure can prevent completion.
    pack.resume();
    await finished(pack, {
      readable: false,
      writable: true,
      signal: ac.signal,
    });
    return "finalized";
  } catch (err) {
    if (ac.signal.aborted) return "timeout";
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function noHangCase() {
  const pack = tar.pack();

  pack.entry({ name: "a.txt" }, "hello", (err) => {
    if (err) throw err;
    pack.finalize();
  });

  const result = await waitTarPackFinalize(pack, 1000);
  console.log("[finalize-called]", result);
}

async function hangCase() {
  const pack = tar.pack();

  pack.entry({ name: "a.txt" }, "hello", (err) => {
    if (err) throw err;
    // Intentionally not calling finalize().
  });

  const result = await waitTarPackFinalize(pack, 1000);
  console.log("[finalize-not-called]", result);
}

async function main() {
  console.log("node =", process.version);
  await noHangCase();
  await hangCase();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
