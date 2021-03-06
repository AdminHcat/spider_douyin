# Spider for douyin

> 抖音内容爬虫

可以通过内容链接、内容分享链接、内容 ID 下载对应的内容。  
内容可以是:

- 视频(v1.0.0 起)
- 图片(v1.0.0 起)

其余内容暂不支持(v1.0.0)

## 运行爬虫

首先, 你需要运行一些初始化命令来准备好爬虫:

```bash
npm i
npm run spider
```

运行完毕上述命令后, 您将在项目根目录看到一个名为`videoTxt.txt`的文件  
此文件即为需要爬取的内容文件, 您可以将如下形式的文字粘贴入此文件中:

1. `xxxxxxxxxx https://v.douyin.com/xxxxx/ 复制此链接，打开Dou音搜索，直接观看视频！`
2. `https://www.douyin.com/video/xxxxxxxxxxxxxxxxxxx`
3. `xxxxxxxxxxxxxxxxxxx`

上述三种形式均可被正确识别, 识别器将会挑选 **指定域名下的链接** 及 **长度为 19 位的内容 ID** 。  
但请注意: 任何有效内容与无效内容，或者两个有效内容之间，应该有分隔符存在，分隔符可以是半角空格(` `)、半角逗号(`,`)、换行符(`\n`)、制表符(`\t`), 如果没有有效的分隔符，那么内容将被当做一体的，从而使有效内容变得无效。

当您填写了有效内容后，运行下面的命令:

```bash
npm run spider
```

等待运行结束后, 您会发现`videoTxt.txt`的内容发生了改变, 您所有的有效输入均被转换为了内容 ID, 这样既方便读取，也方便查找。  
所有内容 ID 将会在此文件内长期存储, 每次运行爬虫时，程序会按照此列表找出未下载的内容，进行爬取，已下载的内容将会被忽略。

所有的爬取数据均保存在`/datas`文件夹内, 存储形式为内容 ID+文件拓展名, 视频的文件拓展名为 `.mp4`, 图片的文件拓展名为 `.jpg`(存储格式为 webp).  
每一个内容 ID 将会附带一个 `.txt`文件, 其中保存了此视频的 ID、名称及作者信息。文件格式如下:

```
视频KID:	xxxxxxxxxxxxxxxxxxx
视频名称:	xxxxxx #xxxx #xxxx
作者昵称:	xxxx
作者抖音号:	xxxx
作者uid:	xxx
作者sid:	xxx
简介:
xxxA
xxxB
xxxC
```

## 通过网页浏览内容

> 此部分非常简易, 仅供调试浏览, 如果需要完整的网页浏览请自行搭建

在您爬取了一部分视频后, 您可以使用如下命令来启动一个简易网站

```bash
npm run web
```

程序将会监听 3000 端口(在 web.js 内硬编码), 您可以在 http://localhost:3000/ 中浏览已下载的内容  
提供的接口:

- `/datas` 会返回 html 格式的文件列表
- `/datas/xxx` 会返回`datas`文件夹内对应的文件

网页文件具有一定的适应性, 您不仅可以通过 npm 运行网站, 您还可以将其放在一些可以直接访问文件的服务器中(例如提供直链的网盘、git 中), 网页依赖于`/datas`发现内容列表、`/datas/xxx`获取内容。
