import { pipeline } from "node:stream";
import { Readable, Writable } from "node:stream";

// 途中で意図的に自分自身を破壊する書き込みストリーム
class SelfDestructStream extends Writable {
  writes: number;
  constructor() {
    super();
    this.writes = 0;
  }

  override _write(_: any, __: any, callback: () => void) {
    this.writes++;
    console.log(`書き込み中... (${this.writes}回目)`);

    if (this.writes === 3) {
      console.log("💥 書き込みストリームが意図せず終了します...");
      // エラーを渡さずにストリームを破壊する
      this.destroy();
    } else {
      // 処理を少し遅延させて、非同期性を表現
      setTimeout(callback, 50);
    }
  }
}

async function main() {
  // 十分な量のデータを持つ読み込みストリーム
  const sourceData = Array(10).fill("some data\n");
  const sourceStream = Readable.from(sourceData);
  const destStream = new SelfDestructStream();

  console.log("パイプライン処理を開始します。");
  pipeline(sourceStream, destStream, (err) => {
    if (err) {
      console.error("❌ パイプラインでエラーが発生しました:", err);
    } else {
      console.log("✅ パイプラインが正常に完了しました。");
    }
  });
  destStream.on("error", (err) => {
    console.error("❌ 書き込みストリームでエラーが発生しました:", err);
    sourceStream.destroy(err);
  });
}

main();
