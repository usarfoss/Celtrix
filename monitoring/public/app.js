(() => {
  const $ = (id) => document.getElementById(id);
  const rowsEl = $('rows');
  const totalEl = $('total');
  const errorsEl = $('errors');
  const p50El = $('p50');
  const p95El = $('p95');
  const storageKey = 'monitoring_api_key';
  const getApiKey = () => localStorage.getItem(storageKey) || '';
  const setApiKey = (k) => localStorage.setItem(storageKey, k || '');

  const trafficChart = new Chart(document.getElementById('trafficChart'), {
    type: 'line', data: { labels: [], datasets: [{ label: 'Requests/min', data: [], borderColor: '#4f46e5' }] }, options: { responsive: true, scales: { x: { display: false } } }
  });
  const statusChart = new Chart(document.getElementById('statusChart'), {
    type: 'doughnut', data: { labels: [], datasets: [{ data: [], backgroundColor: ['#16a34a','#f59e0b','#ef4444','#6366f1','#14b8a6'] }] }, options: { responsive: true }
  });
  const latencyChart = new Chart(document.getElementById('latencyChart'), {
    type: 'bar', data: { labels: ['P50','P95'], datasets: [{ data: [0,0], backgroundColor: ['#60a5fa','#f97316'] }] }, options: { responsive: true }
  });

  function fmtTs(ts) { return new Date(ts).toLocaleTimeString(); }
  function addRow(l) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${fmtTs(l.timestamp)}</td><td>${l.method}</td><td class="url">${l.url}</td><td>${l.status}</td><td>${l.responseTimeMs} ms</td><td>${l.clientIp}</td><td class="ua">${l.browser || ''}</td>`;
    rowsEl.prepend(tr);
    while (rowsEl.children.length > 200) rowsEl.removeChild(rowsEl.lastChild);
  }

  async function refreshAggs() {
    const res = await fetch('/api/aggregates');
    const data = await res.json();
    totalEl.textContent = data.total || 0;
    errorsEl.textContent = data.errors || 0;
    p50El.textContent = data.p50 || 0;
    p95El.textContent = data.p95 || 0;
    statusChart.data.labels = (data.byStatus || []).map(x => x.status);
    statusChart.data.datasets[0].data = (data.byStatus || []).map(x => x.count);
    statusChart.update();
    latencyChart.data.datasets[0].data = [data.p50 || 0, data.p95 || 0];
    latencyChart.update();
  }

  async function applyFilters() {
    const q = $('search').value.trim();
    const method = $('method').value;
    const status = $('status').value;
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (method) params.set('method', method);
    if (status) params.set('status', status);
    const res = await fetch('/api/logs?' + params.toString());
    const { data } = await res.json();
    rowsEl.innerHTML = '';
    (data || []).forEach(addRow);
  }

  $('apply').addEventListener('click', applyFilters);
  setInterval(refreshAggs, 3000);
  refreshAggs();

  // socket
  const nsp = document.querySelector('script[src*="socket.io"]').src.includes('/monitor/') ? '' : '/monitor';
  const socket = io(nsp, { path: `${nsp}/socket.io`, auth: { apiKey: getApiKey() } });
  socket.on('logs', (batch) => {
    batch.forEach(addRow);
  });
  socket.on('connect_error', (err) => {
    if (err && /unauthorized/i.test(err.message)) {
      const k = prompt('Enter monitoring API key:');
      if (k != null) {
        setApiKey(k);
        socket.auth = { apiKey: k };
        socket.connect();
      }
    }
  });
})();
