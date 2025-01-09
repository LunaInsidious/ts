const https = require("https");
const fs = require("fs");

const options = {
  cert: fs.readFileSync(`${__dirname}/akidokoro.jp.pem`),
  key: fs.readFileSync(`${__dirname}/akidokoro.jp-key.pem`),
};

https
  .createServer(options, (req: any, res: any) => {
    res.writeHead(200);
    res.end(`HTTPS using ${req.headers.host}\n`);
  })
  .listen(8443); // 管理者権限なしでhttps通信の例を示したいので、8443としています。
