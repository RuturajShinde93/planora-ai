# 🌍 Planora AI — Smart Vacation & Trip Planner

Planora AI is an intelligent travel planning web application built with **React (Vite)**, **Google Gemini 3.6 Flash**, and **Supabase**. It generates personalized day-by-day itineraries, estimated travel budgets, and hotel recommendations based on destination, duration, budget tier, and group type.

---

## ✨ Features

* 🤖 **AI-Driven Itinerary Generation**: Day-wise activity schedules powered by Google Gemini 3.6.
* 🏨 **Curated Stays & Budgets**: Context-aware hotel recommendations and budget estimates.
* 🔐 **Supabase Authentication**: Secure user registration, login, and session persistence.
* 🗄️ **Persistent Trip Blueprints**: Row-Level Security (RLS) protected database storage per user account.
* 🎨 **Modern Travel UI**: Clean, responsive layout with intuitive filter cards and instant feedback.

---

## 🛠️ Tech Stack

* **Frontend**: React, Vite, Tailwind CSS / Lucide React
* **AI Model**: Google Gemini 3.6 Flash (`@google/generative-ai`)
* **Database & Auth**: Supabase (PostgreSQL + Auth)
* **Deployment**: Vercel

---

## 🚀 Getting Started Locally

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/RuturajShinde93/planora-ai.git
cd planora-ai
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Setup Environment Variables
Create a \`.env\` file in the root directory and add your credentials:

\`\`\`env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 4. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

---

## 🔒 Security & Best Practices

* Sensitive keys (`.env`) are strictly excluded from version control via `.gitignore`.
* Database queries utilize Supabase Row Level Security (RLS) policies to ensure private user isolation.
