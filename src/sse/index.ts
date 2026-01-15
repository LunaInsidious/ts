import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";

const app = new Hono();

app.get("/", (c) => c.text("ok"));

app.get("/sse", (c) => {
  return streamSSE(c, async (stream) => {
    let id = 0;
    let closed = false;
    let timer: NodeJS.Timeout | null = null;
    let keepAlive: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (closed) return;
      closed = true;
      if (timer) clearInterval(timer);
      if (keepAlive) clearInterval(keepAlive);
    };

    const send = async () => {
      await stream.writeSSE({ id: String(id), data: `tick ${id}` });
      id += 1;
    };

    timer = setInterval(() => {
      void send();
    }, 1000);
    keepAlive = setInterval(() => {
      void stream.write(": keep-alive\n\n");
    }, 15000);

    stream.onAbort(() => {
      cleanup();
    });

    await send();
    await new Promise<void>((resolve) => {
      stream.onAbort(() => resolve());
    });
    cleanup();
  });
});

const port = Number(process.env.PORT ?? 3000);

serve({ fetch: app.fetch, port });
console.log(`SSE server listening on http://localhost:${port}`);
