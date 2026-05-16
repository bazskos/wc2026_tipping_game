# ⚽ WC2026 Tipping Game

A modern fullstack World Cup 2026 prediction platform built with Next.js, Supabase, and API-Football.

Users can create predictions for every World Cup match, compete with friends in private leagues, follow live standings, and track tournament progress through a dynamic knockout bracket system.

---

## ✨ Features

### 🏆 Match Prediction System
- Predict scores for every World Cup match
- Automatic prediction locking before kickoff
- Exact score & winner-based point system
- Live leaderboard updates

### 🌍 Real Tournament Data
- Live fixtures and match data powered by API-Football
- Automatic synchronization using scheduled cron jobs
- Dynamic standings and knockout stage generation

### 👥 League & Social Features
- Compete with friends in private leagues
- Live activity feed
- Global and league-specific rankings
- Responsive leaderboard system

### 📬 Email Notifications
- Match reminder emails using Resend
- Prediction deadline notifications
- Automated scheduled reminders

### 🔐 Authentication
- Secure Google authentication with Supabase Auth
- Persistent user sessions
- Protected routes and API endpoints

### 📱 Modern UI/UX
- Fully responsive design
- Glassmorphism-inspired interface
- Smooth Framer Motion animations
- Mobile-first experience
- Dark mode optimized

### 🖨️ Print Support
- Printable prediction sheets
- Tournament overview print mode

---

# 🛠️ Tech Stack

## Frontend
- Next.js 15
- React
- TypeScript
- Tailwind CSS
- Framer Motion
- shadcn/ui

## Backend & Database
- Supabase
- PostgreSQL
- Supabase Auth
- Row Level Security (RLS)

## APIs & Services
- API-Football
- Resend
- Vercel Cron Jobs

---

# ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

API_FOOTBALL_KEY=

RESEND_API_KEY=

CRON_SECRET=

NEXT_PUBLIC_APP_URL=
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/bazskos/wc2026_tipping_game.git
cd wc2026_tipping_game
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

Create a `.env.local` file using the example above.

## 4. Start the development server

```bash
npm run dev
```

The app will be available at:

```bash
http://localhost:3000
```

---

# ⏰ Cron Jobs

The project uses Vercel Cron Jobs for:

- Syncing match data
- Updating fixtures
- Locking predictions
- Sending reminder emails
- Updating standings and brackets

---

# 🔒 Security

- Environment variables are stored securely using Vercel Environment Variables
- Supabase Row Level Security enabled
- Protected cron routes using secret validation
- Sensitive keys never exposed client-side

---

# 📸 Screenshot


<img width="1699" height="825" alt="Screenshot" src="https://github.com/user-attachments/assets/77d74692-2d03-4bda-b0a2-5e59fb413175" />

---

# 🧠 Future Improvements

- Live match events
- Push notifications
- Public leagues
- User avatars & profiles
- Prediction statistics
- Advanced analytics
- Admin dashboard
- Real-time updates

---

# 📚 What I Learned

This project helped me gain hands-on experience with:

- Fullstack application architecture
- Authentication & database security
- API integration
- Cron automation
- Responsive UI/UX design
- Production-ready deployment workflows
- Type-safe development with TypeScript

---

# 🌐 Deployment

The application is deployed on Vercel.

---

# 👨‍💻 Author

Built by Bazskos

GitHub:
https://github.com/bazskos
