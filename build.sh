#!/bin/bash
# gas-open-project/SavingsApp.html（正本）をGitHub Pages用のindex.htmlへ変換する。
# ・ホーム画面アイコンを追加
# ・CSP（読み込める外部先を限定）を、インラインスクリプトのハッシュ付きで追加
set -euo pipefail
cd "$(dirname "$0")"
python3 - <<'PY'
import base64, hashlib, re
src = open('../gas-open-project/SavingsApp.html', encoding='utf-8').read()
scripts = re.findall(r'<script>([\s\S]*?)</script>', src)
assert len(scripts) == 1, 'インラインスクリプトは1つだけの想定です'
digest = base64.b64encode(hashlib.sha256(scripts[0].encode('utf-8')).digest()).decode()
csp = '; '.join([
    "default-src 'none'",
    f"script-src 'self' 'sha256-{digest}'",
    "style-src 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src https://script.google.com https://script.googleusercontent.com",
    "frame-src https://docs.google.com",
    "worker-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
])
head = '\n'.join([
    '<meta name="apple-mobile-web-app-title" content="旅貯金">',
    f'  <meta http-equiv="Content-Security-Policy" content="{csp}">',
    '  <link rel="apple-touch-icon" href="icon.png?v=2">',
    '  <link rel="icon" href="icon.png?v=2">',
    '  <title>旅貯金</title>',
    '  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
])
marker = '<meta name="apple-mobile-web-app-title" content="旅貯金">'
assert src.count(marker) == 1
open('index.html', 'w', encoding='utf-8').write(src.replace(marker, head))
PY
echo "index.html を更新しました"
