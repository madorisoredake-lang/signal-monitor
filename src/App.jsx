import { useState, useEffect, useRef } from “react”;

// – THEME –––––––––––––––––––––––
const T = {
bg:      “#f0f2f5”,
surface: “#ffffff”,
card:    “#ffffff”,
border:  “#e2e8f0”,
header:  “#1e293b”,
text:    “#1e293b”,
sub:     “#64748b”,
dim:     “#94a3b8”,
jp:      “#d62b4b”,
crypto:  “#4f46e5”,
bull:    “#059669”,
bear:    “#dc2626”,
neu:     “#d97706”,
};

// – WATCHLIST ——————————————
const WATCHLIST = [
{id:“3611”, label:“マツオカ”,    type:“jp”},
{id:“378A”, label:“ヒット”,      type:“jp”},
{id:“6240”, label:“ヤマシン”,    type:“jp”},
{id:“7510”, label:“たけびし”,    type:“jp”},
{id:“7837”, label:“アールシーコア”, type:“jp”},
{id:“9622”, label:“スペース”,    type:“jp”},
{id:“BTC”,  label:“BTC”,         type:“crypto”},
{id:“ETH”,  label:“ETH”,         type:“crypto”},
{id:“XRP”,  label:“XRP”,         type:“crypto”},
{id:“SHIB”, label:“SHIB”,        type:“crypto”},
{id:“DOGE”, label:“DOGE”,        type:“crypto”},
];

const TAPE_ITEMS = [
[“マツオカ3611”,“2,441”,”-0.08%”,false], [“ヒット378A”,“2,495”,”+11.4%”,true],
[“ヤマシン6240”,“510”,”-20.9%”,false],   [“たけびし7510”,“2,577”,”+8.1%”,true],
[“7837”,“335”,”-48.5%”,false],           [“スペース9622”,“1,617”,”+12.1%”,true],
[“BTC”,“JPY14.52M”,”+3.5%”,true],         [“ETH”,“JPY481K”,”+1.8%”,true],
[“XRP”,“JPY223”,”+28%”,true],             [“DOGE”,“JPY15”,”+4%”,true],
];

const SEGS = [
[“ALL”,“all”,null], [“JP株”,“jp”,T.jp], [“CRYPTO”,“crypto”,T.crypto],
[”^BULL”,“bull”,T.bull], [“vBEAR”,“bear”,T.bear],
];

// – SENTIMENT HELPERS –––––––––––––––––
function sc(s) { return s===“bull”?T.bull:s===“bear”?T.bear:T.neu; }
function si(s) { return s===“bull”?”^”:s===“bear”?“v”:”*”; }

