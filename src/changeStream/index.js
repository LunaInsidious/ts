const mongoose = require("mongoose");

async function main() {
  try {
    // MongoDBコンテナのホスト名は docker-compose.yml で定義したサービス名 "mongo"
    // await mongoose.connect("mongodb://mongo:27017/test");
    await mongoose.connect('mongodb://root:example@mongo:27017/test?authSource=admin');
    console.log("MongoDBに接続しました");

    // シンプルなスキーマ・モデルの定義
    const TestSchema = new mongoose.Schema({
      name: String,
    });
    const TestModel = mongoose.model("Test", TestSchema);

    // Change Stream を作成（コレクション単位で監視）
    const changeStream = TestModel.watch();

    changeStream.on("change", (change) => {
      console.log("Change detected:", change);
    });

    // 変更を発生させるために、ドキュメントの作成
    const doc = await TestModel.create({ name: "Alice" });
    console.log("ドキュメントを作成:", doc);
  } catch (err) {
    console.error("エラー:", err);
  }
}

main();
