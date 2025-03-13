<div align="center">
  <img width="240" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/logo.png" alt="logo"/>
</div>

<h4 align="center">
  マルチエンドオペレーションに対応した楽しいアートドローイングボード
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

## 完成した機能:
+ 描画モード
  - フリースタイル
    - ベーシックブラシ、レインボーブラシ、マルチシェイプブラシ、マルチマテリアルブラシ、ピクセルブラシ、マルチカラーブラシ、テキストブラシ、マルチラインコネクションブラシ、レティキュレートブラシ、マルチポイントコネクションブラシ、ウィグルブラシ、ソーンブラシを含む12種類のブラシスタイルを提供。多様な描画に対応。
    - すべてのブラシは、マルチシェイプ、マルチマテリアル、マルチカラー、その他のブラシのカスタム設定に加えて、色とブラシ幅の設定をサポートしています。
  - シェイプドロー
    - さまざまな一般的な図形が描画用に用意されており、多点セグメントや矢印もサポートしています。図形は枠線と塗りつぶしのスタイルをサポートしています。
+ 消しゴムモード
  - 消しゴムモードは、すべてのコンテンツを直線的に消去し、直線的な幅の設定をサポートします。
+ 選択モード
  - 選択モードでは、描画内容をクリックして枠を作ることができます。クリックハンドルはドラッグ、ズーム、回転操作に対応しており、柔軟な編集が可能です。
  - 画像の選択では、複数のフィルター設定に対応。
  - テキスト選択時のフォントとスタイルの設定に対応。
  - レイヤーの上移動、下移動、上移動、下移動を含むレイヤー設定がすべての図面でサポートされています。
  - すべてのドローイングで透明度設定がサポートされています。
  - すべてのドローイングで、消しゴムの有無を設定できます。
+ 描画ボードの設定
  - 描画ボードは、色、背景画像、透明度を含む背景設定をサポートしています。
  - 描画ボードは、カスタマイズされた幅と高さの設定をサポートしています。
  - キャッシュを有効にすると、大量の描画コンテンツがある場合の描画パフォーマンスが向上し、キャッシュを無効にすると、キャンバスのシャープネスが向上します。
  - ガイド線描画機能を追加。
+ マルチファンクションメニュー
  - 左下のボタンは現在のズーム比をリアルタイムで表示し、クリックするとズーム比がリセットされます。
  - 中央のボタンリストは、左から右の順です： 元に戻す」、「やり直し」、「現在の選択範囲をコピー」、「現在の選択範囲を削除」、「テキストを描画」、「画像をアップロード」、「描画をクリア」、「画像として保存」、「ファイルリストを開く」。
    - 背景除去、画像分割をサポートした画像のアップロード。この機能はブラウザのWebGPUサポートが必要です。
    - 画像として保存は、カスタム設定をサポートしています。回転、拡大縮小、トリミング
  - PC
    - Spaceキーを押しながらマウスの左ボタンをクリックするとキャンバスが移動し、マウスホイールをスクロールするとキャンバスがズームします。
    - 選択範囲を削除するには、Backspaceキーを押し続けます。
    - CtrlキーとVキーを同時に押し続けると、クリップボードの画像が貼り付けられます。
  - Mobile
    - キャンバスのドラッグとズームに対応。
+ マルチファイル構成
  - 複数のキャンバスの切り替えをサポートし、各キャンバスはタイトル、追加、削除、アップロードとダウンロードをカスタマイズできます。
+ i18n
  - 中文(简体), 中文(繁体), English, 日本語, 한국어.
+ PWA support.

## 今後の計画
+ マルチプラットフォーム認証ログインとデータ同期
+ AIによる描画機能強化

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
| 80+ | 80+ | 70+ | 13+ |

## Contact me

何かご提案や良いアイデアがあれば、いつでもご連絡ください！

+ Email: song.lhlh@gmail.com
+ Telegram: https://t.me/longhao_song
+ Twiter: https://twitter.com/Song_LongHao
+ WeChat:
  - <img style="width: 300px" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/IMG_1449.jpeg" alt="wechat"/>

### 作者にコーヒーをおごろう。

もし私のプロジェクトがクールで、私の開発作業をサポートしたいと思ったら、アリペイかWeChatで私にコーヒーをおごることができます。

<div>
  <img style="width: 300px" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/IMG_1446.jpeg" alt="wechat"/>
  <img style="width: 300px" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/IMG_1447.jpeg" alt="wechat"/>
</div>

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
