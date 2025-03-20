<div align="center">
  <img width="240" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/logo.png" alt="logo"/>
</div>
<h4 align="center">
  一款支持多端操作的趣味藝術畫板
</h4>

<div align="center">
  <a href="https://github.com/LHRUN/paint-board/stargazers"><img src="https://img.shields.io/github/stars/LHRUN/paint-board" alt="Stars Badge"/></a>
  <a href="https://github.com/LHRUN/paint-board"><img src="https://img.shields.io/github/forks/LHRUN/paint-board" alt="Forks Badge"/></a>
  <a href="https://github.com/LHRUN/paint-board/blob/master/LICENSE"><img src="https://img.shields.io/github/license/LHRUN/paint-board" alt="License Badge"/></a>
  <a href="https://github.com/LHRUN/paint-board"><img src="https://img.shields.io/badge/Made%20with-React%20%26%20Vite-pink" alt="Next&Prisma" /></a>
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

## 已完成功能
+ 繪畫模式
  - 自由繪畫
  - 提供了 12 種不同風格的畫筆，包括基本畫筆，彩虹畫筆，多形狀畫筆，多素材畫筆，像素畫筆，多色畫筆，文字畫筆，多線連接畫筆，網狀畫筆，多點連接畫筆，波浪曲線畫筆，荊棘畫筆。以滿足多樣化的繪畫需求。
  - 所有畫筆均支持顏色和畫筆寬度的配置，另外多形狀、多素材、多色等畫筆支持定製化配置。
  - 形狀繪製
  - 提供了多種常見形狀的繪製,並支持多端點線段以及箭頭,並且這些形狀均支持邊框和填充的樣式配置。
+ 橡皮擦模式
  - 橡皮擦模式可線性擦除所有內容，並支持線性寬度配置。
+ 選擇模式
  - 在選擇模式下，可以通過點擊繪畫內容進行框選。點擊手柄支持拖拽、縮放和旋轉操作，提供靈活的編輯方式。
  - 選擇圖片支持多種濾鏡配置。
  - 選擇文字時，支持字體和樣式設置。
  - 所有繪製內容均支持圖層設置，包括向上移動層級、向下移動層級、移動至頂層和移動至底層。
  - 所有繪製內容支持透明度配置。
  - 所有繪製內容支持橡皮擦是否可擦除配置。
+ 畫板配置
  - 畫板支持配置背景配置, 包括顏色, 背景圖, 透明度。
  - 畫板支持自定義寬高配置。
  - 支持繪畫緩存，在存在大量繪製內容的情況下，啓用緩存將提高繪製性能，而禁用緩存則會提升畫布清晰度。
  - 新增輔助線繪製功能。
+ 多功能菜單
  - 左下角按鈕實時顯示當前縮放比例，點擊即可重置縮放比例。
  - 中間按鈕列表按從左到右的功能分別爲：撤銷、反撤銷、複製當前選擇內容、刪除當前選擇內容、繪製文字、上傳圖片、清除繪製內容、保存爲圖片、打開文件列表。
    - 上傳圖片支持去除背景, 圖像分割. 此功能需要瀏覽器支持WebGPU
    - 保存爲圖片支持自定義配置. 旋轉, 縮放, 裁切
  - 電腦端：
    - 按住 Space 鍵並點擊鼠標左鍵可移動畫布，滾動鼠標滾輪實現畫布縮放。
    - 按住 Backspace 鍵可刪除已選內容。
    - 同時按住 Ctrl 鍵 + V 鍵可粘貼剪貼板圖片。
  - 移動端：
    - 支持雙指按壓後拖拽和縮放畫布。
+ 多文件配置
  - 支持多個畫布切換，每個畫布可自定義標題、增加、刪除，並提供上傳和下載功能。
+ 國際化
  - 支持中文(简体), 中文(繁体), English, 日本語, 한국어。
+ 支持 PWA, 可離線訪問

## 未來計劃
+ 多平臺認證登錄，數據同步。
+ AI 增強繪製。

## V1.3.0 視頻演示

<a href="https://www.bilibili.com/video/BV1dJ4m1h7vg">
  <img width="500" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/v1.3.0_demo_bilibili.png"/>
</a>

## 本地啓動
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm dev
```

### Docker 支持

1. 構建 Docker 鏡像，鏡像名稱爲 `paint-board`。
```sh
docker build -t paint-board .
```

2. 啓動 docker 容器。
```sh
docker run -d -p 8080:80 --name paint-board paint-board
```

3. 在瀏覽器打開 `http://localhost:8080/paint-board/` 即可訪問。

## 瀏覽器支持

建議使用最新版谷歌瀏覽器, 以下是最低版本支持

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| :--: | :--: | :--: | :--: |
| 80+ | 80+ | 70+ | 13+ |

## 聯繫我

如果你有任何建議或者有好的想法，歡迎隨時與我聯繫！

+ Email: song.lhlh@gmail.com
+ Telegram: https://t.me/longhao_song
+ Twiter: https://twitter.com/Song_LongHao
+ WeChat:
<img style="width: 300px" src="https://github.com/user-attachments/assets/719265e1-dbfa-4760-9482-aa0823b72df8" alt="wechat"/>


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
