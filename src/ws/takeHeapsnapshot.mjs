import fs from "node:fs";

const [arg1, outPath] = process.argv.slice(2);
if (!arg1 || !outPath) {
  console.error(
    "Usage: node take-heapsnapshot.mjs <HOST:PORT | http://HOST:PORT> <out.heapsnapshot>",
  );
  process.exit(2);
}

const base = arg1.startsWith("http") ? arg1 : `http://${arg1}`;

// チューニング用パラメータ（大きいヒープなら増やす）
const IDLE_MS = 2000; // 最後の chunk 受信からこの時間だけ静かなら終了扱い
const OVERALL_TIMEOUT_MS = 10 * 60 * 1000; // 10分で強制打ち切り

async function discoverWsUrl() {
  const res = await fetch(`${base}/json/list`);
  if (!res.ok)
    throw new Error(
      `GET ${base}/json/list failed: ${res.status} ${res.statusText}`,
    );
  const list = await res.json();
  const target = list.find((t) => t.webSocketDebuggerUrl) ?? list[0];
  if (!target?.webSocketDebuggerUrl)
    throw new Error("webSocketDebuggerUrl not found");
  return target.webSocketDebuggerUrl;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const wsUrl = await discoverWsUrl();

  const ws = new WebSocket(wsUrl);

  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  const out = fs.createWriteStream(outPath, { encoding: "utf8" });

  let nextId = 0;

  // takeHeapSnapshot の「id 応答」を待つため
  let takeId = 0;
  let takeAck = false;

  // chunk を受信した最終時刻
  let lastChunkAt = 0;

  // 受信量チェック（壊れた/空の出力の検出に使う）
  let totalBytes = 0;
  let chunkCount = 0;

  function send(method, params) {
    const id = ++nextId;
    ws.send(JSON.stringify({ id, method, params }));
    return id;
  }

  ws.addEventListener("message", (ev) => {
    const text = typeof ev.data === "string" ? ev.data : ev.data.toString();
    let msg;
    try {
      msg = JSON.parse(text);
    } catch {
      return;
    }

    // takeHeapSnapshot の応答（idが一致）
    if (msg.id && msg.id === takeId) {
      takeAck = true;
      return;
    }

    // heapsnapshot の chunk
    if (msg.method === "HeapProfiler.addHeapSnapshotChunk") {
      const chunk = msg.params?.chunk;
      if (typeof chunk === "string" && chunk.length > 0) {
        out.write(chunk);
        lastChunkAt = Date.now();
        totalBytes += Buffer.byteLength(chunk, "utf8");
        chunkCount += 1;
      }
      return;
    }

    // 進捗イベントが来る環境なら、ここで done/total を見て終了判定もできる（任意）
    // if (msg.method === "HeapProfiler.reportHeapSnapshotProgress") { ... }
  });

  // 開始
  send("HeapProfiler.enable", {});
  takeId = send("HeapProfiler.takeHeapSnapshot", { reportProgress: false });

  const startedAt = Date.now();
  // overall timeout 監視
  while (true) {
    const now = Date.now();

    if (now - startedAt > OVERALL_TIMEOUT_MS) {
      ws.close();
      out.end();
      throw new Error(
        `Timeout: snapshot did not finish within ${OVERALL_TIMEOUT_MS}ms`,
      );
    }

    // takeAck が来ていて、かつ chunk を1回以上受け取っていて、かつアイドル時間がIDLE_MS超え → 終了扱い
    if (
      takeAck &&
      chunkCount > 0 &&
      lastChunkAt > 0 &&
      now - lastChunkAt > IDLE_MS
    ) {
      break;
    }

    await sleep(100);
  }

  // 後処理：少しだけ待ってwrite streamを落ち着かせる（必須ではないが安全側）
  await sleep(100);

  out.end();
  await new Promise((resolve) => out.on("finish", resolve));
  ws.close();

  // 目安チェック：異常に小さい場合は失敗扱いにしてもよい
  if (totalBytes < 1024 * 1024) {
    // 1MB未満はかなり怪しい
    console.error(
      `Warning: output is small (${(totalBytes / 1024).toFixed(2)} KiB). Snapshot may be incomplete.`,
    );
  }

  console.log(
    `Wrote ${outPath} (${chunkCount} chunks, ${(totalBytes / (1024 * 1024)).toFixed(2)} MiB)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
