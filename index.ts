import fs from "fs";
import http from "http";
import https from "https";
import app from "./app";
import "reflect-metadata";

const PORT = 8000;
const sPORT = 8443;

const credentials = {
  key: fs.readFileSync("./ssl/localhost.key", "utf8"),
  cert: fs.readFileSync("./ssl/localhost.crt", "utf8"),
};
const httpServer = http.createServer(app);
const httpsServer = https.createServer(credentials, app);
httpServer.listen(PORT, () => {
  console.log(
    `[blog-api]: Blog API Server is running at http://localhost:${PORT}`
  );
});
httpsServer.listen(sPORT, () => {
  console.log(
    `[blog-api]: Blog API Server is running at https://localhost:${sPORT}`
  );
});
