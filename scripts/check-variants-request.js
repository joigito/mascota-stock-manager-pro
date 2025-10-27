const fetch = globalThis.fetch || require('node-fetch');

const SUPABASE_URL = 'https://yslheyzbhujozyoimihw.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGhleXpiaHVqb3p5b2ltaWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjYwMjksImV4cCI6MjA2NTk0MjAyOX0.Pprc_-0XYC0Bh0cLAppkhs3Dbd2O-asXiFVGX6lAUgw';

async function run(productId, organizationId) {
  const url = `${SUPABASE_URL}/rest/v1/product_variants?select=*&product_id=eq.${productId}&organization_id=eq.${organizationId}&order=color.asc,size.asc`;
  console.log('Request URL:', url);

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${ANON_KEY}`,
    },
  });

  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Body:', text);
}

// Use examples from your logs
const examples = [
  { p: 'e6447b28-bd78-42e2-ab14-05b82ca24890', o: '5c728a76-6c0b-4727-8949-2e99d86a37df' },
  { p: '2204d388-1f60-456a-acc0-b03efdd0b3d3', o: '5c728a76-6c0b-4727-8949-2e99d86a37df' },
  { p: 'c75b5023-99d8-4cc1-ac84-fa59f773c54b', o: '5c728a76-6c0b-4727-8949-2e99d86a37df' }
];

(async () => {
  for (const ex of examples) {
    console.log('\n---\n');
    await run(ex.p, ex.o);
  }
})();
