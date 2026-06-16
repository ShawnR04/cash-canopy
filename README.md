# 🌳 Cash Canopy

Cash Canopy is a modern, full-stack personal finance dashboard built with Next.js. It helps users seamlessly track their income, monitor expenses, manage budgets, and stay on top of their financial goals—all within a beautifully designed, responsive interface.

## ✨ Features

- **📊 Financial Dashboard**: Visualize your financial health with interactive charts and graphs (powered by Recharts).
- **💰 Income & Expense Tracking**: Easily log, categorize, and review your daily transactions.
- **🎯 Goal Tracking**: Set financial goals and visually track your progress towards them.
- **📑 PDF Reports**: Generate and download detailed, stylized PDF ledgers and statements (powered by jsPDF).
- **📱 PWA Ready**: Install Cash Canopy on your desktop or mobile device for a native app-like experience.
- **🎨 Theming**: Fully supports light and dark modes with a sleek UI (built with Tailwind CSS & Shadcn UI).
- **✉️ Email Notifications**: Integrated with Resend for transactional email delivery.

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: SQLite / Turso with Drizzle ORM
- **Styling**: Tailwind CSS & Shadcn UI
- **Data Visualization**: Recharts
- **Authentication**: Custom Auth with `bcrypt-ts`
- **State Management**: `nuqs` (URL query state)
- **Analytics**: Vercel Web Analytics

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+) installed.

### 1. Clone & Install
Clone the repository and install the dependencies:

```bash
npm install
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```bash
npm i drizzle-orm
npm i -D drizzle-kit
npm i dotenv
npm i @libsql/client
```

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

Shadcn

```bash
npx shadcn@latest init
npx shadcn@latest add button label pagination input popover sonner progress table dropdown-menu alert-dialog
```

React Icons

Open [React Icons](https://react-icons.github.io/react-icons/icons/fa6/) for more icon choices

```bash
npm i react-icons
```

Recharts

```bash
npm install recharts
```

Themes

```bash
npm install next-themes
```

Email Sending
```bash
npm install resend
```

PDF Creation
```bash
npm i jspdf
npm i jspdf-autotable
```

Bcrypt
```bash
npm install bcrypt-ts
```

```bash
npm install nuqs
```

```bash
npm install @ducanh2912/next-pwa
```

Vercel Web Analytics
```bash
npm i @vercel/analytics
```