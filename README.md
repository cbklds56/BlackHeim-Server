# Black 소개 사이트 (GitHub Pages)

서버 시스템(농사·요리·광산·낚시·등급·규칙·명령어)을 설명하는 정적 웹사이트예요.
빌드 도구 없이 이 폴더 그대로 올리면 됩니다.

## 1. 서버 정보 바꾸기
`app.js` 맨 위만 고치세요.
```js
const SERVER = {
  name: "Black",
  ip: "play.example.com",   // 실제 서버 주소
  version: "Java 1.21.1",
  discord: "",              // 디스코드 초대 링크 (비워두면 버튼 숨김)
};
```

## 2. GitHub Pages 로 올리기
1. GitHub 에서 새 저장소 만들기 (예: `minefarm`, Public)
2. **Add file → Upload files** 로 이 `site` 폴더 **안의 파일 전부**를 드래그해서 올리기
   (`index.html` 이 저장소 맨 위에 있어야 해요)
3. 저장소 **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: **main** / **/(root)** → Save
4. 1~2분 뒤 `https://<깃허브아이디>.github.io/minefarm/` 에서 열려요

## 3. 서버 설정을 바꿨을 때 (작물·요리·가격 등)
```
cd tools
python3 gen_assets.py   # 서버용 텍스처·설정 다시 만들기
python3 gen_site.py     # 사이트 data.js 와 img/ 다시 만들기
```
→ 바뀐 `data.js` 와 `img/` 를 GitHub 에 다시 올리면 사이트도 자동으로 바뀌어요.

## 파일
| 파일 | 내용 |
|---|---|
| `index.html` | 페이지 구조와 문구 (직접 수정 OK) |
| `style.css` | 디자인 (나무·양피지 테마, 다크모드 자동) |
| `app.js` | 서버 정보 + 카드·표·검색 만들기 |
| `data.js` | 작물·요리·광물 데이터 (자동 생성, 직접 수정 X) |
| `img/` | 서버와 같은 텍스처 (자동 생성) |
| `.nojekyll` | GitHub Pages 가 파일을 그대로 쓰게 하는 빈 파일 |
