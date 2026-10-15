# Office Attendance

Track office in/out times, daily hours, days attended and the monthly average (÷ 8). React + TypeScript + Vite. Data is stored in your browser's localStorage (single device).

## Run locally

```bash
npm install
npm run dev
```

## Deploy (GitHub → Vercel)

```bash
git init && git add . && git commit -m "Office attendance tracker"
git branch -M main
git remote add origin https://github.com/<you>/office-attendance.git
git push -u origin main
```

Then on vercel.com: **Add New → Project → import the repo → Deploy**. Vercel detects Vite automatically (build: `npm run build`, output: `dist`).

## Features

- Multiple in/out sessions per day (clock in again after a break, or add sessions by hand)
- Monthly target of office days (default 8) with hours still needed
- Backup to a JSON file and restore from it
- Light and dark mode
- CSV export for the month

Data saved by the first version (one in/out per day) is converted automatically on first load.

## How the numbers work

- **Days attended**: days with an entry this month.
- **Total hours**: sum of all sessions across the month; an open session today counts live.
- **Avg hours / day**: total ÷ days that have a clock-out (or today's live entry).
- **Average ÷ 8**: avg hours per day ÷ 8, shown as a ratio and percentage.
- **Monthly target**: target days × 8h. "Hours needed" is that minus your total so far.
