#!/data/data/com.termux/files/usr/bin/bash
cd /data/data/com.termux/files/home/ai-lab-internal/n8n-workspace
nohup n8n start > n8n-output.log 2>&1 &
echo "n8n starting... check http://localhost:5678"
echo "Log: ~/ai-lab-internal/n8n-workspace/n8n-output.log"
echo "PID: $!"
