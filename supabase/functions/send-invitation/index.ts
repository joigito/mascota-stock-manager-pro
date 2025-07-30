import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  invitation_id: string;
  email: string;
  organization_name: string;
  role: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { invitation_id, email, organization_name, role }: InvitationRequest = await req.json();

    console.log('Processing invitation:', { invitation_id, email, organization_name, role });

    // Get the invitation token
    const { data: invitation, error: inviteError } = await supabaseClient
      .from('organization_invitations')
      .select('token')
      .eq('id', invitation_id)
      .single();

    if (inviteError) {
      throw new Error(`Failed to get invitation: ${inviteError.message}`);
    }

    // Create the invitation URL
    const baseUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173';
    const invitationUrl = `${baseUrl}/accept-invitation?token=${invitation.token}`;

    console.log('Invitation URL:', invitationUrl);

    // For now, we'll just return success and log the invitation details
    // In a real implementation, you would integrate with an email service like Resend
    console.log(`
    ==========================================
    INVITATION EMAIL WOULD BE SENT TO: ${email}
    ==========================================
    Subject: Invitación a ${organization_name}
    
    Hola,
    
    Has sido invitado a unirte a ${organization_name} como ${role === 'admin' ? 'Administrador' : 'Usuario'}.
    
    Para aceptar la invitación, haz clic en el siguiente enlace:
    ${invitationUrl}
    
    Esta invitación expirará en 7 días.
    
    Saludos,
    Equipo de ${organization_name}
    ==========================================
    `);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Invitation processed successfully',
        invitation_url: invitationUrl 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in send-invitation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);