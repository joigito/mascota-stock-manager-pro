const fs = require('fs');
const path = require('path');
const fetch = globalThis.fetch || require('node-fetch');

(async ()=>{
  try {
    const clientPath = path.resolve(__dirname, '..', 'src', 'integrations', 'supabase', 'client.ts');
    const content = fs.readFileSync(clientPath, 'utf8');
    const m = content.match(/const\s+SUPABASE_PUBLISHABLE_KEY\s*=\s*"([^"]+)"/);
    if(!m){
      console.error('Could not find key in client.ts');
      process.exit(2);
    }
    const key = m[1];
    const url = 'https://yslheyzbhujozyoimihw.supabase.co/rest/v1/product_variants?select=*&product_id=eq.e6447b28-bd78-42e2-ab14-05b82ca24890&organization_id=eq.5c728a76-6c0b-4727-8949-2e99d86a37df&order=color.asc,size.asc';

    const res = await fetch(url, { method: 'GET', headers: { apikey: key, Authorization: `Bearer ${key}` } });
    const status = res.status;
    const text = await res.text();
    console.log('Status:', status);
    console.log('Body:', text);
  } catch(err){
    console.error('Request failed:', err && err.message ? err.message : err);
    process.exit(1);
  }
})();
