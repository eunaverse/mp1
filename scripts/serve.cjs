// Preview GitHub Pages locally: serve the production build under /mp1/.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "../build");
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".vtt": "text/vtt",
  ".woff2": "font/woff2",
};
http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname === "/" || url.pathname === "/mp1") {
      res.writeHead(302, { Location: "/mp1/" }).end();
      return;
    }
    let file;
    try {
      const relative = decodeURIComponent(url.pathname.replace(/^\/mp1\//, ""));
      file = path.resolve(root, relative || "index.html");
    } catch {
      res.writeHead(400).end("Bad request");
      return;
    }
    if (
      !url.pathname.startsWith("/mp1/") ||
      !file.startsWith(root + path.sep)
    ) {
      res.writeHead(404).end("Not found");
      return;
    }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) {
        res.writeHead(404).end("Not found");
        return;
      }
      const headers = {
        "Content-Type": types[path.extname(file)] || "application/octet-stream",
        "Accept-Ranges": "bytes",
        "Cache-Control": "no-cache",
      };
      let start = 0;
      let end = stat.size - 1;
      const range = req.headers.range;
      if (range) {
        const match = /^bytes=(\d+)-(\d*)$/.exec(range);
        if (
          !match ||
          Number(match[1]) >= stat.size ||
          (match[2] && Number(match[2]) < Number(match[1]))
        ) {
          res.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end();
          return;
        }
        start = Number(match[1]);
        end = match[2] ? Math.min(Number(match[2]), end) : end;
        headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
      }
      headers["Content-Length"] = end - start + 1;
      res.writeHead(range ? 206 : 200, headers);
      if (req.method === "HEAD") res.end();
      else fs.createReadStream(file, { start, end }).pipe(res);
    });
  })
  .listen(Number(process.env.PORT || 4173), "127.0.0.1", () => {
    console.log(`Preview: http://127.0.0.1:${process.env.PORT || 4173}/mp1/`);
  });
