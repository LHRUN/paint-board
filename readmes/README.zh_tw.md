<div align="center">
  <img width="240" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/logo.png" alt="logo"/>
</div>
<h4 align="center">
  一款開源的 Web 端創意畫板
</h4>

<div align="center">
  <a href="https://github.com/LHRUN/paint-board/stargazers"><img src="https://img.shields.io/github/stars/LHRUN/paint-board" alt="Stars Badge"/></a>
  <a href="https://github.com/LHRUN/paint-board"><img src="https://img.shields.io/github/forks/LHRUN/paint-board" alt="Forks Badge"/></a>
  <a href="https://github.com/LHRUN/paint-board/blob/master/LICENSE"><img src="https://img.shields.io/github/license/LHRUN/paint-board" alt="License Badge"/></a>
  <a href="https://github.com/LHRUN/paint-board/releases"><img alt="release" src="https://img.shields.io/github/package-json/v/LHRUN/paint-board" /></a>
</div>

<br>

<p align="center">
  <strong>中文(繁体)</strong> / 
  <a href="../README.md">English</a> / 
  <a href="./README.zh_cn.md">中文(简体)</a> / 
  <a href="./README.ja.md">日本語</a> / 
  <a href="./README.ko.md">한국어</a>
</p>


## 預覽
Link: [https://songlh.top/paint-board/](https://songlh.top/paint-board/)

<div align="center" style="width: 100%;">
  <img style="width: 100%" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_device.png" alt="preview"/>
</div>

## 功能簡介
+ 繪畫模式
  - 自由繪畫: 提供 15 種畫筆：基本畫筆、鋼筆、描邊鋼筆、彩虹畫筆、多形狀畫筆、多素材畫筆、像素畫筆、多色畫筆、文字畫筆、多線連接畫筆、網狀畫筆、多點連接畫筆、波浪曲線畫筆、荊棘畫筆、墨水筆。
  - 圖形繪畫: 支持繪製豐富的圖形，包括內置圖形與 Lucide 圖標庫圖形，只需點擊添加即可使用。可配置線條寬度、線條樣式、填充顏色與填充樣式。
+ 橡皮擦模式: 可線性擦除所有內容，並支持線性寬度配置。
+ 選擇模式: 支持點擊或框選內容進行編輯。選中後可拖拽、縮放、旋轉、修改顏色，也可把多個對象組合成一組。
+ 畫板模式: 支持畫板背景, 自定義尺寸和全局繪畫配置。
+ 操作欄: 撤銷、重做、複製、組合、刪除、繪製文字、上傳圖片、清除繪製內容、保存爲圖片、打開圖層列表、打開畫板列表。
+ 多文件配置: 支持多個畫布切換。每個畫布可自定義標題，並可新建、重命名、刪除、上傳和批量下載。新建畫板最多 20 個，已經超過上限的畫板仍會保留。第一次打開空畫板時可以從模板開始。
+ 國際化: 支持中文(簡體), 中文(繁體), English, 日本語, 한국어。

## V1.3.0 視頻演示

<a href="https://www.bilibili.com/video/BV1dJ4m1h7vg">
  <img width="500" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/v1.3.0_demo_bilibili.png"/>
</a>

## 本地啓動
```
git clone https://github.com/LHRUN/paint-board.git
cd paint-board
pnpm install
pnpm dev
```

### Docker 支持
1. Clone 源碼倉庫
```sh
git clone https://github.com/LHRUN/paint-board.git
cd paint-board
```

2. 構建 Docker 鏡像，鏡像名稱爲 `paint-board`。
```sh
docker build -t paint-board .
```

3. 啓動 docker 容器。
```sh
docker run -d -p 8080:80 --name paint-board paint-board
```

4. 在瀏覽器打開 `http://localhost:8080/paint-board/` 即可訪問。

## 瀏覽器支持

建議使用最新版谷歌瀏覽器, 以下是最低版本支持

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| :--: | :--: | :--: | :--: |
| 80+ | 80+ | 70+ | 16.4+ |

## 聯繫我

如果你有任何建議或者有好的想法，歡迎隨時與我聯繫！

+ Email: song.lhlh@gmail.com
+ Telegram: https://t.me/longhao_song
+ WeChat: August8_L


## 貢獻

我很高興你有興趣對 PAINT BOARD 做出貢獻。如果你發現了 BUG 並希望進行修復，請先在 Issue 中提出。對於新功能的增加，請先在 Discussions 中與我們進行溝通，或者直接通過以上提供的聯繫方式聯繫，進行貢獻前請閱讀以下貢獻指南。感謝你的支持！

[貢獻指南](./CONTRIBUTING.md)

## 技術文章
+ Fabric.js 重構後
  - [Exploring the Canvas Series: combined with Transformers.js to achieve intelligent image processing](https://songlh.top/2024/11/23/Exploring-the-Canvas-Series-combined-with-Transformers-js-to-achieve-intelligent-image-processing/)
  - [Exploring the Canvas Series: The Art of Time Reversal in the Canvas](https://songlh.top/2024/01/10/Exploring-the-Canvas-Series-The-Art-of-Time-Reversal-in-the-Canvas/)
  - [Exploring the Canvas Series: Creative Brushes Part 1](https://songlh.top/2024/04/14/Exploring-the-Canvas-Series-Creative-Brushes-Part-1/)
  - [Exploring the Canvas Series: Creative Brushes Part 2](https://songlh.top/2024/04/15/Exploring-the-Canvas-Series-Creative-Brushes-Part-2/)
  - [Exploring the Canvas Series: Creative Brushes Part 3](https://songlh.top/2024/04/16/Exploring-the-Canvas-Series-Creative-Brushes-Part-3/)
  - writing...
+ Fabric.js 重構前
  - [Canvas Artistry：Mastering Selection, Dragging, and Scaling](https://songlh.top/2023/11/30/Canvas-Artistry1)
  - [Canvas Artistry：Drawing magic with multiple effects](https://songlh.top/2023/12/01/Canvas-Artistry2)

## License

MIT License. See the [LICENSE](https://github.com/LHRUN/paint-board/blob/main/LICENSE) file.
