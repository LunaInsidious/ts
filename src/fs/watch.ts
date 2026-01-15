import { watch, readFileSync } from "node:fs";

// ファイルの変更を監視するパス
const filePath = `${process.cwd()}/watched.jon`;
try {
  const watcher = watch(filePath, (eventType, filename) => {
    if (filename) {
      console.log(
        `ファイルが変更されました: ${filename} - イベントタイプ: ${eventType}`,
      );
    } else {
      console.log(`ファイルが変更されました - イベントタイプ: ${eventType}`);
    }
    // 変更されたファイルの内容を読み取る
    try {
      const data = readFileSync(filePath, "utf-8");
      console.log(`新しい内容: ${data}`);
    } catch (err) {
      console.error(`ファイルの読み取り中にエラーが発生しました: ${err}`);
    }
  });
  // エラーハンドリング
  watcher.on("error", (error) => {
    console.error(`監視中にエラーが発生しました: ${error}`);
  });
} catch (err) {
  console.error(`ファイルの監視中にエラーが発生しました: ${err}`);
}

console.log(`監視を開始しました: ${filePath}`);
