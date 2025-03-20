<div align="center">
  <img width="240" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/logo.png" alt="logo"/>
</div>

<h4 align="center">
  멀티 엔드 조작을 지원하는 재미있는 아트 드로잉 보드
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
  <strong>한국어</strong> / 
  <a href="./README.zh_cn.md">中文(简体)</a> / 
  <a href="./README.zh_tw.md">中文(繁体)</a> / 
  <a href="./README.ja.md">日本語</a> / 
  <a href="../README.md">English</a>
</p>


## 미리 보기
Link: [https://songlh.top/paint-board/](https://songlh.top/paint-board/)

<div align="center" style="width: 100%;">
  <img style="width: 100%" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/preview_device.png" alt="preview"/>
</div>

## 완성된 기능:
+ 그리기 모드
  - 무료 스타일
    - 기본 브러시, 무지개 브러시, 다중 모양 브러시, 다중 재질 브러시, 픽셀 브러시, 다중 색상 브러시, 텍스트 브러시, 다중 선 연결 브러시, 레티큘러 브러시, 다중 지점 연결 브러시, 위글 브러시, 가시 브러시 등 12가지 스타일의 브러시를 제공합니다. 다양한 드로잉을 만족시키세요.
    - 모든 브러시는 색상 및 브러시 너비 구성을 지원하며 다중 모양, 다중 재질, 다중 색상 및 기타 브러시는 사용자 지정 구성을 지원합니다.
  - 모양 그리기
    - 다점 세그먼트와 화살표를 지원하는 다양한 일반 도형을 그리기 위해 제공됩니다. 도형은 테두리 및 채우기 스타일을 지원합니다.
+ 지우개 모드
  - 지우개 모드는 모든 콘텐츠를 선형적으로 지우고 선형 너비 구성을 지원합니다.
+ 선택 모드
  - 선택 모드에서는 그리기 콘텐츠를 클릭하여 프레임을 지정할 수 있습니다. 클릭 핸들은 드래그, 확대/축소, 회전 작업을 지원하여 유연한 편집을 제공합니다.
  - 이미지 선택 시 여러 필터 구성을 지원합니다.
  - 텍스트 선택 시 글꼴 및 스타일 설정을 지원합니다.
  - 레이어 위로 이동, 레이어 아래로 이동, 위로 이동, 아래로 이동을 포함한 모든 도면에서 레이어 설정이 지원됩니다.
  - 모든 도면이 투명도 구성을 지원합니다.
  - 모든 도면은 지우개 또는 지울 수 없는 구성을 지원합니다.
+ 드로잉 보드 구성
  - 드로잉 보드는 색상, 배경 이미지, 투명도를 포함한 배경 구성을 지원합니다.
  - 드로잉 보드는 사용자 지정 너비 및 높이 구성을 지원합니다.
  - 페인팅 캐싱을 지원하며, 캐싱을 활성화하면 많은 양의 페인팅 콘텐츠가 있는 경우 페인팅 성능이 향상되고, 캐싱을 비활성화하면 캔버스 선명도가 향상됩니다.
  - 안내선 그리기 기능이 추가되었습니다.
+ 다기능 메뉴
  - 왼쪽 하단 버튼은 현재 줌 비율을 실시간으로 표시하며, 클릭하면 줌 비율을 재설정할 수 있습니다.
  - 중앙의 버튼 목록은 왼쪽에서 오른쪽 순서대로 다음과 같습니다: 실행 취소, 다시 실행, 현재 선택 항목 복사, 현재 선택 항목 삭제, 텍스트 그리기, 이미지 업로드, 그림 지우기, 이미지로 저장, 파일 목록 열기입니다.
    - 배경 제거, 이미지 분할을 지원하는 이미지 업로드. 이 기능을 사용하려면 브라우저에서 WebGPU를 지원해야 합니다.
    - 이미지로 저장은 사용자 지정 구성을 지원합니다. 회전, 크기 조정, 자르기
  - PC:
    - 스페이스키를 누른 상태에서 마우스 왼쪽 버튼을 클릭하여 캔버스를 이동하고 마우스 휠을 스크롤하여 캔버스를 확대/축소합니다.
    - 선택 내용을 삭제하려면 백스페이스 키를 길게 누릅니다.
    - 클립보드 이미지를 붙여넣으려면 Ctrl + V를 동시에 누르고 있습니다.
  - Mobile:
    - 두 손가락으로 캔버스를 드래그하고 확대/축소하는 기능을 지원합니다.
+ 다중 파일 구성
  - 여러 캔버스 전환을 지원하며, 각 캔버스는 제목을 사용자 지정하고, 추가, 삭제하고, 업로드 및 다운로드를 제공할 수 있습니다.
+ i18n
  - 中文(简体), 中文(繁体), English, 日本語, 한국어.
+ PWA support.

## 향후 계획
+ 멀티 플랫폼 인증 로그인 및 데이터 동기화
+ AI 강화 드로잉

## V1.3.0 Video Demo

<a href="https://www.bilibili.com/video/BV1dJ4m1h7vg">
  <img width="500" src="https://raw.githubusercontent.com/LHRUN/file-store/main/paint-board/v1.3.0_demo_bilibili.png"/>
</a>

## 빠른 시작
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

## 브라우저 지원

최신 버전의 Google 크롬을 사용하는 것이 좋으며, 최소 지원 버전은 다음과 같습니다.

| [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png" alt=" Edge" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Edge | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png" alt="Firefox" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Firefox | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png" alt="Chrome" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Chrome | [<img src="https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png" alt="Safari" width="24px" height="24px" />](http://godban.github.io/browsers-support-badges/)</br>Safari |
| :--: | :--: | :--: | :--: |
| 80+ | 80+ | 70+ | 13+ |

## 문의하기

제안이나 좋은 아이디어가 있으시면 언제든지 저에게 연락해 주세요!

+ Email: song.lhlh@gmail.com
+ Telegram: https://t.me/longhao_song
+ Twiter: https://twitter.com/Song_LongHao
+ WeChat:
<img style="width: 300px" src="https://github.com/user-attachments/assets/719265e1-dbfa-4760-9482-aa0823b72df8" alt="wechat"/>

## Contributing

페인트보드에 기여해 주셔서 감사합니다. 버그를 발견하여 수정하고 싶으시면 먼저 이슈로 제출해 주세요. 새로운 기능 추가에 대해서는 토론을 통해 또는 위에 제공된 연락처로 직접 문의해 주시고, 아래의 기여 가이드라인을 읽어보신 후 기여해 주세요. 여러분의 지원에 감사드립니다!

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
