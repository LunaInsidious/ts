import { createServer } from "net";

const address = "localhost";
const port = 8080;

const html = `<html><body><h1>Hello, Alpha</h1><a href="second.html">second</a></body></html>`;
const html2 =
  '<html><body><form method="POST" action="/post">' +
  '<input type="text" name="value"><input type="submit"></form>' +
  "</body></html>";

const server = createServer((socket) => {
  const clientAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`connect from ${clientAddress}`);
  socket.setEncoding("utf-8");
  socket.on("data", (data: string) => {
    console.log(data);
    // https://ja.wikipedia.org/wiki/Hypertext_Transfer_Protocol
    // 上のサーバーのレスポンス
    socket.write("HTTP/1.1 200 OK\n");
    socket.write("\n");
    if (data.indexOf("GET / ") === 0) {
      socket.write(html);
    } else if (data.indexOf("POST /post ") === 0) {
      const value = data.substring(data.indexOf("\n\r\n") + 9);
      console.log(value);
      socket.write(`<html><body><h1>Hello, ${value}</h1></body></html>`);
    } else {
      socket.write(html2);
    }
    socket.destroy();
  });
  socket.on("close", () => {
    console.log(`disconnect from ${socket.remoteAddress}:${socket.remotePort}`);
  });
});

const options = {
  host: address,
  port: port,
};

server.listen(options, () => {
  console.log(`Server is listening on ${address}:${port}`);
});
