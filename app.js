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
  const areaName = () => area === 'all' ? '' : one('[data-area="' + area + '"]').textContent;
  function heading(view) {
    const name = areaName();
    if (view === 'events') return name ? name + say('的活动','的活動') : say('悉尼活动','悉尼活動');
    if (view === 'contacts') return name ? name + say('：找谁用中文问','：找誰用中文問') : say('找谁用中文问','找誰用中文問');
    if (view === 'services' && topic !== 'all') return say('查服务：','查服務：') + topicName();
    return {services:say('生活服务与健康资料','生活服務與健康資料'),saved:say('我的收藏','我的收藏')}[view];
  }
  const views = ['events','services','contacts','saved'];
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
    one('.areas').hidden = view === 'saved' || (view === 'services' && !all); // 服务都是全国／全州通用，地区按钮在“查服务”里没作用，藏起来
    one('.topics').hidden = view !== 'services' || all;
    one('#heading').textContent = all ? say('搜索结果','搜尋結果') : heading(view);
    one('#count').textContent = view === 'saved' ? say('收藏保存在当前浏览器。','收藏保存在目前的瀏覽器。') : count + say(' 条',' 條');
    one('#empty').hidden = count !== 0;
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
// 功能介绍页的“发给朋友”（2026-11-23）：和专题页一样，微信里提示用右上角转发，其他浏览器用系统分享或复制链接
function shareAbout(button) {
  const status = one('#message');
  const field = one('#share-url');
  const url = new URL(location.href);
  url.hash = ''; url.search = '';
  field.value = url.href;
  const inWeChat = /MicroMessenger/i.test(navigator.userAgent);
  button.onclick = async () => {
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
if (one('#share-about')) shareAbout(one('#share-about'));
if (one('.cards')) directory();
if (one('.detail')) entry(one('.detail'));
