# ⚽ WC2026 Tipping Game

A modern fullstack World Cup 2026 prediction platform built with Next.js, Supabase, and API-Football.

Users can predict every World Cup match, compete with friends in private leagues, follow live standings, and track the tournament through a dynamic knockout bracket system.

Built as a real-world fullstack side project with a strong focus on:
- modern UI/UX
- automation
- production-ready architecture
- responsive design
- smooth user experience

---

## 📸 Screenshot

<img width="1881" height="906" alt="screenshot" src="https://github.com/user-attachments/assets/bbdb78f2-33f8-449b-b401-ba2f795fee92" />


---

# ✨ Features

## 🏆 Match Prediction System
- Predict scores for every World Cup match
- Automatic prediction locking before kickoff
- Exact score & winner-based point system
- Live leaderboard updates
- Real-time tournament progression

---

## 🌍 Live Tournament Data
Powered by API-Football.

- Automatic fixture synchronization
- Live match status updates
- Dynamic standings generation
- Automatic knockout bracket updates
- Scheduled backend sync jobs

---

## 👥 Social & League Features
- Private friend leagues
- Live activity feed
- Global leaderboard
- Competitive ranking system
- Responsive leaderboard cards

---

## 📬 Email Notification System
Powered by Resend.

- Match reminder emails
- Prediction deadline notifications
- Automated scheduled reminders
- Cron-based background automation

---

## 🔐 Authentication & Security
Powered by Supabase Auth.

- Secure Google authentication
- Persistent user sessions
- Protected API routes
- Secure environment variable handling
- Row Level Security (RLS)

---

## 🎨 UI / UX
- Modern glassmorphism-inspired design
- Smooth Framer Motion animations
- Fully responsive layout
- Dark mode optimized
- Mobile-first experience
- Dynamic tournament bracket visualization
- Print-friendly prediction pages

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

## Deployment
- Vercel

---

# ⚙️ Architecture

```text
API-Football
       ↓
Scheduled Cron Jobs
       ↓
Supabase Database
       ↓
Next.js Application
       ↓
Responsive Frontend UI
```

---

# ⏰ Automation

The application uses scheduled Vercel Cron Jobs for:

- syncing fixtures
- updating match statuses
- locking predictions
- sending reminder emails
- updating standings
- generating knockout stages

---

# 🔒 Security

- Environment variables securely managed with Vercel
- No secrets exposed client-side
- Protected cron endpoints
- Supabase Row Level Security enabled
- Backend-side prediction validation
- Secure authentication flow

---

# 📱 Responsive Design

The application is fully optimized for:
- desktop
- tablet
- mobile devices

Special attention was given to:
- mobile prediction UX
- responsive brackets
- leaderboard readability
- smooth animations on smaller screens

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/bazskos/wc2026_tipping_game.git
cd wc2026_tipping_game
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create a `.env.local` file in the project root:

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

## 4. Start the development server

```bash
npm run dev
```

The application will be available at:

```bash
http://localhost:3000
```

---

# 🧠 Technical Highlights

## Fullstack Architecture
The project combines:
- frontend UI/UX development
- backend automation
- database design
- authentication
- API integration
- cron scheduling
- production deployment

into a single cohesive application.

---

## Production-Oriented Development
The application was designed with real-world deployment in mind:

- secure environment handling
- protected backend routes
- automated background jobs
- responsive design system
- scalable database structure
- reusable component architecture

---

## Modern UI/UX Focus
A major focus of the project was creating a polished product feel through:
- motion design
- spacing consistency
- responsive layouts
- typography hierarchy
- glassmorphism styling
- smooth interactions

---

# 📌 Future Improvements

- live match events
- push notifications
- public leagues
- user statistics
- advanced analytics
- admin dashboard
- real-time updates
- prediction history tracking

---

# 📚 What I Learned

This project helped me gain practical experience with:

- fullstack application architecture
- TypeScript-based development
- database security
- authentication systems
- API integrations
- cron automation
- responsive UI/UX design
- production deployment workflows
- scalable React component design

---

# 👨‍💻 Author

Built by Bazskos

GitHub:
https://github.com/bazskos

LinkedIn:
[https://www.linkedin.com/](https://www.linkedin.com/in/bal%C3%A1zs-kiss-576b183b9/)
