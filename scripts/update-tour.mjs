// 한국관광공사 TourAPI(국문 관광정보 서비스_GW)에서 진행 중·예정 축제를 받아 data/tour.json 으로 저장합니다.
// GitHub Actions에서 매일 실행돼요. 인증키는 저장소 Secrets 의 TOUR_API_KEY 에 넣어 두세요.
import { writeFile } from "node:fs/promises";

const RAW = (process.env.TOUR_API_KEY || "").trim();
if (!RAW) { console.error("TOUR_API_KEY 가 없어요. 저장소 Settings → Secrets → Actions 에 추가해 주세요."); process.exit(1); }
const KEY = RAW.includes("%") ? RAW : encodeURIComponent(RAW);
const LICOK = { Type1: "공공누리 1유형", Type3: "공공누리 3유형" };
const AREA=[["서울","서울"],["부산","부산"],["대구","대구"],["인천","인천"],["광주","광주"],["대전","대전"],["울산","울산"],["세종","세종"],["경기","경기"],["강원","강원"],["충청북","충북"],["충북","충북"],["충청남","충남"],["충남","충남"],["전북","전북"],["전라북","전북"],["전라남","전남"],["전남","전남"],["경상북","경북"],["경북","경북"],["경상남","경남"],["경남","경남"],["제주","제주"]];
const regionOf = a => { a = String(a || ""); const f = AREA.find(([p]) => a.startsWith(p)); return f ? f[1] : ""; };
const ymd = s => { s = String(s || ""); return s.length === 8 ? s.slice(0,4)+"-"+s.slice(4,6)+"-"+s.slice(6,8) : ""; };
function guessCat(t){t=String(t);if(/반려|애견|펫|댕댕|강아지|고양이|캣|도그|DOG|PET/i.test(t))return"반려동물";if(/취업|채용|일자리|잡페어|JOB\s*FAIR|커리어/i.test(t))return"취업";if(/에버랜드|롯데월드|서울랜드|레고랜드|경주월드|이월드|오월드|패밀리랜드|환타지아|놀이공원|테마파크|유원지|눈썰매/i.test(t))return"테마파크";if(/박람회|엑스포|EXPO|페어|FAIR|전시회|쇼$/i.test(t))return"박람회";if(/카드\s*게임|TCG|유희왕|포켓몬\s*카드|원피스\s*카드/i.test(t))return"카드게임";if(/콘서트|내한/.test(t))return"콘서트";if(/DJ|EDM|디제이|일렉트로닉|클럽/i.test(t))return"DJ";if(/콘서트|재즈|락|록|밴드|음악|뮤직|힙합|가요|오케스트라|클래식|버스킹/.test(t))return"음악";if(/불꽃|빛|트리|크리스마스|해맞이|해넘이|일루미|겨울/.test(t))return"빛·겨울";if(/꽃|국화|단풍|억새|정원/.test(t))return"꽃";if(/음식|먹거리|맛|김장|떡|국수|곶감|사과|한우|굴|대게|과메기|막걸리|술|커피|빵/.test(t))return"먹거리";if(/게임|애니|코스프레|웹툰|만화/.test(t))return"서브컬처";return"축제"}

const kst = new Date(Date.now() + 9 * 3600e3);
const T = kst.toISOString().slice(0, 10);
const from = new Date(kst); from.setUTCMonth(from.getUTCMonth() - 3);
const fromStr = from.toISOString().slice(0, 10).replace(/-/g, "");

async function page(n) {
  const url = "https://apis.data.go.kr/B551011/KorService2/searchFestival2?serviceKey=" + KEY +
    "&MobileOS=ETC&MobileApp=CatchFesta&_type=json&numOfRows=500&pageNo=" + n + "&arrange=A&eventStartDate=" + fromStr;
  const r = await fetch(url);
  const t = await r.text();
  let d; try { d = JSON.parse(t); } catch { throw new Error("TourAPI 응답을 읽지 못했어요: " + t.slice(0, 200)); }
  const h = d?.response?.header;
  if (!d?.response || (h && h.resultCode !== "0000")) throw new Error("TourAPI 오류: " + JSON.stringify(h || d).slice(0, 200));
  let items = d.response.body?.items?.item || []; if (!Array.isArray(items)) items = [items];
  return { items, total: Number(d.response.body?.totalCount || 0) };
}

// 이미지 크기만 읽어서 포스터 모양(세로·정사각형)인지 확인 — 풍경·건물·매장 사진은 쓰지 않아요.
async function dims(url) {
  try {
    const r = await fetch(url.replace(/^http:/, "https:"), { headers: { Range: "bytes=0-65535" } });
    const b = new Uint8Array(await r.arrayBuffer());
    if (b[0] === 0x89 && b[1] === 0x50) return { w: (b[16]<<24|b[17]<<16|b[18]<<8|b[19]) >>> 0, h: (b[20]<<24|b[21]<<16|b[22]<<8|b[23]) >>> 0 };
    if (b[0] === 0xFF && b[1] === 0xD8) {
      let i = 2;
      while (i + 9 < b.length) {
        if (b[i] !== 0xFF) { i++; continue; }
        const m = b[i+1], len = b[i+2] << 8 | b[i+3];
        if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { h: b[i+5] << 8 | b[i+6], w: b[i+7] << 8 | b[i+8] };
        i += 2 + len;
      }
    }
  } catch {}
  return null;
}

const all = [];
let n = 1, total = 1;
while (all.length < total && n <= 10) { const p = await page(n); total = p.total; all.push(...p.items); if (!p.items.length) break; n++; }

const out = [];
for (const it of all) {
  const e = {
    id: "tour-" + it.contentid, contentid: String(it.contentid), title: it.title,
    start: ymd(it.eventstartdate), end: ymd(it.eventenddate), region: regionOf(it.addr1),
    place: [it.addr1, it.addr2].filter(Boolean).join(" "), category: guessCat(it.title),
    desc: it.tel ? "문의 " + it.tel : "", source: "https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=&contentId=" + it.contentid, from: "tour"
  };
  if (it.mapy && it.mapx) { e.lat = Number(it.mapy); e.lng = Number(it.mapx); }
  if (!e.start || !e.end || e.end < T || !e.region) continue;
  if (it.firstimage && LICOK[it.cpyrhtDivCd]) {
    const d = await dims(it.firstimage);
    if (d && d.w && d.h >= d.w * 0.9) {
      e.imageUrl = it.firstimage.replace(/^http:/, "https:");
      e.imageCredit = "사진: 한국관광공사 · " + LICOK[it.cpyrhtDivCd];
      e.imageFit = it.cpyrhtDivCd === "Type3" ? "contain" : "cover";
    }
  }
  out.push(e);
}
out.sort((a, b) => a.start < b.start ? -1 : a.start > b.start ? 1 : 0);
await writeFile(new URL("../data/tour.json", import.meta.url), JSON.stringify(out, null, 1) + "\n");
console.log("TourAPI 축제 " + out.length + "건 저장 (포스터 사진 " + out.filter(e => e.imageUrl).length + "건)");
