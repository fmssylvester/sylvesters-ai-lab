#!/bin/bash
set -e

SDK="/data/data/com.termux/files/home/android-sdk"
ANDROID_JAR="$SDK/platforms/android-34/android.jar"
AAPT2="$SDK/build-tools/35.0.0/aapt2"
BUILD="/data/data/com.termux/files/home/ai-lab-internal/sermondub-apk"
SRC="$BUILD/src"
RES="$BUILD/res"
GEN="$BUILD/gen"
OBJ="$BUILD/obj"
BIN="$BUILD/bin"

echo "=== Cleaning ==="
rm -rf "$OBJ" "$GEN" "$BIN"
mkdir -p "$OBJ" "$GEN" "$BIN" "$OBJ/classes"

echo "=== Step 1: Compile resources with aapt2 ==="
mkdir -p "$OBJ/compiled_res"
find "$RES" -name "*.xml" | while read f; do
    echo "  Compiling: $f"
    "$AAPT2" compile -o "$OBJ/compiled_res" "$f" 2>&1
done

echo "=== Step 2: Link resources ==="
COMPILED_RES=$(find "$OBJ/compiled_res" -name "*.flat" | tr '\n' ' ')
"$AAPT2" link \
    -I "$ANDROID_JAR" \
    --manifest "$BUILD/AndroidManifest.xml" \
    --java "$GEN" \
    -o "$BIN/sermondub.apk.tmp" \
    $COMPILED_RES

echo "=== Step 3: Compile Java source ==="
find "$SRC" -name "*.java" > "$OBJ/sources.txt"
find "$GEN" -name "*.java" >> "$OBJ/sources.txt"
javac \
    -source 1.8 -target 1.8 \
    -classpath "$ANDROID_JAR" \
    -d "$OBJ/classes" \
    @"$OBJ/sources.txt"

echo "=== Step 4: Dex Java classes ==="
# d8 is a bash script with wrong shebang, call via bash
bash "$SDK/build-tools/35.0.0/d8" \
    --min-api 24 \
    --output "$OBJ" \
    $(find "$OBJ/classes" -name "*.class")

echo "=== Step 5: Add dex + assets to APK ==="
cp "$BIN/sermondub.apk.tmp" "$BIN/sermondub-unsigned.apk"

cd "$OBJ"
zip -j "$BIN/sermondub-unsigned.apk" classes.dex
cd "$BUILD"
zip -r "$BIN/sermondub-unsigned.apk" assets/

echo "=== Step 6: Align APK ==="
zipalign -f 4 \
    "$BIN/sermondub-unsigned.apk" \
    "$BIN/sermondub-aligned.apk"

echo "=== Step 7: Generate debug keystore ==="
KEYSTORE="$BUILD/debug.keystore"
if [ ! -f "$KEYSTORE" ]; then
    keytool -genkeypair \
        -keystore "$KEYSTORE" \
        -storepass android \
        -keypass android \
        -alias androiddebugkey \
        -keyalg RSA \
        -keysize 2048 \
        -validity 10000 \
        -dname "CN=Debug,OU=Debug,O=Debug,L=Debug,ST=Debug,C=US"
fi

echo "=== Step 8: Sign APK ==="
APKSIGNER="$SDK/build-tools/35.0.0/apksigner"
bash "$APKSIGNER" sign \
    --ks "$KEYSTORE" \
    --ks-pass pass:android \
    --key-pass pass:android \
    --ks-key-alias androiddebugkey \
    --out "$BIN/sermondub.apk" \
    "$BIN/sermondub-aligned.apk"

echo "=== Copying to Downloads ==="
cp "$BIN/sermondub.apk" /sdcard/Download/SermonDUB.apk
sync
am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d "file:///sdcard/Download/SermonDUB.apk" 2>&1

echo "=== Done! ==="
ls -lh "$BIN/sermondub.apk"
ls -lh /sdcard/Download/SermonDUB.apk
echo "APK: $BIN/sermondub.apk"
echo "INSTALL: /sdcard/Download/SermonDUB.apk"
