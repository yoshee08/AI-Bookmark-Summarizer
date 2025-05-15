const loadRecords = async () => {
  const { records = {} } = await chrome.storage.local.get('records');
  const tbody = document.getElementById('tbody'); tbody.innerHTML = '';
  for (const [url, data] of Object.entries(records)) {
    const { last } = data;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${data.title}</td>
      <td><a href="${url}" target="_blank">Visit</a></td>
      <td>${last.timestamp}</td>
      <td class="${last.status?'status-ok':'status-dead'}">${last.status?'OK':'Dead'}</td>
      <td>${last.summary.slice(0,80)}${last.summary.length>80?'...':''}</td>
      <td></td>
    `;
    const actions = tr.querySelector('td:last-child');
    const histBtn = document.createElement('button'); histBtn.textContent='History';
    histBtn.onclick = () => showHistory(data.history);
    const delBtn = document.createElement('button'); delBtn.textContent='Delete';
    delBtn.onclick = async () => { delete records[url]; await chrome.storage.local.set({records}); loadRecords(); };
    actions.append(histBtn, delBtn);
    tbody.append(tr);
  }
};

const showHistory = (history) => {
  const body = document.getElementById('histBody'); body.innerHTML = '';
  history.forEach(rec => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${rec.timestamp}</td><td class="${rec.status?'status-ok':'status-dead'}">${rec.status?'OK':'Dead'}</td><td>${rec.summary}</td>`;
    body.append(row);
  });
  document.getElementById('histModal').style.display='flex';
};

document.getElementById('closeHist').onclick = () => document.getElementById('histModal').style.display='none';
document.getElementById('refreshBtn').onclick = () => chrome.runtime.sendMessage({action:'runCheck'});
chrome.runtime.onMessage.addListener(msg => { if(msg.action==='refreshDashboard') loadRecords(); });
loadRecords();