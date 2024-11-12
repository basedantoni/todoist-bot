#!/bin/bash
cd /var/www/yourrepository
git pull origin main
pnpm install
pnpm build
pm2 restart server
