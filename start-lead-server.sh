#!/data/data/com.termux/files/usr/bin/bash
# Start the lead capture server for CS Agent landing page
echo "Starting lead capture server on port 8765..."
nohup python3 /data/data/com.termux/files/home/ai-lab-internal/products/lead-server.py > /data/data/com.termux/files/home/ai-lab-internal/lead-server.log 2>&1 &
echo "PID: $!"
echo "Leads saved to: products/leads.json"
echo "Stop with: kill $(pgrep -f lead-server.py)"
