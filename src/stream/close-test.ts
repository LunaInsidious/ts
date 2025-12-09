// 標準入力で読み込んだパスのデータをstreamで読み込んで、resumeで閉じるのを確認するテスト
import fs from "node:fs";
import process from "node:process";
import type { Readable } from "node:stream";

// pathは標準入力から読み込む
const chunks: string[] = [];
process.stdin.on("data", (chunk: string) => {
  chunks.push(chunk);
});
await new Promise<void>((resolve) => {
  process.stdin.on("end", () => {
    resolve();
  });
});
const testPath = fs.realpathSync(chunks.join("").trim());
console.log(`Test path: ${testPath}`);

const initialMemoryUsage = process.memoryUsage();
console.log("Initial memory usage:", initialMemoryUsage);
fs.appendFileSync(
  "memory-usage.log",
  `Initial Memory Usage: RSS: ${initialMemoryUsage.rss}, Heap Total: ${initialMemoryUsage.heapTotal}, Heap Used: ${initialMemoryUsage.heapUsed}, External: ${initialMemoryUsage.external}\n`,
);

const processStream = async (stream: Readable, i: number) => {
  return new Promise<void>((resolve, reject) => {
    stream.resume(); // ストリームを開始

    stream.on("end", () => {
      console.log(`Stream ended: ${i}`);
      resolve();
    });

    stream.on("close", () => {
      console.log(`Stream closed: ${i}`);
    });

    stream.on("error", (err) => {
      console.error(`Stream error: ${i}`, err);
      reject(err);
    });
  });
};

for (let i = 0; i < 1e7; i++) {
  console.log(`--- Iteration ${i + 1} ---`);
  // 新しいストリームを作成して処理
  const newStream = fs.createReadStream(testPath);
  await processStream(newStream, i + 1);
  if ((i + 1) % 1000 === 0) {
    console.log(`Processed ${i + 1} streams`);
    // ログファイルにメモリ使用量を書き出し
    const memoryUsage = process.memoryUsage();
    const diff = {
      rss: memoryUsage.rss - initialMemoryUsage.rss,
      heapTotal: memoryUsage.heapTotal - initialMemoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed - initialMemoryUsage.heapUsed,
      external: memoryUsage.external - initialMemoryUsage.external,
    };
    const logData = `Iteration: ${i + 1}, RSS: ${diff.rss}, Heap Total: ${diff.heapTotal}, Heap Used: ${diff.heapUsed}, External: ${diff.external}\n`;
    fs.appendFileSync("memory-usage.log", logData);
    // sleep 1s
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
