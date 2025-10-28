# Rotating Supabase API Keys (anon/public)

If a publishable (anon) key was exposed, rotate it immediately.

Steps:
1. Open Supabase dashboard for the project.
2. Go to Settings → API.
3. Under Project API keys, click "Regenerate" for the anon/public key.
4. Update your application environment with the new ANON key (in the client config or env file).
   - Do NOT paste the key in public chats.
5. Restart any deployed frontend or server processes that cache env variables.
6. Test the app flows (login, product list, variant flows) to ensure the new key works.

Notes:
- Rotating the anon key is safe and recommended if the key was shared.
- If someone had the anon key, it's low-privileged but should still be rotated.
- Consider rotating the service_role key only when necessary (this is highly sensitive).
