import { createWriteStream } from "node:fs";
import fetch from "node-fetch";
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import * as fs from "fs";
const streamPipeline = promisify(pipeline);

const headers = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
};

/**
 * 匹配抖音视频地址, 形如
 * https://www.iesdouyin.com/share/video/xxx .
 * https://www.douyin.com/video/xxx
 */
const itemUrlExp =
  /^https?:\/\/[^\/]*?(douyin.com|iesdouyin.com\/share)\/video\/(?<items>[A-Za-z0-9]+)(\/)?(\?.*)?$/;
/**
 * 匹配抖音内容Key. 19位数字+字符
 */
const itemKeyExp = /^[A-Za-z0-9]{19}$/;

/**
 * 解析文字, 通过匹配与重定向, 获取内容ID
 * @param {string} txt
 * @returns 文字所指向的内容ID / null(无法解析)
 */
export const parseText = async function (txt) {
  let match = itemUrlExp.exec(txt);
  if (match) return match.groups.items;
  if (itemKeyExp.test(txt)) return txt;

  let url = `${txt}`.split(" ").find((x) => x.startsWith("http"));
  while (url) {
    url = url.href || url;
    console.log("parse url:", url);
    match = itemUrlExp.exec(url);
    if (match) return match.groups.items;
    const resp = await fetch(url, { ...headers, redirect: "manual" });
    if (((resp.status / 100) | 0) == 3)
      url = new URL(resp.headers.get("location"), resp.url);
    else break;
  }
  return null;
};
/**
 * 解析文字, 通过匹配与重定向, 获取视频ID
 * @param {any} txt
 * @returns 文字所指向的视频ID / null(无法解析)
 */
export const parseTexts = async function (txt) {
  let arr = `${txt}`
    .replace(/\r/g, "")
    .split(/( |,|\n|\t)/)
    .map((v) => v.trim())
    .filter((x) => {
      if (x.startsWith("http")) return true;
      if (itemKeyExp.test(x)) return true;
    });
  for (let key in arr) {
    arr[key] = await parseText(arr[key]);
  }
  const set = new Set(arr);
  set.delete(null);
  return set;
};

/**
 * 通过抖音内容ID保存
 * @param {string} item 内容ID
 * @returns 是否成功保存
 */
export const saveItem = async function (item) {
  if (!item) return null;
  const api = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${item}`;
  console.log("api url:", api);
  let json = await fetch(api, { ...headers }).then((r) => r.json());
  try {
    json = json["item_list"][0];
    const aweme_type = json["aweme_type"];
    switch (aweme_type) {
      case 2:
        return saveItemImage(item, json);
      case 4:
        return saveItemVideo(item, json);
    }
  } catch (err) {
    console.error("无法保存", item, "\n", err);
  }
};
/**
 * 下载视频
 * @param {string} item 视频ID
 * @param {any} json 视频信息
 * @returns 是否成功保存
 */
const saveItemVideo = async function (item, json) {
  let url = json["video"]["play_addr"]["url_list"][0]; //视频地址(有壳)
  url = url.replace("/playwm/", "/play/"); //去除水印

  console.log("download", "video URL", url);
  const resp = await fetch(url, { ...headers });
  if (!resp.ok)
    throw new Error(`Unexpected response (${item}) ${response.statusText}`);
  await streamPipeline(resp.body, createWriteStream(`${videoDir}${item}.mp4`));
  saveInfoTxt(item, json);
  return true;
};
/**
 * 下载图片
 * @param {string} item 图片ID
 * @param {any} json 图片信息
 * @returns 是否成功保存
 */
const saveItemImage = async function (item, json) {
  const urls = json["images"].map((r) => r.url_list);

  for (const key in urls) {
    const urlPool = urls[key];
    const statusText = `没有可用的下载地址: ${item} images.${key}`;
    for (let url in urlPool) {
      url = urlPool[url];
      console.log("download", "image URL", url);
      const resp = await fetch(url, { ...headers });
      if (resp.ok) {
        statusText = null;
        await streamPipeline(
          resp.body,
          createWriteStream(`${videoDir}${item}.${key}.jpg`)
        );
        break;
      } else statusText = resp.statusText;
    }
    if (statusText)
      throw new Error(`Unexpected response (${item}) ${statusText}`);
  }
  saveInfoTxt(item, json);
  return true;
};
/** 文件夹 */
export const videoDir = "./datas/";

/**
 *保存信息文件
 * @param {string} item 内容ID
 * @param {any} json 图片信息
 */
const saveInfoTxt = (item, json) => {
  const name = json["desc"];
  const author = json["author"];

  const infoTxt = [
    `视频KID:\t${item}`,
    `视频名称:\t${name}`,
    `作者昵称:\t${author.nickname}`,
    `作者抖音号:\t${author.unique_id}`,
    `作者uid:\t${author.uid}`,
    `作者sid:\t${author.short_id}`,
    `简介:\n${author.signature}`,
  ].join("\n");
  fs.writeFileSync(`${videoDir}${item}.txt`, infoTxt);
};
