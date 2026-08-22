# ScholarPath — PhD Application & Outreach Command Center

A modern, cloud-native web application for managing PhD applications, professor outreach, scholarship deadlines, document drafts, and communications.

## Tech Stack
- **Framework**: Next.js 16 (App Router + Turbopack)
- **UI & Styling**: React 19, Tailwind CSS v4, Radix UI, Lucide Icons
- **Database & Auth**: Supabase (PostgreSQL + Row Level Security)
- **Rich Text Editor**: TipTap
- **Deployment**: Vercel / Netlify / Docker

---

## 🛠️ Setup & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` (or edit `.env`):
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ENCRYPTION_KEY=your-64-char-hex-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/email/callback
```

### 3. Setup Database
Run the SQL migration script from `supabase/schema.sql` in your Supabase SQL Editor.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚀 Cloud Deployment (Vercel)

1. Push this repository to GitHub / GitLab.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Add the environment variables from `.env` into the Vercel Project Settings.
4. Set `GOOGLE_REDIRECT_URI` to `https://your-domain.vercel.app/api/v1/email/callback`.
5. Deploy!