// – ARTICLE CARD —————————————
function Card({ a, idx }) {
const [open, setOpen] = useState(false);
const color = sc(a.sentiment);
const catColor = a.category===“jp” ? T.jp : T.crypto;
return React.createElement(“div”, {
onClick: () => setOpen(o => !o),
style: {
background: T.card, borderRadius: 8, padding: “14px 15px”,
cursor: “pointer”, borderLeft: “3px solid “+color,
border: “1px solid “+T.border, borderLeftWidth: 3, borderLeftColor: color,
boxShadow: “0 1px 4px rgba(0,0,0,0.06)”,
animation: “fadeUp 0.25s ease “+(Math.min(idx*0.03,0.3))+“s both”,
transition: “box-shadow 0.15s”,
}
},
// header row
React.createElement(“div”, { style:{ display:“flex”, alignItems:“center”, gap:6, marginBottom:7, flexWrap:“wrap” } },
React.createElement(“span”, { style:{ fontSize:9, padding:“2px 7px”, borderRadius:3, background:catColor+“18”, color:catColor, fontWeight:700, letterSpacing:1 } },
a.category===“jp”?“JP株”:“CRYPTO”),
React.createElement(“span”, { style:{ fontSize:11, color:T.sub, fontFamily:“system-ui,sans-serif” } }, a.source),
React.createElement(“span”, { style:{ fontSize:9, padding:“2px 5px”, background:T.bg, borderRadius:3, color:T.dim } },
a.lang===“en”?“EN”:“JA”),
React.createElement(“span”, { style:{ marginLeft:“auto”, fontSize:11, color:T.dim } }, a.timeAgo)
),
// title
React.createElement(“div”, { style:{ fontSize:15, fontWeight:700, lineHeight:1.5, color:T.text, marginBottom:6, fontFamily:“system-ui,sans-serif” } }, a.title),
// body
React.createElement(“div”, { style:{ fontSize:12, color:T.sub, lineHeight:1.7, marginBottom:10, fontFamily:“system-ui,sans-serif” } }, a.body),
// tickers
(a.tickers||[]).length > 0 && React.createElement(“div”, { style:{ display:“flex”, gap:5, flexWrap:“wrap”, marginBottom:9 } },
(a.tickers||[]).map(t => React.createElement(“span”, { key:t,
style:{ fontSize:10, padding:“2px 7px”, borderRadius:3, background:catColor+“15”, color:catColor, fontWeight:600 } }, t))
),
// sentiment row
React.createElement(“div”, { style:{ display:“flex”, alignItems:“center”, justifyContent:“space-between” } },
React.createElement(“div”, { style:{ display:“flex”, alignItems:“center”, gap:5 } },
React.createElement(“span”, null, si(a.sentiment)),
React.createElement(“span”, { style:{ fontSize:11, fontWeight:700, color:color, letterSpacing:0.5 } }, (a.sentiment||””).toUpperCase()),
React.createElement(“span”, { style:{ fontSize:11, color:T.dim, fontFamily:“system-ui,sans-serif” } }, “ — “+(a.sentimentReason||””))
),
React.createElement(“div”, { style:{ display:“flex”, alignItems:“center”, gap:3 } },
React.createElement(“span”, { style:{ fontSize:9, color:T.dim, marginRight:2 } }, “IMP”),
[0,1,2,3,4].map(k => React.createElement(“div”, { key:k,
style:{ width:5, height:5, borderRadius:“50%”, background: k<Math.round((a.impact||0.5)*5)?color:T.border } }))
)
),
// AI expand
open && React.createElement(“div”, { style:{ marginTop:10, padding:“10px 12px”, background:”#f8fafc”, borderRadius:5, border:“1px solid “+T.border } },
React.createElement(“div”, { style:{ fontSize:9, letterSpacing:2, color:T.crypto, fontWeight:700, marginBottom:5 } }, “AI ANALYSIS”),
React.createElement(“div”, { style:{ fontSize:12, color:T.sub, lineHeight:1.8, fontFamily:“system-ui,sans-serif” } }, a.aiAnalysis)
)
);
}

// – GAUGE –––––––––––––––––––––––
function Gauge({ articles }) {
if (!articles.length) return React.createElement(“div”, { style:{ fontSize:12, color:T.dim, padding:“8px 0” } }, “データなし”);
const n = articles.length;
const b = articles.filter(a=>a.sentiment===“bull”).length;
const r = articles.filter(a=>a.sentiment===“bear”).length;
const bp = Math.round(b/n*100), rp = Math.round(r/n*100), np = 100-bp-rp;
const [lbl,lc] = bp>rp+10?[“BULLISH”,T.bull]:rp>bp+10?[“BEARISH”,T.bear]:[“NEUTRAL”,T.neu];
return React.createElement(“div”, { style:{ display:“flex”, flexDirection:“column”, gap:8 } },
React.createElement(“div”, { style:{ display:“flex”, justifyContent:“space-between”, alignItems:“baseline” } },
React.createElement(“span”, { style:{ fontSize:18, fontWeight:900, color:lc, letterSpacing:1 } }, lbl),
React.createElement(“span”, { style:{ fontSize:10, color:T.dim } }, new Date().toLocaleTimeString(“ja-JP”,{hour:“2-digit”,minute:“2-digit”})+” JST”)
),
React.createElement(“div”, { style:{ height:6, background:T.border, borderRadius:3, overflow:“hidden”, display:“flex” } },
React.createElement(“div”, { style:{ width:bp+”%”, background:T.bull, transition:“width 0.8s” } }),
React.createElement(“div”, { style:{ width:np+”%”, background:T.neu, transition:“width 0.8s” } }),
React.createElement(“div”, { style:{ width:rp+”%”, background:T.bear, transition:“width 0.8s” } })
),
React.createElement(“div”, { style:{ display:“grid”, gridTemplateColumns:“1fr 1fr 1fr”, gap:6 } },
[[“BULL”,bp,T.bull],[“NEU”,np,T.neu],[“BEAR”,rp,T.bear]].map(([l,v,c]) =>
React.createElement(“div”, { key:l, style:{ background:T.bg, border:“1px solid “+T.border, borderRadius:4, padding:“5px 3px”, textAlign:“center” } },
React.createElement(“div”, { style:{ fontSize:15, fontWeight:900, color:c } }, v+”%”),
React.createElement(“div”, { style:{ fontSize:9, color:T.dim, letterSpacing:1, marginTop:2 } }, l)
)
)
)
);
}

// – MAIN APP —————————————––
export default function App() {
const [articles, setArticles]   = useState([]);
const [trending, setTrending]   = useState([]);
const [sources,  setSources]    = useState([]);
const [loading,  setLoading]    = useState(false);
const [error,    setError]      = useState(null);
const [filters,  setFilters]    = useState(new Set());
const [seg,      setSeg]        = useState(“all”);
const tapeRef = useRef(null);

// – FETCH NEWS via Anthropic API + web_search tool –
const fetchNews = async () => {
setLoading(true);
setError(null);
const ids = WATCHLIST.map(w=>w.id).join(”, “);
const today = new Date().toLocaleDateString(“ja-JP”);

```
try {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{
        role: "user",
        content:
          "今日(" + today + ")の以下の銘柄に関する最新ニュースを検索して、JSON形式で返してください。銘柄: " + ids + ". " +
          "web_searchで各銘柄の最新情報を検索した後、以下の形式のJSONのみを返してください(マークダウン不要): " +
          "{\"articles\":[{\"id\":\"1\",\"title\":\"...\",\"body\":\"...\",\"source\":\"...\",\"category\":\"jp or crypto\",\"lang\":\"ja or en\",\"sentiment\":\"bull or bear or neutral\",\"sentimentReason\":\"...\",\"aiAnalysis\":\"...\",\"impact\":0.8,\"tickers\":[\"3611\"],\"timeAgo\":\"xx分前\"}],\"trending\":[{\"kw\":\"...\",\"n\":10,\"t\":\"up\"}],\"sources\":[{\"name\":\"...\",\"ok\":true,\"n\":5}]}" +
          " articlesは10件、trendingは6件、sourcesは5件。JSONのみ出力。"
      }]
    })
  });

  const data = await res.json();

  // gather all text blocks (web_search results + final text)
  const text = (data.content || [])
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("");

  const start = text.indexOf("{");
  const end   = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("JSON not found in response");

  const parsed = JSON.parse(text.slice(start, end + 1));
  setArticles(parsed.articles  || []);
  setTrending(parsed.trending  || []);
  setSources (parsed.sources   || []);
} catch (e) {
  setError(e.message);
  // fallback to static data so app is still usable
  loadFallback();
}
setLoading(false);
```

};

const loadFallback = () => {
const times = [“たった今”,“5分前”,“12分前”,“25分前”,“40分前”,“1時間前”,“1.5時間前”,“2時間前”,“2.5時間前”,“3時間前”];
const base = [
{id:“1”,cat:“jp”,lang:“ja”,sentiment:“bear”,source:“日経電子版”,impact:0.85,tickers:[“7837”],sentimentReason:“住宅需要減退”,title:“アールシーコア(7837)、通期営業利益を30%下方修正 — ログハウス需要が急減”,body:“高金利環境下での住宅着工件数の落ち込みとログ材の調達コスト上昇が直撃。株価は年初来安値圏で推移している。”,aiAnalysis:“住宅関連株は日銀利上げ継続シナリオ下で引き続き逆風。PBR0.4倍台と割安感も台頭しているが、業績回復のカタリストが見えない状況では反発も限定的。”},
{id:“2”,cat:“jp”,lang:“ja”,sentiment:“bull”,source:“Bloomberg”,impact:0.78,tickers:[“378A”],sentimentReason:“ゲーム好調・増益期待”,title:“ヒット(378A)、新作ゲームが累計100万DL突破 — 上方修正に期待”,body:“新作モバイルゲームが配信開始から3週間で累計100万ダウンロードを突破。課金率も想定を上回り、第2四半期業績の上振れが見込まれている。”,aiAnalysis:“モバイルゲーム市場での新タイトル成功は収益の安定化に直結。IPの海外展開次第では更なる収益拡大の余地あり。”},
{id:“3”,cat:“jp”,lang:“ja”,sentiment:“neutral”,source:“ロイター”,impact:0.62,tickers:[“6240”],sentimentReason:“受注回復も利益率低迷”,title:“ヤマシンフィルタ(6240)、建機向けフィルター受注が緩やかに回復”,body:“建設機械向けフィルター受注が底打ちの兆しを見せている。中国・東南アジア向けが回復傾向にあるが、国内需要は依然として低調だ。”,aiAnalysis:“建機需要は中国インフラ投資の動向に大きく左右される。持続性には不透明感が残り、損切りか保有継続かの判断が迫られる局面。”},
{id:“4”,cat:“jp”,lang:“ja”,sentiment:“bull”,source:“日経電子版”,impact:0.80,tickers:[“7510”],sentimentReason:“データセンター需要拡大”,title:“たけびし(7510)、データセンター向け電気設備の受注が急増”,body:“AI関連インフラ投資の恩恵を受け、データセンター向け電気設備・空調機器の受注残高が過去最高水準に達した。”,aiAnalysis:“AIインフラ投資ブームの中で機電商社への恩恵は継続中。たけびしは特定メーカーへの依存度が低く、需要増に機動的に対応できる。”},
{id:“5”,cat:“jp”,lang:“ja”,sentiment:“bull”,source:“四季報”,impact:0.72,tickers:[“3611”],sentimentReason:“コスト改善・受注拡大”,title:“マツオカ(3611)、バングラデシュ工場の生産効率が改善”,body:“主力工場における生産効率改善施策の成果が出始め、原材料コストの安定化も追い風となっている。”,aiAnalysis:“アパレルOEMは為替と原材料コストに業績が左右されやすい。円高局面では輸出採算が改善するが、人件費上昇が利益率の上限を抑える。”},
{id:“6”,cat:“jp”,lang:“ja”,sentiment:“bull”,source:“日経電子版”,impact:0.75,tickers:[“9622”],sentimentReason:“オフィス回帰・稼働率上昇”,title:“スペース(9622)、首都圏オフィス移転需要が回復 — 2年ぶり高稼働率”,body:“テレワーク縮小に伴うオフィス回帰トレンドが業績を押し上げている。法人顧客からの受注が急増。”,aiAnalysis:“コロナ後のオフィス回帰は都市部から着実に進行中。現在の株価水準はPER・PBRともに割安感あり。”},
{id:“7”,cat:“crypto”,lang:“ja”,sentiment:“bull”,source:“CoinPost”,impact:0.90,tickers:[“BTC”],sentimentReason:“ETF流入・需給逼迫”,title:“ビットコイン、半減期後の需給逼迫とETF流入で1400万円台を回復”,body:“半減期による供給減少とブラックロックなどETF経由資金流入が継続。1BTCあたり1400万円台を回復した。”,aiAnalysis:“機関資金の流入継続はBTCの需給構造を根本から変えつつある。目先の抵抗線突破後は1600万円台を試す展開も。”},
{id:“8”,cat:“crypto”,lang:“ja”,sentiment:“bull”,source:“CoinPost”,impact:0.82,tickers:[“ETH”],sentimentReason:“Pectraアップグレード成功”,title:“イーサリアム、Pectraアップグレード成功でガス代60%削減”,body:“Pectraハードフォークが無事完了し、平均トランザクションコストが60%削減。DeFi・NFT市場でのユーザー活動が急増。”,aiAnalysis:“ガス代削減はETHの実用性を高め保有メリットを拡大。ステーキング収益と合わせてETH保有の長期的な魅力が増している。”},
{id:“9”,cat:“crypto”,lang:“ja”,sentiment:“bull”,source:“CoinPost”,impact:0.88,tickers:[“XRP”],sentimentReason:“SEC訴訟和解・28%急騰”,title:“XRP、Ripple対SEC訴訟が最終和解 — 28%急騰”,body:“Ripple社と米SECが法廷闘争に終止符を打ち最終和解に合意。XRPは24時間で28%急騰し保有者の含み益が大幅に拡大した。”,aiAnalysis:“訴訟リスク解消後は機関投資家の参入が加速する可能性あり。5293枚の保有者は利益確定のタイミングを慎重に検討すべき局面。”},
{id:“10”,cat:“crypto”,lang:“ja”,sentiment:“neutral”,source:“CoinDesk”,impact:0.55,tickers:[“SHIB”],sentimentReason:“ミームコイン・高ボラ”,title:“SHIB、ミームコインブームで一時急騰も利益確定売りに押される”,body:“シバイヌがミームコインブームの再燃を受けて一時急騰したが、その後は利益確定売りに押されている。”,aiAnalysis:“SHIBはセンチメントで価格が動く。急落リスクも高いため損切りラインの設定を推奨。”},
{id:“11”,cat:“crypto”,lang:“ja”,sentiment:“bull”,source:“CoinPost”,impact:0.68,tickers:[“DOGE”],sentimentReason:“決済採用拡大”,title:“ドージコイン、米大手小売チェーンでの決済導入が正式発表”,body:“米国の大手小売チェーンがDOGEによる決済を正式導入。実用通貨としての採用事例が増加している。”,aiAnalysis:“決済手段としての採用拡大はDOGEの実用価値を高める。コミュニティの活発さも継続中で強気目線を維持。”},
{id:“12”,cat:“jp”,lang:“ja”,sentiment:“bear”,source:“日経電子版”,impact:0.70,tickers:[“7837”,“6240”],sentimentReason:“利上げ・中小型株逆風”,title:“日銀利上げ観測で中小型株に売り圧力 — 住宅・建機関連に逃避売り”,body:“日銀の追加利上げ観測が再燃し、資金調達コストへの影響懸念から中小型株全般に売り圧力が強まっている。”,aiAnalysis:“利上げ局面では中小型株のバリュエーション圧縮が起きやすい。ポートフォリオ全体のリスク管理を優先したい。”},
];
setArticles(base.sort(()=>Math.random()-0.5).map((a,i)=>({…a,category:a.cat,timeAgo:times[i%times.length]})));
setTrending([
{kw:“XRP急騰”,n:20,t:“up”},{kw:“ビットコイン”,n:17,t:“up”},{kw:“日銀利上げ”,n:15,t:“up”},
{kw:“Pectraアップグレード”,n:13,t:“up”},{kw:“アールシーコア”,n:10,t:“down”},{kw:“中小型株売り”,n:7,t:“down”},
]);
setSources([
{name:“日経電子版”,ok:true,n:5},{name:“CoinPost”,ok:true,n:4},{name:“Bloomberg”,ok:true,n:3},
{name:“CoinDesk”,ok:true,n:3},{name:“ロイター”,ok:true,n:2},
]);
};

useEffect(() => { fetchNews(); }, []);

const toggle = id => setFilters(p => { const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n; });

const filtered = articles.filter(a => {
const ms = seg===“all” || a.category===seg || (seg===“bull”&&a.sentiment===“bull”) || (seg===“bear”&&a.sentiment===“bear”);
const mw = filters.size===0 || (a.tickers||[]).some(t=>filters.has(t));
return ms && mw;
});

// – RENDER —————————————–
const globalStyle = `* { box-sizing:border-box; margin:0; padding:0; } html,body,#root { height:100%; } @keyframes fadeUp { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} } @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.25} } @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} } @keyframes spin   { to{transform:rotate(360deg)} } ::-webkit-scrollbar { width:3px; } ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:2px; }`;

return React.createElement(“div”, {
style: { display:“flex”, flexDirection:“column”, height:“100vh”, overflow:“hidden”, background:T.bg, fontFamily:”‘Courier New’,monospace”, fontSize:13, color:T.text }
},
React.createElement(“style”, { dangerouslySetInnerHTML:{ __html: globalStyle } }),

```
// -- TOPBAR (fixed) -----------------------------
React.createElement("div", { style:{ flexShrink:0, display:"flex", alignItems:"stretch", height:50, background:T.header, zIndex:100 } },
  React.createElement("div", { style:{ display:"flex", alignItems:"center", padding:"0 16px", borderRight:"1px solid #334155", flexShrink:0 } },
    React.createElement("div", null,
      React.createElement("div", { style:{ fontSize:18, fontWeight:900, letterSpacing:4, color:"#f8fafc" } }, "SIGNAL"),
      React.createElement("div", { style:{ fontSize:8, color:"#64748b", letterSpacing:2 } }, "日本株 x 暗号資産")
    )
  ),
  React.createElement("div", { style:{ flex:1, overflow:"hidden", display:"flex", alignItems:"center" } },
    React.createElement("div", { ref:tapeRef, style:{ display:"flex", gap:20, animation:"ticker 35s linear infinite", whiteSpace:"nowrap", paddingLeft:16 } },
      [...TAPE_ITEMS,...TAPE_ITEMS].map(([n,p,c,pos],i) =>
        React.createElement("span", { key:i, style:{ display:"inline-flex", gap:5, fontSize:11 } },
          React.createElement("span", { style:{ color:"#64748b" } }, n),
          React.createElement("span", { style:{ color:"#f1f5f9" } }, p),
          React.createElement("span", { style:{ color:pos?"#34d399":"#f87171" } }, c)
        )
      )
    )
  ),
  React.createElement("div", { style:{ display:"flex", alignItems:"center", gap:5, padding:"0 12px", borderLeft:"1px solid #334155", fontSize:9, color:"#64748b", letterSpacing:2 } },
    React.createElement("div", { style:{ width:5, height:5, borderRadius:"50%", background:T.bull, animation:"blink 2.5s ease-in-out infinite" } }),
    "LIVE"
  ),
  React.createElement("button", {
    onClick: fetchNews, disabled: loading,
    style:{ padding:"0 14px", background:"transparent", border:"none", borderLeft:"1px solid #334155", color:"#94a3b8", fontFamily:"inherit", fontSize:10, letterSpacing:1, cursor:"pointer" }
  }, loading ? "......" : "R REFRESH")
),

// -- WATCHLIST (fixed) --------------------------
React.createElement("div", { style:{ flexShrink:0, display:"flex", alignItems:"center", height:42, padding:"0 14px", borderBottom:"1px solid "+T.border, gap:5, overflowX:"auto", background:T.surface, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" } },
  React.createElement("span", { style:{ fontSize:8, color:T.dim, letterSpacing:2, flexShrink:0, marginRight:4 } }, "WATCHLIST"),
  WATCHLIST.map(w => {
    const col = w.type==="jp" ? T.jp : T.crypto;
    const on  = filters.has(w.id);
    return React.createElement("button", { key:w.id, onClick:()=>toggle(w.id),
      style:{ display:"flex", alignItems:"center", gap:4, padding:"3px 9px", borderRadius:4, background:on?col+"18":T.bg, border:"1px solid "+(on?col:T.border), color:on?col:T.text, fontSize:11, fontFamily:"inherit", cursor:"pointer", flexShrink:0, transition:"all .15s" }
    },
      React.createElement("div", { style:{ width:4, height:4, borderRadius:"50%", background:col } }),
      w.label
    );
  }),
  filters.size > 0 && React.createElement("button", {
    onClick:()=>setFilters(new Set()),
    style:{ padding:"2px 7px", background:"transparent", border:"1px solid "+T.border, borderRadius:4, color:T.dim, fontSize:9, fontFamily:"inherit", cursor:"pointer", flexShrink:0 }
  }, "x")
),

// -- BODY (scrolls) -----------------------------
React.createElement("div", { style:{ flex:1, display:"grid", gridTemplateColumns:"3fr 1fr", overflow:"hidden" } },

  // LEFT: feed
  React.createElement("div", { style:{ display:"flex", flexDirection:"column", overflow:"hidden", borderRight:"1px solid "+T.border } },

    // seg tabs (fixed within feed)
    React.createElement("div", { style:{ flexShrink:0, display:"flex", alignItems:"center", height:38, padding:"0 14px", borderBottom:"1px solid "+T.border, background:T.surface } },
      SEGS.map(([l,v,c]) =>
        React.createElement("button", { key:v, onClick:()=>setSeg(v),
          style:{ height:"100%", padding:"0 10px", background:"transparent", border:"none", borderBottom:"2px solid "+(seg===v?(c||T.text):"transparent"), color:seg===v?(c||T.text):T.dim, fontFamily:"inherit", fontSize:10, letterSpacing:1, cursor:"pointer", textTransform:"uppercase", marginBottom:-1, whiteSpace:"nowrap", transition:"all .15s" }
        }, l)
      ),
      React.createElement("span", { style:{ marginLeft:"auto", fontSize:10, color:T.dim } }, filtered.length+" stories"),
      error && React.createElement("span", { style:{ fontSize:9, color:T.bear, marginLeft:8, maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" } }, "! "+error)
    ),

    // scrollable feed
    React.createElement("div", { style:{ flex:1, overflowY:"scroll", overflowX:"hidden", padding:"12px 14px", display:"flex", flexDirection:"column", gap:9 } },
      loading && React.createElement("div", { style:{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, padding:"60px 0" } },
        React.createElement("div", { style:{ width:24, height:24, border:"2px solid "+T.border, borderTopColor:T.crypto, borderRadius:"50%", animation:"spin .7s linear infinite" } }),
        React.createElement("span", { style:{ fontSize:11, color:T.dim } }, "ニュースを取得中..."),
        React.createElement("span", { style:{ fontSize:10, color:T.dim, opacity:0.7 } }, "Web検索でリアルタイム情報を取得しています")
      ),
      !loading && filtered.length === 0 && React.createElement("div", { style:{ textAlign:"center", padding:"40px 0", color:T.dim, fontSize:12 } }, "該当するニュースがありません"),
      !loading && filtered.map((a,i) => React.createElement(Card, { key:a.id, a:a, idx:i }))
    )
  ),

  // RIGHT: sidebar (scrolls independently)
  React.createElement("div", { style:{ overflowY:"auto", overflowX:"hidden", background:"#f8fafc" } },

    // sentiment
    React.createElement("div", { style:{ padding:"10px 10px", borderBottom:"1px solid "+T.border } },
      React.createElement("div", { style:{ fontSize:9, fontWeight:900, letterSpacing:2.5, color:T.dim, marginBottom:11, textTransform:"uppercase" } }, "MARKET SENTIMENT"),
      React.createElement(Gauge, { articles:articles })
    ),

    // trending
    React.createElement("div", { style:{ padding:"10px 10px", borderBottom:"1px solid "+T.border } },
      React.createElement("div", { style:{ fontSize:9, fontWeight:900, letterSpacing:2.5, color:T.dim, marginBottom:11, textTransform:"uppercase" } }, "TRENDING"),
      React.createElement("div", { style:{ display:"flex", flexDirection:"column", gap:3 } },
        trending.map((k,i) =>
          React.createElement("div", { key:i, style:{ display:"flex", alignItems:"center", gap:5, padding:"5px 7px", background:T.card, border:"1px solid "+T.border, borderRadius:4 } },
            React.createElement("span", { style:{ fontSize:9, color:T.dim, width:12 } }, i+1),
            React.createElement("span", { style:{ fontSize:11, flex:1, fontFamily:"system-ui,sans-serif" } }, k.kw),
            React.createElement("span", { style:{ fontSize:11, color:k.t==="up"?T.bull:k.t==="down"?T.bear:T.dim } }, k.t==="up"?"^":k.t==="down"?"v":">")
          )
        )
      )
    ),

    // sources
    React.createElement("div", { style:{ padding:"10px 10px" } },
      React.createElement("div", { style:{ fontSize:9, fontWeight:900, letterSpacing:2.5, color:T.dim, marginBottom:11, textTransform:"uppercase" } }, "NEWS SOURCES"),
      React.createElement("div", { style:{ display:"flex", flexDirection:"column", gap:3 } },
        sources.map((s,i) =>
          React.createElement("div", { key:i, style:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"5px 7px", background:T.card, border:"1px solid "+T.border, borderRadius:4 } },
            React.createElement("span", { style:{ fontSize:11, fontFamily:"system-ui,sans-serif" } }, s.name),
            React.createElement("div", { style:{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:T.dim } },
              React.createElement("div", { style:{ width:5, height:5, borderRadius:"50%", background:s.ok?T.bull:T.neu } }),
              s.n+"件"
            )
          )
        )
      )
    )
  )
)
```

);
}
