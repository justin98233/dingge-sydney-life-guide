// 离线缓存（自动生成，别手改）。版本：20261125110900
// 页面、脚本、样式：先联网取最新，没网才用上次保存的；图片：先用保存的。
const CACHE = 'dingge-20261125110900';
const CORE = ["about-hk.html", "about.html", "app.js", "apple-touch-icon.png", "art-banner.svg", "art-benefits.svg", "art-care.svg", "art-events.svg", "art-health.svg", "art-home.svg", "art-mountains.svg", "art-street.svg", "art-travel.svg", "art-tulou.svg", "cal-cass-settlement-parramatta-hk.ics", "cal-cass-settlement-parramatta.ics", "cal-choir-darling-square-hk.ics", "cal-choir-darling-square.ics", "cal-christmas-concert-hk.ics", "cal-christmas-concert.ics", "cal-lifeline-connect-hk.ics", "cal-lifeline-connect.ics", "cal-lunar-new-year-hk.ics", "cal-lunar-new-year.ics", "cal-magic-of-christmas-hk.ics", "cal-magic-of-christmas.ics", "cal-mahjong-hk.ics", "cal-mahjong.ics", "cal-mandarin-computer-parramatta-hk.ics", "cal-mandarin-computer-parramatta.ics", "cal-mindful-mornings-hk.ics", "cal-mindful-mornings.ics", "cal-music-darling-square-hk.ics", "cal-music-darling-square.ics", "cal-settlement-burwood-hk.ics", "cal-settlement-burwood.ics", "cal-tech-assist-burwood-hk.ics", "cal-tech-assist-burwood.ics", "cal-techie-surry-hills-hk.ics", "cal-techie-surry-hills.ics", "guide-active-creative-kids-hk.html", "guide-active-creative-kids.html", "guide-age-pension-hk.html", "guide-age-pension.html", "guide-aged-care-hk.html", "guide-aged-care-rights-hk.html", "guide-aged-care-rights.html", "guide-aged-care.html", "guide-ai-seniors-carlingford-hk.html", "guide-ai-seniors-carlingford.html", "guide-bone-hk.html", "guide-bone.html", "guide-carer-payment-hk.html", "guide-carer-payment.html", "guide-carer-respite-hk.html", "guide-carer-respite.html", "guide-cass-settlement-parramatta-hk.html", "guide-cass-settlement-parramatta.html", "guide-child-care-subsidy-hk.html", "guide-child-care-subsidy.html", "guide-child-dental-hk.html", "guide-child-dental.html", "guide-choir-darling-square-hk.html", "guide-choir-darling-square.html", "guide-christmas-concert-hk.html", "guide-christmas-concert.html", "guide-concession-cards-hk.html", "guide-concession-cards.html", "guide-csfa-hk.html", "guide-csfa.html", "guide-digital-hk.html", "guide-digital.html", "guide-disability-support-pension-hk.html", "guide-disability-support-pension.html", "guide-elder-abuse-hk.html", "guide-elder-abuse.html", "guide-energy-rebate-hk.html", "guide-energy-rebate.html", "guide-english-georges-river-hk.html", "guide-english-georges-river.html", "guide-english-hk.html", "guide-english.html", "guide-fall-plan-hk.html", "guide-fall-plan.html", "guide-falls-hk.html", "guide-falls.html", "guide-family-mediation-hk.html", "guide-family-mediation.html", "guide-family-tax-benefit-hk.html", "guide-family-tax-benefit.html", "guide-festival-money-hk.html", "guide-festival-money.html", "guide-gcaa-health-hk.html", "guide-gcaa-health.html", "guide-interpreter-hk.html", "guide-interpreter.html", "guide-learn-tech-hk.html", "guide-learn-tech.html", "guide-legal-planning-hk.html", "guide-legal-planning.html", "guide-lifeline-connect-hk.html", "guide-lifeline-connect.html", "guide-lifeline-hk.html", "guide-lifeline.html", "guide-lunar-new-year-hk.html", "guide-lunar-new-year.html", "guide-magic-of-christmas-hk.html", "guide-magic-of-christmas.html", "guide-mahjong-hk.html", "guide-mahjong.html", "guide-mandarin-computer-parramatta-hk.html", "guide-mandarin-computer-parramatta.html", "guide-medicare-safety-net-hk.html", "guide-medicare-safety-net.html", "guide-memory-worry-hk.html", "guide-memory-worry.html", "guide-mental-gp-plan-hk.html", "guide-mental-gp-plan.html", "guide-mental-support-hk.html", "guide-mental-support.html", "guide-mindful-mornings-hk.html", "guide-mindful-mornings.html", "guide-music-darling-square-hk.html", "guide-music-darling-square.html", "guide-ndis-hk.html", "guide-ndis.html", "guide-new-aged-care-act-hk.html", "guide-new-aged-care-act.html", "guide-newly-arrived-waiting-hk.html", "guide-newly-arrived-waiting.html", "guide-nsw-energy-rebates-hk.html", "guide-nsw-energy-rebates.html", "guide-nsw-seniors-card-hk.html", "guide-nsw-seniors-card.html", "guide-nsw-spectacles-hk.html", "guide-nsw-spectacles.html", "guide-parental-leave-pay-hk.html", "guide-parental-leave-pay.html", "guide-preschool-nsw-hk.html", "guide-preschool-nsw.html", "guide-public-dental-hk.html", "guide-public-dental.html", "guide-rent-assistance-hk.html", "guide-rent-assistance.html", "guide-rental-help-hk.html", "guide-rental-help.html", "guide-scam-help-hk.html", "guide-scam-help.html", "guide-school-help-hk.html", "guide-school-help.html", "guide-school-travel-hk.html", "guide-school-travel.html", "guide-seniors-transport-hk.html", "guide-seniors-transport.html", "guide-settlement-burwood-hk.html", "guide-settlement-burwood.html", "guide-social-circle-hk.html", "guide-social-circle.html", "guide-support-at-home-hk.html", "guide-support-at-home.html", "guide-tech-assist-burwood-hk.html", "guide-tech-assist-burwood.html", "guide-techie-surry-hills-hk.html", "guide-techie-surry-hills.html", "guide-toll-relief-hk.html", "guide-toll-relief.html", "guide-visitor-companion-hk.html", "guide-visitor-companion.html", "guide-wednesday-hk.html", "guide-wednesday.html", "guide-wellness-travel-hk.html", "guide-wellness-travel.html", "guide-youth-allowance-hk.html", "guide-youth-allowance.html", "icon-192.png", "icon-512.png", "index-hk.html", "index.html", "install-hk.html", "install.html", "manifest-hk.webmanifest", "manifest.webmanifest", "park.jpg", "qr-hk.html", "qr.html", "research.html", "style.css"];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('dingge-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;  // 统计脚本等外部请求不管
  const fresh = req.mode === 'navigate' || /\.(html|js|css|ics|webmanifest)$/.test(url.pathname) || url.pathname.endsWith('/');
  event.respondWith(fresh ? networkFirst(req) : cacheFirst(req));
});
async function networkFirst(req) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(req);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (error) {
    const hit = await cache.match(req, {ignoreSearch: true});
    if (hit) return hit;
    if (req.mode === 'navigate') {
      const home = await cache.match('index.html');
      if (home) return home;
    }
    throw error;
  }
}
async function cacheFirst(req) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(req, {ignoreSearch: true});
  if (hit) return hit;
  const res = await fetch(req);
  if (res && res.ok) cache.put(req, res.clone());
  return res;
}
