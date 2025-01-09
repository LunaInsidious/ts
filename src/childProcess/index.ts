import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";

/**
 * zipファイルを展開する
 * @param inputZipPath zipファイルのパス
 * @param glob zipファイル内の展開するファイルを指定するためのglob
 * @param outputDir zipファイルを展開するディレクトリ
 */
export async function unzip(
  inputZipPath: string = "offerdata_FILE_ENDED2",
  glob: string[] | undefined = [],
  outputDir: string = "offerdata_FILE_ENDED",
): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    const args = [inputZipPath, "-d", outputDir, ...(glob ?? [])];

    const unzipProcess = spawn("unzip", args);

    unzipProcess.stdout.on("data", () => {}); // spawnの文法として必要なため記入しているが、何もしない

    unzipProcess.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    unzipProcess.on("error", (error) => {
      console.error(`error: ${error}`);
      reject(error);
    });

    unzipProcess.on("close", async (code) => {
      console.log(code);
      if (code === 0) {
        try {
          const files = await readdir(outputDir);
          resolve(files);
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`unzip process exited with code ${code}`));
      }
    });
  });
}

unzip();
