// import fs from "node:fs";

// const writeStream = fs.createWriteStream("./src/stream-write-after-end/index.html");

// writeStream.end()

// writeStream.write('This will cause an error.');

const { Readable, Writable, PassThrough } = require('stream');

// テスト用のReadableストリームを遅延してデータを送信する形で作成
class SlowReadable extends Readable {
    constructor(data: string[], delay: number) {
        super();
        this.data = data;
        this.delay = delay;
    }

    _read() {
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

// 途中まで書き込むためのWritableストリーム
const firstWritable = new Writable({
    write(chunk: { toString: () => any; }, _encoding: any, callback: () => void) {
        console.log(`First writable received: ${chunk.toString()}`);
        callback();
    }
});

// 新しい書き込み先のWritableストリーム
const secondWritable = new Writable({
    write(chunk: { toString: () => any; }, _encoding: any, callback: () => void) {
        console.log(`Second writable received: ${chunk.toString()}`);
        callback();
    }
});

// パイプの途中で分岐するためのPassThroughストリーム
const passThrough = new PassThrough();

// 最初のWritableにパイプ
readable.pipe(passThrough).pipe(firstWritable);

// 一定時間後に新しいWritableにパイプ
setTimeout(() => {
    console.log('Piping to second writable');
    passThrough.pipe(secondWritable);
}, 1000);
