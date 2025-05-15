const storeResult = async (url, title, status, summary) => {
  const { records = {} } = await chrome.storage.local.get('records');
  const now = new Date().toLocaleString();
  if (!records[url]) records[url] = { title, history: [] };
  records[url].history.push({ timestamp: now, status, summary });
  records[url].last = { timestamp: now, status, summary };
  await chrome.storage.local.set({ records });
};

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.action !== 'runCheck') return;
  const { openaiKey, model, endpoint, systemMsg, promptTpl } =
    await chrome.storage.sync.get({ openaiKey: '', model: 'gpt-3.5-turbo', endpoint: '', systemMsg: '', promptTpl: '' });
  if (!openaiKey) return;
  const tree = await chrome.bookmarks.getTree();
  const list = [];
  (function walk(nodes) { for (const b of nodes) { if (b.url) list.push(b); if (b.children) walk(b.children); }})(tree);

  for (const b of list) {
    let status = false, summary = 'Error';
    try { await fetch(b.url, { method: 'HEAD' }); status = true; } catch {}
    const prompt = promptTpl.replace('{{title}}', b.title).replace('{{url}}', b.url);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openaiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: systemMsg }, { role: 'user', content: prompt }] })
      });
      const j = await res.json();
      summary = j.choices?.[0]?.message?.content?.trim() || 'No summary.';
    } catch {}
    await storeResult(b.url, b.title, status, summary);
  }
  chrome.runtime.sendMessage({ action: 'refreshDashboard' });
});