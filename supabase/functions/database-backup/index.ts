import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { action, backupData } = await req.json()

    if (action === 'create-backup') {
      console.log('Creating database backup...')
      
      const backupTimestamp = new Date().toISOString()
      const backup: any = {
        timestamp: backupTimestamp,
        version: '1.0',
        data: {}
      }

      // Backup all main tables
      const tables = [
        'organizations',
        'user_organizations', 
        'products',
        'product_variants',
        'product_batches',
        'custom_categories',
        'customers',
        'sales',
        'sale_items',
        'invoices',
        'invoice_tax_details',
        'system_configurations',
        'afip_configurations',
        'price_history'
      ]

      for (const table of tables) {
        try {
          const { data, error } = await supabase
            .from(table)
            .select('*')

          if (error) {
            console.error(`Error backing up table ${table}:`, error)
            throw error
          }

          backup.data[table] = data || []
          console.log(`Backed up ${data?.length || 0} records from ${table}`)
        } catch (error) {
          console.error(`Failed to backup table ${table}:`, error)
          backup.data[table] = []
        }
      }

      // Generate backup file name
      const backupFileName = `backup_${backupTimestamp.replace(/[:.]/g, '_')}.json`
      
      console.log('Backup created successfully:', {
        timestamp: backupTimestamp,
        tables: Object.keys(backup.data).length,
        totalRecords: Object.values(backup.data).reduce((sum: number, records: any) => sum + records.length, 0)
      })

      return new Response(
        JSON.stringify({
          success: true,
          backup,
          fileName: backupFileName,
          summary: {
            timestamp: backupTimestamp,
            tables: Object.keys(backup.data).length,
            totalRecords: Object.values(backup.data).reduce((sum: number, records: any) => sum + records.length, 0),
            tableStats: Object.entries(backup.data).map(([table, records]: [string, any]) => ({
              table,
              count: records.length
            }))
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    if (action === 'restore-backup') {
      console.log('Restoring database from backup...')
      
      if (!backupData || !backupData.data) {
        throw new Error('Invalid backup data provided')
      }

      const restoreResults: any = {}
      const errors: any[] = []

      // Restore tables in dependency order
      const orderedTables = [
        'organizations',
        'custom_categories',
        'user_organizations',
        'products',
        'product_variants', 
        'product_batches',
        'customers',
        'sales',
        'sale_items',
        'invoices',
        'invoice_tax_details',
        'system_configurations',
        'afip_configurations',
        'price_history'
      ]

      for (const table of orderedTables) {
        if (backupData.data[table] && Array.isArray(backupData.data[table])) {
          try {
            const records = backupData.data[table]
            
            if (records.length > 0) {
              // Delete existing records first (be careful!)
              const { error: deleteError } = await supabase
                .from(table)
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

              if (deleteError) {
                console.warn(`Warning deleting from ${table}:`, deleteError)
              }

              // Insert backup records
              const { data, error } = await supabase
                .from(table)
                .insert(records)

              if (error) {
                console.error(`Error restoring table ${table}:`, error)
                const errorMessage = error.message || 'Unknown error'
                errors.push({ table, error: errorMessage })
                restoreResults[table] = { success: false, error: errorMessage }
              } else {
                console.log(`Restored ${records.length} records to ${table}`)
                restoreResults[table] = { success: true, recordsRestored: records.length }
              }
            } else {
              restoreResults[table] = { success: true, recordsRestored: 0 }
            }
          } catch (error) {
            console.error(`Failed to restore table ${table}:`, error)
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            errors.push({ table, error: errorMessage })
            restoreResults[table] = { success: false, error: errorMessage }
          }
        } else {
          restoreResults[table] = { success: true, recordsRestored: 0, note: 'No data in backup' }
        }
      }

      const totalRestored = Object.values(restoreResults)
        .filter((result: any) => result.success)
        .reduce((sum: number, result: any) => sum + (result.recordsRestored || 0), 0)

      console.log('Restore completed:', {
        totalRestored,
        errors: errors.length,
        results: restoreResults
      })

      return new Response(
        JSON.stringify({
          success: errors.length === 0,
          restoreResults,
          summary: {
            totalRestored,
            errorsCount: errors.length,
            errors: errors.slice(0, 5), // Show first 5 errors
            tablesProcessed: Object.keys(restoreResults).length
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action specified' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )

  } catch (error) {
    console.error('Database backup/restore error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})