"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var net_1 = require("net");
var address = "localhost";
var port = 8080;
var html = "<html><body><h1>Hello, Alpha</h1><a href=\"second.html\">second</a></body></html>";
var html2 = '<html><body><form method="POST" action="/post">' +
    '<input type="text" name="value"><input type="submit"></form>' +
    "</body></html>";
var server = (0, net_1.createServer)(function (socket) {
    var clientAddress = "".concat(socket.remoteAddress, ":").concat(socket.remotePort);
    console.log("connect from ".concat(clientAddress));
    socket.setEncoding("utf-8");
    socket.on("data", function (data) {
        console.log(data);
        // https://ja.wikipedia.org/wiki/Hypertext_Transfer_Protocol
        // 上のサーバーのレスポンス
        socket.write("HTTP/1.1 200 OK\n");
        socket.write("\n");
        if (data.indexOf("GET / ") === 0) {
            socket.write(html);
        }
        else if (data.indexOf("POST /post ") === 0) {
            var value = data.substring(data.indexOf("\n\r\n") + 9);
            console.log(value);
            socket.write("<html><body><h1>Hello, ".concat(value, "</h1></body></html>"));
        }
        else {
            socket.write(html2);
        }
        socket.destroy();
    });
    socket.on("close", function () {
        console.log("disconnect from ".concat(socket.remoteAddress, ":").concat(socket.remotePort));
    });
});
var options = {
    host: address,
    port: port,
};
server.listen(options, function () {
    console.log("Server is listening on ".concat(address, ":").concat(port));
});
