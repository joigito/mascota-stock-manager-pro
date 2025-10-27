const fetch = globalThis.fetch || require('node-fetch');

const url = 'https://yslheyzbhujozyoimihw.supabase.co/rest/v1/product_variants?select=*&product_id=eq.e6447b28-bd78-42e2-ab14-05b82ca24890&organization_id=eq.5c728a76-6c0b-4727-8949-2e99d86a37df&order=color.asc%2Csize.asc';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGhleXpiaHVqb3p5b2ltaWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjYwMjksImV4cCI6MjA2NTk0MjAyOX0.Pprc_-0XYC0Bh0cLAppkhs3Dbd2O-asXiFVGX6lAUgw';

(async () => {
  try {
    console.log('GET', url);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });
    console.log('Status:', res.status, res.statusText);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const json = await res.json();
      console.log('JSON body:', JSON.stringify(json, null, 2));
    } else {
      const text = await res.text();
      console.log('Body text:', text);
    }
  } catch (e) {
    console.error('Request failed:', e);
  }
})();
