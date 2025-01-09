import mongoose from "mongoose";
import { pipeline } from "node:stream";

import { logger } from "./logger";

export function useMongo(): mongoose.Connection {
    const db = mongoose.createConnection("mongodb://root:example@localhost:27017/node-system?authSource=admin");

    db.on("open", () => {
        logger.info("mongo connection opened");
    });
    db.on("close", () => {
        logger.info("mongo connection closed");
    });
    db.on("error", (error) => {
        logger.error(`MongoDB connection error: ${error}`);
    });

    return db;
}

export function useMessageFileRepository(
    db: mongoose.Connection,
) {
    return {
        async create(
            file: NodeJS.ReadableStream,
        ): Promise<string> {
            if (db.db == null) {
                throw new Error("db.db is null");
            }
            const readStream = file
            const gridFsStorage = new mongoose.mongo.GridFSBucket(db.db);
            // GridFS にアップロード
            // file length, chunkSize, uploadDate は自動で付与されます
            const uploadStream = gridFsStorage.openUploadStream("test.txt");
            const fileIDStr = uploadStream.id.toString();
            let length = 0;
            let chunkCount = 0;
            // 書き込み中のメモリ使用量をチェック
            return new Promise((resolve, reject) => {
                readStream.on("data", async (chunk: Buffer | string | any) => {
                    if (chunkCount % 100 === 0) {
                        console.log(chunk.length)
                    }
                    length += chunk.length;
                    chunkCount += 1;
                });
                uploadStream.on("finish", async () => {
                    // eslint-disable-next-line no-underscore-dangle
                    logger.info({ fileIDStr, length }, "File uploaded");
                    resolve(fileIDStr);
                });
                uploadStream.on("error", (err) => {
                    reject(err);
                });
                readStream.on("error", (err) => {
                    reject(err);
                });
                pipeline(readStream, uploadStream, (err) => {
                    if (err) {
                        reject(err);
                    }
                });
            });
        },
    };
}
