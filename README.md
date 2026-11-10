# 캐치페스타

전국 지역축제·음악/DJ·콘서트·서브컬처·카드게임·팝업스토어·반려동물·박람회·테마파크 행사를 지역과 날짜로 찾는 웹앱이에요.

## 파일 구성

| 파일 | 내용 |
|---|---|
| `index.html` | 앱 화면 전체 |
| `config.js` | (선택) 평점·후기용 Supabase 설정 |
| `data/events.json` | 직접 모은 행사 목록 (콘서트, 카드게임, 팝업 등) |
| `data/tour.json` | 한국관광공사 축제 목록 — 매일 자동 갱신 |
| `data/watchlist.json` | 기다리는 페스티벌 (워터밤, 흠뻑쇼 등) |
| `scripts/update-tour.mjs` | TourAPI에서 축제를 받아 오는 스크립트 |
| `.github/workflows/update-tour.yml` | 매일 오전 6:17 자동 실행 설정 |
| `supabase.sql` | (선택) 후기·제보용 테이블 |

## 올리는 방법

1. GitHub에서 **New repository** → 이름 `catchfesta` → **Public** → Create.
2. **Add file → Upload files**로 이 폴더 안의 파일을 모두 끌어다 놓고 Commit.
   - `.github` 폴더는 숨김 폴더라 안 보일 수 있어요. 안 보이면 **Add file → Create new file**에서 이름을 `.github/workflows/update-tour.yml`로 적고 내용을 붙여 넣으세요.
3. **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `TOUR_API_KEY` / Secret: 공공데이터포털 인증키 (Decoding 키)
4. **Settings → Pages** → Source: `Deploy from a branch` → Branch: `main` / `(root)` → Save.
   1~2분 뒤 `https://<아이디>.github.io/catchfesta/` 주소로 열려요.
5. **Actions** 탭 → `TourAPI 축제 매일 갱신` → **Run workflow**로 한 번 실행하면 축제 목록이 채워져요. 이후엔 매일 자동으로 돌아요.

## (선택) 평점·후기 켜기

1. supabase.com에서 무료 프로젝트 만들기.
2. SQL Editor에 `supabase.sql` 내용을 붙여 넣고 Run.
3. Project Settings → API에서 **Project URL**과 **anon public key**를 복사해 `config.js`에 넣고 Commit.

## 참고

- 찜 목록은 각자 브라우저에 저장돼요.
- 로그인 없이 쓰는 방식이라 후기는 누구나 쓸 수 있어요. 문제 되는 후기는 Supabase Table Editor에서 지우면 돼요.
- 행사 사진은 한국관광공사 공공누리 1·3유형 중 포스터 모양 사진만 써요.
