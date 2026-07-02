@echo off
echo === Juno Tax SaaS — Quick Start ===
echo.
echo Step 1: Set Node.js version
call nvm use 22.22.2
echo.
echo Step 2: Install dependencies
call npm install
echo.
echo Step 3: Copy environment file
if not exist .env (
  copy .env.example .env
  echo Created .env from .env.example — edit with your settings
)
echo.
echo Step 4: Start database
echo   docker compose up -d db
echo.
echo Step 5: Run migrations
echo   npm run db:migrate
echo.
echo Step 6: Start dev server
echo   npm run dev
echo.
pause
