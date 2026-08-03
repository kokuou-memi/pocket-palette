/* =========================================================
   ぽけっと♡ぱれっと — 配信中(LIVE)判定スクリプト
   =========================================================
   ★ここにあなたのYouTube Data API v3キーを入力してください★
   取得先: https://console.cloud.google.com/apis/credentials
   必ず「APIキーの制限」→「アプリケーションの制限」で
   HTTPリファラーを自分のGitHub Pagesドメイン
   (例: https://あなたのユーザー名.github.io/*)に限定してください。
   制限しないと、キーを他人に使われて課金/停止のリスクがあります。
========================================================= */
const YT_API_KEY = "AIzaSyB2O6szcgjQI_1gx_cYcoyKei4kmtXOIAA";

/* 何分キャッシュを使い回すか(ブラウザのlocalStorageに保存)。
   検索APIは1回100クォータ消費し、1日の無料枠は10,000クォータです。
   短くしすぎるとクォータ切れになりやすいので5分を推奨します。 */
const CACHE_MINUTES = 5;
const CACHE_MS = CACHE_MINUTES * 60 * 1000;

/* 指定チャンネルが今ライブ配信中かどうかを判定する */
async function checkIsLive(channelId) {
  const cacheKey = `pkpl_live_${channelId}`;
  const now = Date.now();

  // キャッシュがあり、まだ有効期限内ならAPIを叩かずそれを使う
  try {
    const cachedRaw = localStorage.getItem(cacheKey);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw);
      if (now - cached.timestamp < CACHE_MS) {
        return cached.isLive;
      }
    }
  } catch (e) {
    // localStorageが使えない環境でも落ちないようにする
  }

  // APIキー未設定の場合は何もしない(コンソールに案内だけ出す)
  if (!YT_API_KEY || YT_API_KEY === "YOUR_YOUTUBE_API_KEY_HERE") {
    console.warn("[pkpl] YouTube APIキーが未設定です。js/main.js の YT_API_KEY を設定してください。");
    return false;
  }

  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${YT_API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API error: ${res.status}`);
    const data = await res.json();
    const isLive = Array.isArray(data.items) && data.items.length > 0;

    try {
      localStorage.setItem(cacheKey, JSON.stringify({ isLive, timestamp: now }));
    } catch (e) { /* 保存に失敗しても致命的ではないので無視 */ }

    return isLive;
  } catch (err) {
    console.error(`[pkpl] ライブ判定に失敗しました (channelId: ${channelId})`, err);
    // 失敗時は古いキャッシュがあればそれを使う、なければfalse扱い
    try {
      const cachedRaw = localStorage.getItem(cacheKey);
      if (cachedRaw) return JSON.parse(cachedRaw).isLive;
    } catch (e) { /* noop */ }
    return false;
  }
}

/* ページ内の全メンバーカードのLIVE表示を更新する */
async function updateAllLiveStatus() {
  const cards = document.querySelectorAll(".member-card[data-channel-id]");
  await Promise.all(
    Array.from(cards).map(async (card) => {
      const channelId = card.dataset.channelId;
      const isLive = await checkIsLive(channelId);
      card.classList.toggle("is-live", isLive);
    })
  );
}

document.addEventListener("DOMContentLoaded", () => {
  updateAllLiveStatus();
  // ページを開いたままの人のためにキャッシュ期間ごとに再チェック
  setInterval(updateAllLiveStatus, CACHE_MS);
});
