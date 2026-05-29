import { defineConfig } from "waku/config";

export default defineConfig({
  middleware: () => [
    import("waku/middleware/context"),
    import("waku/middleware/dev-server"),
    import("./src/rssMiddleware"),
    import("waku/middleware/handler"),
  ],
});
