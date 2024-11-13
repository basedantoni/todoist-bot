#!/bin/bash
cd ~/todoist-bot
git pull origin main
pnpm install
pnpm build
pm2 restart server
