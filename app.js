'use strict';
const one = selector => document.querySelector(selector);
const hk = document.documentElement.lang === 'zh-Hant';
const say = (sc, tc) => hk ? tc : sc;
// The static build resolves every local deadline in Australia/Sydney.
const ended = until => Boolean(until && Date.now() >= Number(until));
function normalize(text) {
  return text.normalize('NFKC').toLowerCase().replace(/[-_]/g,' ').replace(/\s+/g,' ').trim();
}
function showSchedule(container) {
  for (const slot of container.querySelectorAll('.slot')) slot.hidden = ended(slot.dataset.until);
  const expired = ended(container.dataset.expires);
  container.querySelector('.expired').hidden = !expired;
  const cal = container.querySelector('#addcal'); // “加到手机日历”：所有场次都结束后藏起来
  if (cal) cal.hidden = expired || Array.from(container.querySelectorAll('.slot')).every(slot => slot.hidden);
  return expired;
}
function watchDeadlines(render) {
  const deadlines = Array.from(document.querySelectorAll('[data-expires],[data-until]'),
    node => Number(node.dataset.until || node.dataset.expires)).filter(Boolean);
  let timer;
  function refresh() {
    clearTimeout(timer);
    const now = Date.now();
    render();
    const next = Math.min(...deadlines.filter(end => end > now));
    if (Number.isFinite(next)) timer = setTimeout(refresh,Math.min(next - now, 2147483647));
  }
  window.addEventListener('pageshow',refresh);
  document.addEventListener('visibilitychange',() => { if (!document.hidden) refresh(); });
  refresh();
}
const savedKey = 'dingge-saved-v1';

function readSaved() {
  try {
    const value = JSON.parse(localStorage.getItem(savedKey) || '[]');
    return new Set(Array.isArray(value) ? value : []);
  } catch { return new Set(); }
}
const size = one('#size');
function setSize(large) {
  document.documentElement.classList.toggle('large', large);
  size.textContent = large ? say('标准字','標準字') : '大字';
  size.setAttribute('aria-pressed', String(large));
}
try { setSize(localStorage.getItem('large') === '1'); } catch { setSize(false); }
size.onclick = () => {
  const large = size.getAttribute('aria-pressed') !== 'true';
  setSize(large);
  try { localStorage.setItem('large',large ? '1' : '0'); } catch {}
};

