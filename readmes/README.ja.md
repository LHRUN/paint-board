<div align="center">
  <img width="240" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/logo.png" alt="logo"/>
</div>

<h4 align="center">
  オープンソースのWebクリエイティブボード
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
  <strong>日本語</strong> / 
  <a href="./README.zh_cn.md">中文(简体)</a> / 
  <a href="./README.zh_tw.md">中文(繁体)</a> / 
  <a href="../README.md">English</a> / 
  <a href="./README.ko.md">한국어</a>
</p>


## プレビュー
Link: [https://songlh.top/paint-board/](https://songlh.top/paint-board/)

<div align="center" style="width: 100%;">
  <img style="width: 100%" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_device.png" alt="preview"/>
</div>

## 機能概要
+ ペイントモード
  - フリーペイント: 基本ブラシ、レインボーブラシ、マルチシェイプブラシ、マルチ素材ブラシ、ピクセルブラシ、マルチカラーブラシ、テキストブラシ、マルチライン接続ブラシ、メッシュブラシ、マルチポイント接続ブラシ、波状曲線ブラシ、トゲブラシなど、12種類の異なるスタイルのブラシを提供。多様な描画ニーズに対応します。
  - 図形描画: 内蔵図形とLucideアイコンライブラリの図形を含む豊富な図形の描画をサポート。クリックするだけで追加・使用可能。線の太さ、線種、塗りつぶし色、塗りつぶしパターンを設定可能。
+ 消しゴムモード: 全内容を直線的に消去可能。直線幅の設定をサポート。
+ 選択モード: クリックまたは範囲選択による編集をサポート。選択後はハンドル操作でドラッグ・拡大縮小・回転が可能。各種カスタム設定にも対応。
+ アートボードモード: アートボード背景、カスタムサイズ、グローバル描画設定をサポート。
+ 操作バー: 左から右へ、それぞれ「元に戻す」「やり直し」「選択内容のコピー」「選択内容の削除」「文字描画」「画像アップロード」「描画内容のクリア」「画像として保存」「ファイルリストを開く」の機能。
+ 複数ファイル設定: 複数のキャンバス切り替えをサポート。各キャンバスはタイトルのカスタマイズ、追加・削除が可能で、並べ替えやアップロード/ダウンロード機能を提供。
+ i18n: 支持中文(简体), 中文(繁体), English, 日本語, 한국어。

## V1.3.0 Video Demo

<a href="https://www.bilibili.com/video/BV1dJ4m1h7vg">
  <img width="500" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/v1.3.0_demo_bilibili.png"/>
</a>

## クイックスタート
```
git clone https://github.com/LHRUN/paint-board.git
pnpm install
pnpm dev
```

### Docker

1. Build a Docker image with the name `paint-board`.
```sh
docker build -t paint-board .
```

2. Start a docker container.
```sh
docker run -d -p 8080:80 --name paint-board paint-board
```

3. Accessed by opening `http://localhost:8080/paint-board/` in your browser.

## ブラウザサポート

最新バージョンのGoogle Chromeの使用をお勧めします

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| :--: | :--: | :--: | :--: |
| 80+ | 80+ | 70+ | 16.4+ |

画像の保存は Safari 16.4 以降では OffscreenCanvas を使い、それより古い Safari では canvas.toBlob に切り替えます。

## Contact me

何かご提案や良いアイデアがあれば、いつでもご連絡ください！

+ Email: song.lhlh@gmail.com
+ Telegram: https://t.me/longhao_song
+ Twiter: https://twitter.com/Song_LongHao
+ WeChat:
<img style="width: 300px" src="https://github.com/user-attachments/assets/719265e1-dbfa-4760-9482-aa0823b72df8" alt="wechat"/>


## Contributing

PAINT BOARDへの貢献に興味を持っていただけて嬉しいです。バグを見つけて修正したい場合は、まずIssueに投稿してください。新機能の追加については、ディスカッションでご連絡いただくか、上記に記載されている連絡先を通じて直接ご連絡ください。貢献する前に、以下の貢献ガイドラインをお読みください。ご協力ありがとうございました！

[Contribution Guidelines](./CONTRIBUTING.md)

## Document
+ After refactoring with Fabric.js
  - [Exploring the Canvas Series: combined with Transformers.js to achieve intelligent image processing](https://songlh.top/2024/11/23/Exploring-the-Canvas-Series-combined-with-Transformers-js-to-achieve-intelligent-image-processing/)
  - [Exploring the Canvas Series: The Art of Time Reversal in the Canvas](https://songlh.top/2024/01/10/Exploring-the-Canvas-Series-The-Art-of-Time-Reversal-in-the-Canvas/)
  - [Exploring the Canvas Series: Creative Brushes Part 1](https://songlh.top/2024/04/14/Exploring-the-Canvas-Series-Creative-Brushes-Part-1/)
  - [Exploring the Canvas Series: Creative Brushes Part 2](https://songlh.top/2024/04/15/Exploring-the-Canvas-Series-Creative-Brushes-Part-2/)
  - [Exploring the Canvas Series: Creative Brushes Part 3](https://songlh.top/2024/04/16/Exploring-the-Canvas-Series-Creative-Brushes-Part-3/)
  - writing...
+ Before refactoring with Fabric.js
  - [Canvas Artistry：Mastering Selection, Dragging, and Scaling](https://songlh.top/2023/11/30/Canvas-Artistry1)
  - [Canvas Artistry：Drawing magic with multiple effects](https://songlh.top/2023/12/01/Canvas-Artistry2)

## License

MIT License. See the [LICENSE](https://github.com/LHRUN/paint-board/blob/main/LICENSE) file.
