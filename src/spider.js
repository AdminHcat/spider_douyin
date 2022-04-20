import { parseTexts, saveItem } from "./core.js";
import * as fs from "fs";

/**
 * 视频链接/ID/分享 的文件
 */
const file = "./videoTxt.txt";

(async () => {
  const txt = [];
  if (fs.existsSync(file)) txt.push(fs.readFileSync(file)); //加载文件
  let set = await parseTexts(txt.join("\n")); //有效的ID
  fs.writeFileSync(
    file,
    [
      "可以将分享链接、内容的链接/ID等任何可以找到视频的文字粘贴至此",
      "可识别的内容将被转换为内容ID存储, 不可识别的内容将被丢弃",
      "具体可以识别的内容请参考 README.md 文件",
      "",
      ...Array.from(set).sort(),
      "",
    ].join("\n")
  ); //写出格式化后的文件
  fs.readdirSync("./datas") //过滤已下载
    .filter((x) => !x.endsWith(".txt"))
    .filter((x) => x.indexOf(".") >= 0)
    .forEach((x) => set.delete(x.substring(0, 19)));

  const arr = Array.from(set);
  console.log("有效且未下载的视频:", arr.length + "个", arr);
  for (let key in arr) {
    key = arr[key];
    const info = await saveItem(key);
    console.log("下载结果:", info);
  }
})();
//  parseText(txt)
//   .then((item) => getVideoUrl(item))
//   .then((url) => saveVideo(url))
//   .then((result) => console.log(result));