function directory() {
  const cards = Array.from(document.querySelectorAll('.card'));
  const tabs = Array.from(document.querySelectorAll('[data-view]'));
  const areaButtons = Array.from(document.querySelectorAll('[data-area]'));
  const topicButtons = Array.from(document.querySelectorAll('[data-topic]'));
  const search = one('#search');
  // 地区：选择记在本浏览器；条目的 data-areas 含 all 的（全国／全州通用）在任何地区都显示
  const areaKey = 'dingge-area-v1';
  const oldAreas = {'epping-carlingford':'ryde-eastwood'}; // 第 6 版早期的地区，现并入 Ryde·伊士活
  function readArea() {
    try {
      let saved = localStorage.getItem(areaKey);
      if (oldAreas[saved]) saved = oldAreas[saved];
      return areaButtons.some(button => button.dataset.area === saved) ? saved : 'all';
    } catch { return 'all'; }
  }
  let area = readArea();
  // 功能：只用在“查服务”里；选择记在本浏览器；搜索时不受功能限制
  const topicKey = 'dingge-topic-v1';
  function readTopic() {
    try {
      const saved = localStorage.getItem(topicKey);
      return topicButtons.some(button => button.dataset.topic === saved) ? saved : 'all';
    } catch { return 'all'; }
  }
  let topic = readTopic();
  const inTopic = card => topic === 'all' || (card.dataset.topics || '').split(' ').includes(topic);
  const topicName = () => topic === 'all' ? '' : one('[data-topic="' + topic + '"]').textContent;
  const inArea = card => area === 'all' || card.dataset.areas.split(' ').some(a => a === 'all' || a === area);
  const areaName = () => area === 'all' ? '' : one('[data-area="' + area + '"]').dataset.name;
  function heading(view) {
    const name = areaName();
    if (view === 'events') return name ? name + say('的活动','的活動') : say('悉尼活动','悉尼活動');
    if (view === 'contacts') return name ? name + say('：找谁用中文问','：找誰用中文問') : say('找谁用中文问','找誰用中文問');
    if (view === 'services' && topic !== 'all') return say('查服务：','查服務：') + topicName();
    return {services:say('生活服务与健康资料','生活服務與健康資料'),saved:say('我的收藏','我的收藏'),faq:say('最常见的问题','最常見的問題')}[view];
  }
  const views = ['events','services','contacts','faq','saved'];
  function render() {
    const route = location.hash.slice(1);
    const legacy = cards.find(card => card.dataset.id === route && card.querySelector('a'));
    if (legacy) { location.replace(legacy.querySelector('a').href); return; }
    const view = views.includes(route) ? route : 'events';
    const query = normalize(search.value);
    const all = Boolean(query && view !== 'saved');
    const saved = readSaved();
    let count = 0;
    for (const card of cards) {
      const expired = showSchedule(card);
      const eligible = view === 'saved' ? saved.has(card.dataset.id) && !(query && expired) : !expired && inArea(card) && (all || (card.dataset.group === view && (view !== 'services' || inTopic(card))));
      const when = card.querySelector('.when');
      const slots = Array.from(when.querySelectorAll('.slot'));
      const dates = slots.length ? slots.filter(slot => !slot.hidden).map(slot => slot.textContent).join(' ') : when.textContent;
      const match = normalize(card.dataset.search + ' ' + dates);
      card.hidden = !eligible || !query.split(' ').every(word => match.includes(word));
      if (!card.hidden) count++;
    }
    for (const tab of tabs) {
      if (tab.dataset.view === view && !all) tab.setAttribute('aria-current','page');
      else tab.removeAttribute('aria-current');
    }
    for (const button of areaButtons) button.setAttribute('aria-pressed', String(button.dataset.area === area));
    for (const button of topicButtons) button.setAttribute('aria-pressed', String(button.dataset.topic === topic));
    const faqMode = view === 'faq';
    one('#faq').hidden = !faqMode; // “常见问题”页：问题和答案直接摆出来，隐藏搜索框和卡片列表
    one('.directory').classList.toggle('faq-mode', faqMode);
    one('.areas').hidden = view === 'saved' || faqMode || (view === 'services' && !all); // 服务都是全国／全州通用，地区按钮在“查服务”里没作用，藏起来
    one('.topics').hidden = view !== 'services' || all;
    one('#heading').textContent = all ? say('搜索结果','搜尋結果') : heading(view);
    one('#count').textContent = view === 'saved' ? say('收藏保存在当前浏览器。','收藏保存在目前的瀏覽器。') : count + say(' 条',' 條');
    one('#empty').hidden = count !== 0 || faqMode;
    one('#empty').textContent = query ? say('没有找到，可以换个词试试。','沒有找到，可以換個詞試試。')
      : view === 'saved' ? say('还没有收藏。打开一条内容，点“收藏这条”，下次就能在这里找到。','還沒有收藏。打開一條內容，點「收藏這條」，下次就能在這裏找到。')
      : say('这个地区暂时没有内容。可以点上面的“全部”看看。','這個地區暫時沒有內容。可以點上面的「全部」看看。');
    const language = one('#language');
    language.hash = view;
  }
  for (const tab of tabs) tab.addEventListener('click',() => { search.value = ''; render(); });
  for (const button of areaButtons) button.addEventListener('click',() => {
    area = button.dataset.area;
    try { localStorage.setItem(areaKey,area); } catch {}
    render();
  });
  for (const button of topicButtons) button.addEventListener('click',() => {
    topic = button.dataset.topic;
    try { localStorage.setItem(topicKey,topic); } catch {}
    render();
  });
  one('#copy-prompt').onclick = async () => {
    const text = one('#ai-prompt').textContent;
    let copied = false;
    try { await navigator.clipboard.writeText(text); copied = true; } catch {
      const range = document.createRange(); range.selectNodeContents(one('#ai-prompt'));
      const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
      try { copied = document.execCommand('copy'); } catch {}
    }
    one('#ai-message').textContent = copied ? say('已复制，可以粘贴了。','已複製，可以貼上了。') : say('请长按上面的文字，选择复制。','請長按上面的文字，選擇複製。');
  };
  search.addEventListener('input',render);
  window.addEventListener('hashchange',() => { search.value = ''; render(); });
  watchDeadlines(render);
  window.addEventListener('storage',render);
}

