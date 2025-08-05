import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Client for checking permissions (using user's token)
    const supabaseClient = createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    })

    // Admin client for creating users
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Verify the user making the request
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is super admin
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'super_admin')
      .single()

    if (rolesError || !userRoles) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Solo los super administradores pueden crear usuarios' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Get request body
    const { email, password, role, organizationId } = await req.json()

    if (!email || !password) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Email y contraseña son requeridos' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Create the user using admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (createError) {
      console.error('Error creating user:', createError)
      let errorMessage = 'Error al crear el usuario'
      
      if (createError.message?.includes('email_exists') || createError.message?.includes('already been registered')) {
        errorMessage = `Ya existe un usuario con el email: ${email}`
      } else if (createError.message) {
        errorMessage = createError.message
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    console.log('User created:', newUser.user.id)

    // Assign global role if specified
    if (role && role !== 'user') {
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role: role
        })

      if (roleError) {
        console.error('Error assigning role:', roleError)
      }
    }

    // Add to organization if specified
    if (organizationId && organizationId !== 'none') {
      const { error: orgError } = await supabaseClient
        .from('user_organizations')
        .insert({
          user_id: newUser.user.id,
          organization_id: organizationId,
          role: 'user'
        })

      if (orgError) {
        console.error('Error adding to organization:', orgError)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser.user.id,
          email: newUser.user.email
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred while creating the user' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})