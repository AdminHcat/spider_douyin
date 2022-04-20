import express from "express";
import fs from "fs";

const app = express();
app.use("/webs", express.static("webs"));
app.use("/datas", express.static("datas"));
app.get("/datas", (_req, res) => {
  const list = fs
    .readdirSync("datas")
    .map((v) => `<a href="/datas/${v}">${v}</a>`)
    .join("\n");
  res.send(`<pre>${list}</pre>`);
});
app.get("/", (_req, res) => res.redirect("/webs/index.html"));

//创建web服务器
app.listen(3000, () => console.log("server started: https://localhost:3000"));
