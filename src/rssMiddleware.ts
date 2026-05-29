import type { Middleware } from "waku/config";
import { buildRssFeed } from "./shared/rss";

function stringToStream(value: string) {
  const encoded = new TextEncoder().encode(value);

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    },
  });
}

const rssMiddleware: Middleware = () => {
  return async (ctx, next) => {
    if (
      (ctx.req.method === "GET" || ctx.req.method === "HEAD") &&
      ctx.req.url.pathname === "/rss.xml"
    ) {
      const rss = await buildRssFeed();
      ctx.res.status = 200;
      ctx.res.headers = {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      };
      if (ctx.req.method === "GET") {
        ctx.res.body = stringToStream(rss);
      }
      return;
    }

    await next();
  };
};

export default rssMiddleware;