function entry(detail) {
  const id = detail.dataset.id;
  const status = one('#message');
  const button = one('#save');
  const shareUrl = new URL(location.href);
  shareUrl.hash = '';
  shareUrl.search = '';
  const field = one('#share-url');
  field.value = shareUrl.href;
  function updateSaved() {
    const on = readSaved().has(id);
    button.textContent = on ? say('已收藏 · 取消','已收藏 · 取消') : say('收藏这条','收藏這條');
    button.setAttribute('aria-pressed',String(on));
  }
  button.onclick = () => {
    const saved = readSaved();
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    try {
      localStorage.setItem(savedKey,JSON.stringify([...saved]));
      status.textContent = saved.has(id) ? say('已存到本浏览器的“我的收藏”。','已存到本瀏覽器的「我的收藏」。') : say('已取消收藏。','已取消收藏。');
    } catch { status.textContent = say('浏览器未能保存。可以点“发给朋友”留存链接。','瀏覽器未能儲存。可以點「發給朋友」留存連結。'); }
    updateSaved();
  };
  watchDeadlines(() => showSchedule(detail));
  updateSaved();
  window.addEventListener('storage',updateSaved);
  window.addEventListener('pageshow',updateSaved);
  const inWeChat = /MicroMessenger/i.test(navigator.userAgent);
  one('#share').onclick = async () => {
    if (!inWeChat && navigator.share) {
      try { await navigator.share({title:document.title,url:shareUrl.href}); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    one('#share-options').hidden = false;
    one('#share-tip').textContent = inWeChat ? say('点微信右上角「···」，选择「发送给朋友」。也可以复制下方链接。','點微信右上角「···」，選擇「傳送給朋友」。也可以複製下方連結。') : say('复制这条链接，再粘贴到聊天窗口。','複製這條連結，再貼到聊天視窗。');
    one('#copy').focus();
  };
  one('#copy').onclick = async () => {
    let copied = false;
    try { await navigator.clipboard.writeText(field.value); copied = true; } catch {
      field.focus(); field.select();
      try { copied = document.execCommand('copy'); } catch {}
    }
    const message = copied ? say('链接已复制，可以粘贴给朋友。','連結已複製，可以貼給朋友。') : say('请长按链接，选择复制。','請長按連結，選擇複製。');
    one('#share-tip').textContent = message;
    status.textContent = message;
  };
}
function sharePage(button) {
  const status = one('#message');
  const field = one('#share-url');
  const url = new URL(button.dataset.url || location.href);
  url.hash = ''; url.search = '';
  field.value = url.href;
  const inWeChat = /MicroMessenger/i.test(navigator.userAgent);
  button.onclick = async () => {
    if (inWeChat && button.id === 'share-home' && /^https?:$/.test(location.protocol)) {
      // 微信菜单转发当前地址。去掉安装标记和当前栏目，让收件人进入普通首页。
      history.replaceState(history.state, '', location.pathname);
      window.dispatchEvent(new Event('hashchange'));
    }
    if (!inWeChat && navigator.share) {
      try { await navigator.share({title:document.title,url:url.href}); return; }
      catch (error) { if (error.name === 'AbortError') return; }
    }
    one('#share-options').hidden = false;
    one('#share-tip').textContent = inWeChat ? say('点微信右上角「···」，选择「发送给朋友」。也可以复制下方链接。','點微信右上角「···」，選擇「傳送給朋友」。也可以複製下方連結。') : say('复制这一页的链接，再粘贴到聊天窗口。','複製這一頁的連結，再貼到聊天視窗。');
    one('#copy').focus();
  };
  one('#copy').onclick = async () => {
    let copied = false;
    try { await navigator.clipboard.writeText(field.value); copied = true; } catch {
      field.focus(); field.select();
      try { copied = document.execCommand('copy'); } catch {}
    }
    const message = copied ? say('链接已复制，可以粘贴给朋友。','連結已複製，可以貼給朋友。') : say('请长按链接，选择复制。','請長按連結，選擇複製。');
    one('#share-tip').textContent = message;
    status.textContent = message;
  };
}
const pageShare = one('#share-home, #share-about');
if (pageShare) sharePage(pageShare);
if (one('.cards')) directory();
if (one('.detail')) entry(one('.detail'));

// ---------- 手机桌面 App（PWA）：离线缓存、没网提醒、安装按钮、加到日历 ----------
const inWeChatApp = /MicroMessenger/i.test(navigator.userAgent);
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
(function offlineNotice() {
  const bar = document.createElement('p');
  bar.id = 'offline';
  bar.setAttribute('role', 'status');
  bar.textContent = say('现在没有网络，显示的是上次打开时保存的内容。打电话和查最新场次，要有信号才准。','現在沒有網絡，顯示的是上次打開時保存的內容。打電話和查最新場次，要有信號才準。');
  bar.hidden = navigator.onLine;
  document.body.prepend(bar);
  window.addEventListener('offline', () => { bar.hidden = false; });
  window.addEventListener('online', () => { bar.hidden = true; });
})();
const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
if (standalone) document.documentElement.classList.add('standalone');
const oldInstall = one('#install-home-link');
if (oldInstall) location.replace(oldInstall.href);

function setupHomeInstall(link) {
  const panel = one('#install-guide');
  const status = one('#install-msg');
  const nativeButton = one('#install-now');
  const agent = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/i.test(agent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(agent);
  let installed = standalone;
  let accepted = false;
  let installEvent;

  function device() {
    if (installed) return 'installed';
    if (accepted) return 'pending';
    if (inWeChatApp && (ios || android)) return 'wechat';
    if (ios) return /Version\/.*Safari\//.test(agent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(agent) ? 'ios' : 'ios-browser';
    if (android && installEvent) return 'ready';
    return android ? 'android' : 'desktop';
  }

  function refresh() {
    const current = device();
    for (const block of panel.querySelectorAll('[data-device]')) block.hidden = block.dataset.device !== current;
  }
  function reveal() {
    one('#share-options').hidden = true;
    link.setAttribute('aria-expanded','true');
    panel.hidden = false;
    refresh();
  }
  function clearInstallFlag() {
    const url = new URL(location.href);
    if (!url.searchParams.has('install')) return;
    url.searchParams.delete('install');
    history.replaceState(history.state, '', url);
  }
  function close() {
    panel.hidden = true;
    link.setAttribute('aria-expanded','false');
    clearInstallFlag();
  }
  async function promptInstall() {
    const event = installEvent;
    if (!event) return;
    installEvent = null;
    nativeButton.disabled = true;
    try {
      await event.prompt();
      const choice = await event.userChoice;
      accepted = choice.outcome === 'accepted';
    } catch {
      status.textContent = say('请从浏览器菜单添加。','請從瀏覽器選單加入。');
    } finally {
      nativeButton.disabled = false;
      refresh();
    }
  }
  window.addEventListener('beforeinstallprompt', event => {
    if (!android || inWeChatApp) return;
    event.preventDefault();
    installEvent = event;
    refresh();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    installEvent = null;
    status.textContent = '';
    refresh();
  });
  nativeButton.onclick = promptInstall;
  link.setAttribute('aria-expanded','false');
  link.onclick = event => {
    event.preventDefault();
    if (!panel.hidden) { close(); return; }
    reveal();
    if (device() === 'wechat' && /^https?:$/.test(location.protocol)) {
      const url = new URL(location.href);
      url.searchParams.set('install','1');
      history.replaceState(history.state,'',url);
    }
    if (device() === 'ready') promptInstall();
  };
  one('#close-install').onclick = () => { close(); link.focus(); };
  one('#share-home').addEventListener('click',close);
  if (new URL(location.href).searchParams.get('install') === '1') {
    reveal();
    if (device() !== 'wechat') clearInstallFlag();
  }
}
if (one('#home-install')) setupHomeInstall(one('#home-install'));
if (one('#addcal')) {
  one('#addcal').addEventListener('click', event => {
    if (inWeChatApp) { // 微信不让网页直接下载文件
      event.preventDefault();
      one('#message').textContent = say('微信里不能直接加到日历。请点右上角“···”，选“在浏览器打开”，再点这个按钮。','微信裡不能直接加到日曆。請點右上角「···」，選「在瀏覽器打開」，再點這個按鈕。');
    } else {
      one('#message').textContent = say('手机会问你要不要加入日历，点“添加”就好。日期时间以主办方最新通知为准。','手機會問你要不要加入日曆，點「添加」就好。日期時間以主辦方最新通知為準。');
    }
  });
}

// 外部官方网页自动翻译成中文（Justin 2026-11-24 要求）：用 Google 网页翻译（translate.goog）打开。
// 已实测：Services Australia、healthdirect、卫生部、Dementia Australia 能翻；My Aged Care、NDIS、Service NSW、Beyond Blue 翻不动，
// 它们（以及已经是中文、要登录办理或不是网页的链接）直接打开原网址。读者可在页脚关掉。
(function autoTranslate() {
  const key = 'dingge-translate-v1';
  const skipHosts = ['translate.goog','myagedcare.gov.au','ndis.gov.au','service.nsw.gov.au','beyondblue.org.au',
    'chatgpt.com','commons.wikimedia.org','mygov.gov.au','my.gov.au','gcaahealth.com','csfa.au','gwtp168.com','austacare.com.au','hawapurecare.com.au'];
  const skipPath = /zh-hans|zh-hant|chinese|中文|\.pdf($|\?)|translated-resources|\/languages/i;
  let on = true;
  try { on = localStorage.getItem(key) !== 'off'; } catch {}
  // 栏目切换会把语言链接补成完整网址。站内导航不交给外部翻译。
  const links = Array.from(document.querySelectorAll('a[href^="http"]'))
    .filter(link => link.origin !== location.origin);
  for (const a of links) a.dataset.orig = a.getAttribute('href');
  function translated(href) {
    const url = new URL(href);
    if (skipHosts.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) return null;
    if (skipPath.test(url.pathname + url.search)) return null;
    const host = url.hostname.replace(/-/g,'--').replace(/\./g,'-') + '.translate.goog';
    const q = new URLSearchParams(url.search);
    q.set('_x_tr_sl','auto'); q.set('_x_tr_tl', hk ? 'zh-TW' : 'zh-CN'); q.set('_x_tr_hl', hk ? 'zh-TW' : 'zh-CN'); q.set('_x_tr_pto','wapp');
    return 'https://' + host + url.pathname + '?' + q.toString() + url.hash;
  }
  function apply() {
    for (const a of links) {
      const t = on ? translated(a.dataset.orig) : null;
      a.href = t || a.dataset.orig;
    }
    const box = document.querySelector('#auto-translate');
    if (box) box.checked = on;
  }
  apply();
  const box = document.querySelector('#auto-translate');
  if (box) box.addEventListener('change', () => {
    on = box.checked;
    try { localStorage.setItem(key, on ? 'on' : 'off'); } catch {}
    apply();
  });
})();
