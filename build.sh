#!/bin/bash
# gas-open-project/SavingsApp.html（正本）をGitHub Pages用のindex.htmlへコピーする。
set -euo pipefail
cd "$(dirname "$0")"
cp ../gas-open-project/SavingsApp.html index.html
# ホーム画面アイコンを追加
sed -i '' 's#<meta name="apple-mobile-web-app-title" content="旅貯金">#<meta name="apple-mobile-web-app-title" content="旅貯金">\n  <link rel="apple-touch-icon" href="icon.png">\n  <link rel="icon" href="icon.png">\n  <title>旅貯金</title>\n  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">#' index.html
echo "index.html を更新しました"
