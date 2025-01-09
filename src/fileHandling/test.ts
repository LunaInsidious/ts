import fs from "node:fs";

const readFilePromise = (filePath: string) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err: unknown, data: any) => {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

readFilePromise('/path/to/file.txt')
    .then(data => {
        console.log(data);
    })
    .catch(err => {
        if (err.code === 'ENOENT') {
            console.error('ファイルが存在しません:', err);
            // エラー処理を実行
        } else {
            console.error(err);
        }
    });
