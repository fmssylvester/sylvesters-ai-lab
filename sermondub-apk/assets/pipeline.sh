#!/system/bin/sh
# SermonDUB Pipeline v8 - mock mode for UI testing
INPUT="$1"
LANG="${2:-en}"
OUTPUT="$3"
WORK="$4"

FILES_DIR=$(dirname "$WORK")
LIBS="$FILES_DIR/libs"

mkdir -p "$OUTPUT" "$FILES_DIR/models" "$WORK/tmp"

echo "DEBUG:INPUT=$INPUT"
echo "DEBUG:OUTPUT=$OUTPUT"

# Validate input
if [ ! -f "$INPUT" ]; then
  echo "ERROR:Input not found: $INPUT"
  exit 1
fi

# Get input file info
INPUT_SIZE=$(wc -c < "$INPUT" 2>/dev/null || echo "0")
echo "DEBUG:Input size: $INPUT_SIZE bytes"

# Check if whisper binary exists and is executable
WHISPER="$LIBS/whisper-cli"
if [ -f "$WHISPER" ]; then
  chmod +x "$WHISPER" 2>/dev/null
  export LD_LIBRARY_PATH="$LIBS:${LD_LIBRARY_PATH:-}"
  
  # Try running whisper
  echo "STATUS:Testing whisper..."
  "$WHISPER" --version 2>&1
  WHISPER_OK=$?
  echo "DEBUG:whisper test exit=$WHISPER_OK"
  
  if [ $WHISPER_OK -eq 0 ]; then
    # Whisper works - use it
    echo "STATUS:Running transcription (language: $LANG)..."
    
    MODEL="$FILES_DIR/models/ggml-tiny.bin"
    if [ ! -f "$MODEL" ]; then
      echo "ERROR:Model not found at $MODEL"
      exit 1
    fi
    
    "$WHISPER" -m "$MODEL" -f "$INPUT" \
      --output-format json \
      --output-dir "$WORK/tmp" \
      --language "$LANG" \
      -t 2 2>&1
    
    EXIT=$?
    echo "DEBUG:whisper exit=$EXIT"
    
    if [ $EXIT -eq 0 ]; then
      # Find and parse JSON output
      for f in "$WORK/tmp"/*.json; do
        if [ -f "$f" ]; then
          echo "STATUS:Parsing results..."
          awk '
          /"start"/ { gsub(/.*"start": */, ""); gsub(/,.*/, ""); gsub(/ /, ""); s=$0+0 }
          /"end"/ { gsub(/.*"end": */, ""); gsub(/,.*/, ""); gsub(/ /, ""); e=$0+0 }
          /"text"/ {
            gsub(/.*"text": *"/, ""); gsub(/".*/, ""); gsub(/:/, "-"); t=$0
            d = e - s
            if (d >= 5) { n++; if (n<=5) printf "CLIP:%d:%.1f:%.1f:%s\n", n, s, e, t }
          }
          END { if(n==0){print "CLIP:1:0.0:10.0:Detected speech";n=1} if(n>5)n=5; printf "DONE:%d\n",n }
          ' "$f"
          exit 0
        fi
      done
    fi
  fi
fi

# Whisper not available or failed - use mock mode
echo "STATUS:Whisper unavailable, using preview mode..."
echo "DEBUG:Generating preview clips..."

# Analyze input file size to create reasonable mock clips
if [ "$INPUT_SIZE" -gt 30000000 ]; then
  # Large file (>30MB) - assume long sermon
  echo "CLIP:1:30.0:75.0:Opening prayer and welcome"
  echo "CLIP:2:180.0:240.0:Key scripture reading"
  echo "CLIP:3:420.0:480.0:Main teaching point"
  echo "CLIP:4:600.0:660.0:Congregation response"
  echo "CLIP:5:780.0:840.0:Closing prayer and blessing"
  echo "DONE:5"
elif [ "$INPUT_SIZE" -gt 5000000 ]; then
  # Medium file (>5MB)
  echo "CLIP:1:10.0:40.0:Introduction and greeting"
  echo "CLIP:2:90.0:150.0:Main message highlight"
  echo "CLIP:3:200.0:260.0:Closing thoughts"
  echo "DONE:3"
else
  # Short file
  echo "CLIP:1:0.0:15.0:Opening"
  echo "CLIP:2:20.0:45.0:Key moment"
  echo "DONE:2"
fi
