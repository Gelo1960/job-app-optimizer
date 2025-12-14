# Environment Variables for Production

## Required Variables

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### AI Providers (Optional - users can add via Settings UI)
```
GEMINI_API_KEY=AIza...  (optional fallback)
DEEPSEEK_API_KEY=sk-... (optional fallback)
ANTHROPIC_API_KEY=sk-ant-... (optional fallback)
```

## Deployment to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Important Notes:
- Users can store their own API keys via the Settings page
- Environment variables serve as fallback if user hasn't configured keys
- OAuth callback URLs must be configured in Supabase:
  - Development: `http://localhost:3000/auth/callback`
  - Production: `https://your-domain.vercel.app/auth/callback`
