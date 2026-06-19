const url = 'https://yaeoyqcculiovxwehztn.supabase.co/rest/v1/members?select=*';
const key = 'sb_publishable_CGc4NGNg4aVIqG6aFGwPYA_riYQtw7Q';

fetch(url, {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`
  }
}).then(res => res.json()).then(data => {
  console.log('Members in Supabase:', data.length);
}).catch(console.error);
