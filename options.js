(async () => {
  // Predefined model list with limits
  const modelData = [
    { name: 'gpt-3.5-turbo'},
    { name: 'gpt-3.5-turbo-0125'},
    { name: 'gpt-3.5-turbo-1106'},
    { name: 'gpt-3.5-turbo-16k'},
    { name: 'gpt-4.1-2025-04-14'},
    { name: 'gpt-4o-mini-2024-07-18'},
    { name: 'gpt-4o-audio-preview-2024-12-17'},
    { name: 'gpt-4o-mini-search-preview-2025-03-11'},
    { name: 'babbage-002'},
    { name: 'davinci-002'},
    { name: 'dall-e-2'}
  ];

  // Elements
  const apiKeyEl = document.getElementById('apiKey');
  const endpointEl = document.getElementById('endpoint');
  const modelEl = document.getElementById('model');
  const customSection = document.getElementById('customSection');
  const customModelNameEl = document.getElementById('customModelName');
  const systemMsgEl = document.getElementById('systemMsg');
  const promptTplEl = document.getElementById('promptTpl');
  const statusMsg = document.getElementById('statusMsg');
  const modelLimitsBody = document.getElementById('modelLimits');

  // Populate model select and limits table
  modelData.forEach(m => {
    const opt = document.createElement('option'); opt.value = m.name; opt.textContent = m.name;
    modelEl.append(opt);
    const row = document.createElement('tr');
    row.innerHTML = `<td>${m.name}</td>`;
    modelLimitsBody.append(row);
  });
  // Add custom option
  const customOpt = document.createElement('option'); customOpt.value = '__custom'; customOpt.textContent = 'Custom Model...';
  modelEl.append(customOpt);

  // Load saved settings
  const defaults = {
    openaiKey: '', endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo', customModel: '', systemMsg: 'You are a helpful assistant.',
    promptTpl: 'Summarize the purpose and content of this site:\nTitle: {{title}}\nURL: {{url}}'
  };
  const settings = await chrome.storage.sync.get(defaults);
  apiKeyEl.value = settings.openaiKey;
  endpointEl.value = settings.endpoint;
  systemMsgEl.value = settings.systemMsg;
  promptTplEl.value = settings.promptTpl;
  if (settings.model === '__custom') {
    modelEl.value = '__custom'; customSection.style.display = 'block';
    customModelNameEl.value = settings.customModel;
  } else {
    modelEl.value = settings.model;
  }

  // Toggle custom input
  modelEl.addEventListener('change', () => {
    if (modelEl.value === '__custom') customSection.style.display = 'block';
    else customSection.style.display = 'none';
  });

  // Save
  document.getElementById('saveBtn').addEventListener('click', async () => {
    const m = modelEl.value === '__custom' ? customModelNameEl.value.trim() : modelEl.value;
    if (!apiKeyEl.value.trim()) return alert('API key is required');
    await chrome.storage.sync.set({
      openaiKey: apiKeyEl.value.trim(), endpoint: endpointEl.value.trim(),
      model: modelEl.value, customModel: customModelNameEl.value.trim(), systemMsg: systemMsgEl.value.trim(),
      promptTpl: promptTplEl.value.trim()
    });
    // If custom, override model
    if (modelEl.value === '__custom') await chrome.storage.sync.set({ model: customModelNameEl.value.trim() });
    statusMsg.textContent = 'Settings saved';
    setTimeout(() => statusMsg.textContent = '', 3000);
  });
})();
