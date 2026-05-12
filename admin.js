// admin.js - Dashboard temps réel avec Supabase
const SUPABASE_URL = 'https://supabase.com/dashboard/project/rmugngceojbarttctsoo';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtdWduZ2Nlb2piYXJ0dGN0c29vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MDE5NjIsImV4cCI6MjA5NDE3Nzk2Mn0.DAKlMEZ8B2QaWTzr1Y9Y_SeUWLdZIIa-CgfCh4RN3pc'; // Clé publique

const { createClient } = supabase;
const supa = createClient(SUPABASE_URL, SUPABASE_KEY);

// Charger toutes les données
async function loadData() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  
  // 1. Visiteurs aujourd'hui
  const { count: todayCount } = await supa
    .from('visitors')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', todayStart);
  
  document.getElementById('todayVisitors').textContent = todayCount || 0;
  
  // 2. En ligne (5 dernières minutes)
  const fiveMinAgo = new Date(now - 5 * 60 * 1000).toISOString();
  const { count: onlineCount } = await supa
    .from('visitor_real')
    .select('*', { count: 'exact', head: true })
    .gte('timestamp', fiveMinAgo);
  
  document.getElementById('onlineNow').textContent = onlineCount || 0;
  document.getElementById('liveCount').textContent = `${onlineCount || 0} actifs`;
  
  // 3. Pages vues
  const { count: pageViewsCount } = await supa
    .from('visitor_real')
    .select('*', { count: 'exact', head: true });
  
  document.getElementById('pageViews').textContent = pageViewsCount || 0;
  
  // 4. Temps moyen
  const { data: timeData } = await supa
    .from('visitor_real')
    .select('timeOnPage')
    .not('timeOnPage', 'is', null);
  
  if (timeData && timeData.length > 0) {
    const avgTime = timeData.reduce((sum, v) => sum + (v.timeOnPage || 0), 0) / timeData.length;
    document.getElementById('avgTime').textContent = `${Math.round(avgTime)}s`;
  }
  
  // 5. Visiteurs en direct
  const { data: liveData } = await supa
    .from('visitor_real')
    .select('*')
    .gte('timestamp', fiveMinAgo)
    .order('timestamp', { ascending: false })
    .limit(20);
  
  const tbody = document.getElementById('liveVisitors');
  tbody.innerHTML = liveData?.map(v => `
    <tr>
      <td>${v.page || '/'}</td>
      <td>${v.referrer || 'Direct'}</td>
      <td>${new Date(v.timestamp).toLocaleTimeString('fr-FR')}</td>
      <td>${v.timeOnPage ? v.timeOnPage + 's' : 'En cours'}</td>
      <td>${v.userAgent?.includes('Mobile') ? '📱' : '💻'}</td>
    </tr>
  `).join('') || '<tr><td colspan="5">Aucun visiteur actif</td></tr>';
  
  // 6. Graphique 24h
  load24hChart();
  
  // 7. Top pages
  loadTopPages();
}

// Graphique des dernières 24h
async function load24hChart() {
  const { data } = await supa
    .from('visitors')
    .select('timestamp')
    .gte('timestamp', new Date(Date.now() - 24*60*60*1000).toISOString());
  
  const hours = {};
  for (let i = 0; i < 24; i++) hours[i] = 0;
  
  data?.forEach(v => {
    const hour = new Date(v.timestamp).getHours();
    hours[hour]++;
  });
  
  const maxVal = Math.max(...Object.values(hours), 1);
  const chart = document.getElementById('chart24h');
  
  chart.innerHTML = Object.entries(hours).map(([hour, count]) => `
    <div style="display:flex; flex-direction:column; align-items:center; flex:1;">
      <div style="width:100%; background: ${count > 0 ? '#e94560' : '#333'}; height: ${(count/maxVal)*200}px; border-radius: 4px 4px 0 0; position:relative; cursor:pointer;" title="${count} visites à ${hour}h">
        ${count > 0 ? `<span style="position:absolute; top:-18px; left:50%; transform:translateX(-50%); font-size:10px;">${count}</span>` : ''}
      </div>
      <span style="font-size:10px; margin-top:4px; color:#888;">${hour}h</span>
    </div>
  `).join('');
}

// Top pages
async function loadTopPages() {
  const { data } = await supa
    .from('visitors')
    .select('page');
  
  const pages = {};
  data?.forEach(v => {
    const page = v.page || '/';
    pages[page] = (pages[page] || 0) + 1;
  });
  
  const sorted = Object.entries(pages).sort((a,b) => b[1] - a[1]).slice(0, 10);
  const maxVal = sorted[0]?.[1] || 1;
  
  document.getElementById('topPages').innerHTML = sorted.map(([page, count]) => `
    <div style="margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px;">
        <span>${page}</span>
        <span style="color:#888;">${count}</span>
      </div>
      <div style="background:#333; border-radius:4px; height:6px;">
        <div style="width:${(count/maxVal)*100}%; background:#e94560; height:6px; border-radius:4px;"></div>
      </div>
    </div>
  `).join('');
}

// Rechargement automatique
setInterval(loadData, 5000);
loadData();
