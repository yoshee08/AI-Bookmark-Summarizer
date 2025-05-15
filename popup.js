document.getElementById('runBtn').onclick = () => chrome.runtime.sendMessage({ action: 'runCheck' });
document.getElementById('dashBtn').onclick = () => chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') });
document.getElementById('optionsBtn').onclick = () => chrome.runtime.openOptionsPage();
