// tracker.js - À inclure dans ton index.html
(async function() {
  const SUPABASE_URL = 'https://TON_PROJET.supabase.co';
  const SUPABASE_KEY = 'TA_CLE_ANON';
  
  // Collecter données visiteur
  const visitorData = {
    page: window.location.pathname,
    referrer: document.referrer || 'direct',
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timeOnPage: 0,
    ip: 'tracking' // L'IP sera ajoutée côté serveur
  };
  
  // Envoyer à Supabase
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/visitors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(visitorData)
    });
    
    // Récupérer l'ID pour tracker le temps passé
    const data = await response.json();
    const visitorId = data[0]?.id;
    
    // Mettre à jour le temps passé avant de quitter
    window.addEventListener('beforeunload', () => {
      const timeSpent = Math.round((Date.now() - performance.timing.navigationStart) / 1000);
      fetch(`${SUPABASE_URL}/rest/v1/visitors?id=eq.${visitorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`
        },
        body: JSON.stringify({ timeOnPage: timeSpent })
      });
    });
  } catch (error) {
    console.log('Tracking error:', error);
  }
})();
