# Second Brain 🧠

A unified personal knowledge and productivity system built with Next.js, featuring capture, organization, retrieval, task management, habit tracking, and finance tracking.

## ✨ Features

- **📝 Knowledge Repository**: Capture and organize notes with PARA method (Projects, Areas, Resources, Archives)
- **🔍 Vector Search**: Semantic search across all your data using AI embeddings
- **📋 Kanban Tasks**: Visual task management with drag-and-drop
- **✅ Habit Tracker**: Build better habits with streak tracking
- **💰 Finance Tracker**: Monitor income and expenses with visualizations
- **🔗 Bi-directional Linking**: Connect your notes and ideas

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Vector Search**: pgvector
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

## 🛠️ Getting Started

### Prerequisites

- Node.js 20+ (or 21.x with Prisma 5.x)
- PostgreSQL with pgvector extension (or Supabase account)
- OpenAI API key (for embeddings)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd second-brain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials (see `DATABASE_SETUP.md` for details)

4. **Set up the database**
   
   See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.
   
   Quick start with Supabase:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
second-brain/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   └── ui/          # Reusable UI components
│   └── lib/             # Utilities and clients
│       ├── db.ts        # Prisma client
│       ├── supabase.ts  # Supabase client
│       └── utils.ts     # Helper functions
├── prisma/
│   └── schema.prisma    # Database schema
└── public/              # Static assets
```

## 🎨 UI Components

Built-in component library with:
- Button (with variants and loading states)
- Input & Textarea (with labels and errors)
- Card (with glassmorphism effect)
- Badge (color variants)
- Modal (with animations)

All components feature:
- ✨ Smooth Framer Motion animations
- 🌙 Dark theme optimized
- ♿ Accessible (ARIA labels, keyboard navigation)
- 📱 Mobile responsive

## 🗄️ Database Schema

- **Users**: User accounts
- **Notes**: Knowledge base with vector embeddings for semantic search
- **Tasks**: Kanban-style tasks (Backlog → Doing → Done)
- **Habits**: Habit definitions
- **HabitLogs**: Daily habit completions
- **Transactions**: Income and expense tracking

## 📝 Development Status

**Completed:**
- ✅ Next.js setup with TypeScript
- ✅ Tailwind CSS configuration
- ✅ UI component library
- ✅ Database schema with Prisma
- ✅ Supabase integration

**In Progress:**
- 🚧 API routes
- 🚧 Quick Capture module
- 🚧 Notes/Knowledge Repository
- 🚧 Kanban Task Board
- 🚧 Habit Tracker
- 🚧 Finance Tracker

## 🤝 Contributing

This is currently an MVP in development. Contributions welcome!

## 📄 License

MIT

---

Built with ❤️ using Next.js and modern web technologies
