import http from "node:http";
import https from "node:https";

const HTTP_AGENT = new http.Agent({
  keepAlive: false,
});
const HTTPS_AGENT = new https.Agent({
  keepAlive: false,
});

const abortController = new AbortController();

const url = "http://example.com";

const isHttps = url.startsWith("https:");

const options: http.RequestOptions = {
  method: "POST",
  signal: abortController.signal,
  headers: {
    Connection: "close",
  },
  agent: isHttps ? HTTPS_AGENT : HTTP_AGENT,
};

console.log(isHttps);

const req = isHttps ? https.request(url, options) : http.request(url, options);

console.log({
  protocol: req.protocol,
  host: req.host,
  method: req.method,
  path: req.path,
});
