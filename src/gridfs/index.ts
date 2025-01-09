import mongoose from "mongoose";
import { useMongo } from "../util/mongo";
import { Readable, pipeline } from "node:stream";


// DIした結果
const db = useMongo();

const main = async () => {
    await new Promise((resolve) => {
        db.once("open", resolve);
    });
    if (db.db == null) return;

    const bucket = new mongoose.mongo.GridFSBucket(db.db);

    // テスト用のデータを生成
    class SlowReadable extends Readable {
        data: string[];
        delay: number;
        constructor(data: string[], delay: number) {
            super();
            this.data = data;
            this.delay = delay;
        }

        override _read() {
            if (this.data.length === 0) {
                this.push(null); // データの終了
                return;
            }
            const chunk = this.data.shift();
            setTimeout(() => this.push(chunk), this.delay);
        }
    }

    // 遅延を追加したReadableストリーム
    const readable = new SlowReadable(['Chunk1\n', 'Chunk2\n', 'Chunk3\n'], 500);

    // GridFSの書き込みストリームを作成
    const uploadStream = bucket.openUploadStream('test-file-pipeline.txt');

    uploadStream.on("finish", () => {
        console.log('Upload stream finished');
    })

    // 途中でストリームをdestroy
    setTimeout(() => {
        console.log('Destroying upload stream...');
        uploadStream.destroy(new Error('Stream destroyed manually'));
    }, 750);

    // パイプライン処理
    try {
        pipeline(
            readable,
            uploadStream, (err) => {
                if (err) {
                    console.error('Pipeline error:', err);
                }
            });
        console.log('Pipeline completed successfully');
    } catch (err) {
        console.error('Pipeline error:', err);
    }

    // 終了処理
    setTimeout(() => {
        console.log('Closing connection...');
        db.close();
    }, 200);
}

main()
