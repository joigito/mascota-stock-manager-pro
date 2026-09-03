
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  forcePasswordChange: boolean;
  clearForcePasswordChange: () => void;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);

  const syncUserState = (session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
    setForcePasswordChange(session?.user?.user_metadata?.force_password_change === true);
    setLoading(false);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        syncUserState(session);

        // Handle new user registration from store URL
        if (event === 'SIGNED_IN' && session?.user) {
          const storeSlug = localStorage.getItem('pendingStoreAssociation');
          if (storeSlug) {
            setTimeout(async () => {
              try {
                // Get organization by slug
                const { data: org } = await supabase
                  .from('organizations')
                  .select('id')
                  .eq('slug', storeSlug)
                  .single();

                if (org) {
                  // Check if user is already associated
                  const { data: existing } = await supabase
                    .from('user_organizations')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .eq('organization_id', org.id)
                    .single();

                  if (!existing) {
                    // Associate user with organization as admin
                    await supabase
                      .from('user_organizations')
                      .insert({
                        user_id: session.user.id,
                        organization_id: org.id,
                        role: 'admin'
                      });
                  }
                }
                localStorage.removeItem('pendingStoreAssociation');
              } catch (error) {
                console.error('Error associating user with organization:', error);
              }
            }, 0);
          }
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUserState(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    // Get redirect URL from query params or default to root
    const urlParams = new URLSearchParams(window.location.search);
    const redirectPath = urlParams.get('redirect') || '/';
    const redirectUrl = `${window.location.origin}${redirectPath}`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const clearForcePasswordChange = async () => {
    // Clear the flag so the user isn't forced again after changing the password
    try {
      await supabase.auth.updateUser({
        data: { force_password_change: false },
      });
    } catch (error) {
      console.error("Error clearing force password change:", error);
    }
    setForcePasswordChange(false);
  };

  const value = {
    user,
    session,
    loading,
    forcePasswordChange,
    clearForcePasswordChange,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
