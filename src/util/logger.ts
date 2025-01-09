import { pino } from "pino";

const transport =
    process.env["NODE_ENV"] === "production"
        ? undefined
        : {
            target: "pino-pretty",
            options: {
                colorize: true,
            },
        };

export const logger = pino({
    enabled: !(process.env["NO_LOG"] === "true"),
    level: process.env["LOG_LEVEL"] || "info",
    base: { pid: undefined, hostname: undefined },
    timestamp: () =>
        `,"time":"${new Date(Date.now()).toLocaleString("ja-JP", {
            timeZone: "Asia/Tokyo",
        })}"`,
    transport,
});
