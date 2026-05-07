import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { authenticateRequest } from "./kimi/auth";
import { PRIVATE_UPLOAD_DIR } from "./upload-router";
import { readFile } from "fs/promises";
import path from "path";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 15 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

app.get("/api/private-files/:fileName", async (c) => {
  const user = await authenticateRequest(c.req.raw.headers).catch(() => null);
  if (!user || user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const fileName = c.req.param("fileName");
  if (!/^(attestation|idCard)-[a-f0-9-]+\.(pdf|jpg|jpeg|png)$/i.test(fileName)) {
    return c.json({ error: "Invalid file name" }, 400);
  }

  const filePath = path.join(PRIVATE_UPLOAD_DIR, fileName);
  if (!filePath.startsWith(PRIVATE_UPLOAD_DIR + path.sep)) {
    return c.json({ error: "Invalid file path" }, 400);
  }

  try {
    const data = await readFile(filePath);
    const ext = path.extname(fileName).toLowerCase();
    const contentType =
      ext === ".pdf" ? "application/pdf" : ext === ".png" ? "image/png" : "image/jpeg";
    return new Response(data, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return c.json({ error: "File not found" }, 404);
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
