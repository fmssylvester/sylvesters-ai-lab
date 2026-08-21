#!/data/data/com.termux/files/usr/bin/bash
kill $(lsof -ti:5678) 2>/dev/null
echo "n8n stopped (port 5678 freed)"
