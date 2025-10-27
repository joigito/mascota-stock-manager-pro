const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://yslheyzbhujozyoimihw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzbGhleXpiaHVqb3p5b2ltaWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNjYwMjksImV4cCI6MjA2NTk0MjAyOX0.Pprc_-0XYC0Bh0cLAppkhs3Dbd2O-asXiFVGX6lAUgw';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  try {
    console.log('Fetching one product...');
    const { data: products, error: prodErr } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (prodErr) {
      console.error('Error fetching products:', prodErr);
      return;
    }

    if (!products || products.length === 0) {
      console.log('No products found. Exiting.');
      return;
    }

    const product = products[0];
    console.log('Found product:', product.id, product.name, 'org:', product.organization_id);

    const variant = {
      product_id: product.id,
      organization_id: product.organization_id,
      created_by: product.user_id || 'script-test',
      sku: 'TEST-SKU-01',
      color: 'rojo-oscuro',
      size: 'M',
      stock: 5,
      min_stock: 1,
      price_adjustment: 10,
      is_active: true
    };

    console.log('Inserting variant:', variant);
    const { data, error } = await supabase
      .from('product_variants')
      .insert(variant)
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
    } else {
      console.log('Insert success:', data);

      // Clean up: delete the inserted variant
      console.log('Deleting inserted variant to cleanup...');
      const { error: delErr } = await supabase
        .from('product_variants')
        .delete()
        .eq('id', data.id);

      if (delErr) console.error('Cleanup delete error:', delErr);
      else console.log('Cleanup delete success');
    }
  } catch (e) {
    console.error('Unexpected error:', e);
  }
}

run();
