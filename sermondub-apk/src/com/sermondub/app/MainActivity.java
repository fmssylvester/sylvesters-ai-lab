package com.sermondub.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.graphics.Color;
import android.database.Cursor;
import android.provider.OpenableColumns;
import android.media.MediaCodec;
import android.media.MediaExtractor;
import android.media.MediaFormat;
import android.media.MediaMuxer;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.RandomAccessFile;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.ByteBuffer;

public class MainActivity extends Activity {
    private WebView webView;
    private static final int VIDEO_PICK_CODE = 1002;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private static final String API_URL = "https://sylvester-drops.sylvester-ai-lab.workers.dev/transcribe";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN, WindowManager.LayoutParams.FLAG_FULLSCREEN);
        webView = new WebView(this);
        setContentView(webView);
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());
        webView.setBackgroundColor(Color.parseColor("#07090D"));
        webView.addJavascriptInterface(new SermonBridge(), "SermonBridge");
        webView.loadUrl("file:///android_asset/index.html");
        new Thread(this::extractAssets).start();
    }

    private void extractAssets() {
        File libsDir = new File(getFilesDir(), "libs");
        if (libsDir.exists() && libsDir.list() != null && libsDir.list().length > 5) return;
        try {
            libsDir.mkdirs();
            new File(getFilesDir(), "models").mkdirs();
            String[] libFiles = getAssets().list("libs");
            if (libFiles != null) {
                for (String name : libFiles) {
                    InputStream is = getAssets().open("libs/" + name);
                    FileOutputStream fos = new FileOutputStream(new File(libsDir, name));
                    byte[] buf = new byte[8192]; int len;
                    while ((len = is.read(buf)) > 0) fos.write(buf, 0, len);
                    fos.close(); is.close();
                    new File(libsDir, name).setExecutable(true);
                }
            }
            InputStream is = getAssets().open("pipeline.sh");
            File pf = new File(getFilesDir(), "pipeline.sh");
            FileOutputStream fos = new FileOutputStream(pf);
            byte[] buf = new byte[8192]; int len;
            while ((len = is.read(buf)) > 0) fos.write(buf, 0, len);
            fos.close(); is.close(); pf.setExecutable(true);
            evalJs("onAssetsReady()");
        } catch (Exception e) { evalJs("onError('Setup failed')"); }
    }

    private String extractAudioToAac(String inputPath) throws Exception {
        String ext = inputPath.toLowerCase();
        if (ext.endsWith(".mp3") || ext.endsWith(".aac") || ext.endsWith(".m4a")) return inputPath;

        evalJs("onPipelineStatus('Extracting audio...')");
        File outFile = new File(getFilesDir(), "work/tmp/audio.m4a");
        outFile.getParentFile().mkdirs();
        if (outFile.exists()) outFile.delete();

        MediaExtractor extractor = new MediaExtractor();
        extractor.setDataSource(inputPath);
        int audioTrack = -1;
        for (int i = 0; i < extractor.getTrackCount(); i++) {
            MediaFormat fmt = extractor.getTrackFormat(i);
            String mime = fmt.getString(MediaFormat.KEY_MIME);
            if (mime != null && mime.startsWith("audio/")) { audioTrack = i; break; }
        }
        if (audioTrack < 0) { extractor.release(); throw new Exception("No audio track"); }
        extractor.selectTrack(audioTrack);
        MediaFormat audioFmt = extractor.getTrackFormat(audioTrack);

        MediaMuxer muxer = new MediaMuxer(outFile.getAbsolutePath(), MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4);
        int muxerTrack = muxer.addTrack(audioFmt);
        muxer.start();

        ByteBuffer buf = ByteBuffer.allocate(1024 * 1024);
        MediaCodec.BufferInfo bufInfo = new MediaCodec.BufferInfo();
        while (true) {
            int sampleSize = extractor.readSampleData(buf, 0);
            if (sampleSize < 0) break;
            bufInfo.offset = 0;
            bufInfo.size = sampleSize;
            bufInfo.presentationTimeUs = extractor.getSampleTime();
            bufInfo.flags = extractor.getSampleFlags();
            muxer.writeSampleData(muxerTrack, buf, bufInfo);
            extractor.advance();
        }

        extractor.release();
        muxer.stop();
        muxer.release();

        long sizeKb = outFile.length() / 1024;
        evalJs("onPipelineStatus('Audio ready: " + sizeKb + "KB')");
        return outFile.getAbsolutePath();
    }

    private String cutVideoClip(String inputPath, double startSec, double endSec, int clipIndex) throws Exception {
        if (endSec - startSec < 8) endSec = startSec + 15;

        File clipsDir = new File(getFilesDir(), "work/clips");
        clipsDir.mkdirs();
        File outputFile = new File(clipsDir, "clip_" + clipIndex + ".mp4");
        if (outputFile.exists()) outputFile.delete();

        long startUs = (long)(startSec * 1000000);
        long endUs = (long)(endSec * 1000000);

        MediaExtractor extractor = new MediaExtractor();
        extractor.setDataSource(inputPath);
        int trackCount = extractor.getTrackCount();

        MediaMuxer muxer = new MediaMuxer(outputFile.getAbsolutePath(), MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4);
        int[] trackMap = new int[trackCount];
        for (int i = 0; i < trackCount; i++) {
            trackMap[i] = muxer.addTrack(extractor.getTrackFormat(i));
        }

        // Write codec config for each track first
        for (int t = 0; t < trackCount; t++) {
            MediaFormat fmt = extractor.getTrackFormat(t);
            String mime = fmt.getString(MediaFormat.KEY_MIME);
            if (mime == null) continue;
            for (int c = 0; c < 2; c++) {
                String key = "csd-" + c;
                ByteBuffer csd = fmt.getByteBuffer(key);
                if (csd != null) {
                    MediaCodec.BufferInfo ci = new MediaCodec.BufferInfo();
                    ci.offset = 0;
                    ci.size = csd.remaining();
                    ci.presentationTimeUs = 0;
                    ci.flags = MediaCodec.BUFFER_FLAG_CODEC_CONFIG;
                    muxer.writeSampleData(trackMap[t], csd, ci);
                }
            }
        }
        muxer.start();

        ByteBuffer buffer = ByteBuffer.allocate(1024 * 1024);
        MediaCodec.BufferInfo bi = new MediaCodec.BufferInfo();
        for (int t = 0; t < trackCount; t++) {
            extractor.selectTrack(t);
            extractor.seekTo(startUs, MediaExtractor.SEEK_TO_CLOSEST_SYNC);
            while (true) {
                bi.offset = 0;
                bi.size = extractor.readSampleData(buffer, 0);
                if (bi.size < 0) break;
                long rawPts = extractor.getSampleTime();
                if (rawPts > endUs) break;
                bi.presentationTimeUs = rawPts - startUs;
                bi.flags = extractor.getSampleFlags();
                muxer.writeSampleData(trackMap[t], buffer, bi);
                extractor.advance();
            }
            extractor.unselectTrack(t);
        }
        muxer.stop(); muxer.release(); extractor.release();

        long clipSizeKb = outputFile.length() / 1024;
        return outputFile.getAbsolutePath();
    }

    class SermonBridge {
        @JavascriptInterface
        public void pickVideo() {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.setType("video/*"); i.addCategory(Intent.CATEGORY_OPENABLE);
                try { startActivityForResult(Intent.createChooser(i, "Select Sermon Video"), VIDEO_PICK_CODE); }
                catch (Exception e) { evalJs("onError('No file manager found')"); }
            });
        }
        @JavascriptInterface
        public void pickAudio() {
            runOnUiThread(() -> {
                Intent i = new Intent(Intent.ACTION_GET_CONTENT);
                i.setType("audio/*"); i.addCategory(Intent.CATEGORY_OPENABLE);
                try { startActivityForResult(Intent.createChooser(i, "Select Sermon Audio"), VIDEO_PICK_CODE); }
                catch (Exception e) { evalJs("onError('No file manager found')"); }
            });
        }
        @JavascriptInterface
        public void runPipeline(String inputPath, String language) {
            new Thread(() -> {
                try {
                    evalJs("onPipelineStatus('Preparing...')");
                    File workDir = new File(getFilesDir(), "work");
                    workDir.mkdirs();
                    new File(workDir, "clips").mkdirs();
                    new File(workDir, "tmp").mkdirs();

                    long fileSizeMb = new File(inputPath).length() / (1024 * 1024);
                    evalJs("onPipelineStatus('Video: " + fileSizeMb + "MB')");

                    String audioPath = inputPath;
                    try { audioPath = extractAudioToAac(inputPath); }
                    catch (Exception e) {
                        evalJs("onPipelineStatus('AAC failed, using original')");
                    }

                    evalJs("onPipelineStatus('Encoding for upload...')");
                    File audioFile = new File(audioPath);
                    long audioSizeMb = audioFile.length() / (1024 * 1024);
                    evalJs("onPipelineStatus('Audio: " + audioSizeMb + "MB')");

                    if (audioFile.length() > 25 * 1024 * 1024) {
                        throw new Exception("Audio too large (" + audioSizeMb + "MB). Max 25MB.");
                    }

                    byte[] audioBytes = new byte[(int) audioFile.length()];
                    FileInputStream fis = new FileInputStream(audioFile);
                    fis.read(audioBytes); fis.close();
                    String base64 = android.util.Base64.encodeToString(audioBytes, android.util.Base64.NO_WRAP);
                    int kb64 = base64.length() / 1024;
                    evalJs("onPipelineStatus('Uploading " + kb64 + "KB...')");

                    URL url = new URL(API_URL);
                    HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json");
                    conn.setDoOutput(true);
                    conn.setConnectTimeout(300000);
                    conn.setReadTimeout(300000);
                    java.io.OutputStream os = conn.getOutputStream();
                    java.io.OutputStreamWriter writer = new java.io.OutputStreamWriter(os, "UTF-8");
                    writer.write("{\"audio\":\"");
                    writer.write(base64);
                    writer.write("\",\"language\":\"");
                    writer.write(language);
                    writer.write("\"}");
                    writer.flush();
                    writer.close();

                    int code = conn.getResponseCode();
                    if (code != 200) {
                        InputStream errStream = conn.getErrorStream();
                        String errBody = "";
                        if (errStream != null) {
                            BufferedReader err = new BufferedReader(new InputStreamReader(errStream));
                            StringBuilder errSb = new StringBuilder();
                            String l; while ((l = err.readLine()) != null) errSb.append(l);
                            errBody = errSb.toString();
                        }
                        throw new Exception("Server " + code + ": " + errBody.substring(0, Math.min(200, errBody.length())));
                    }

                    evalJs("onPipelineStatus('Transcription received!')");
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn.getInputStream()));
                    StringBuilder sb = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) sb.append(line);
                    reader.close(); conn.disconnect();

                    String transJson = sb.toString();

                    // Skip highlights for now — use raw segments directly as clips
                    // This avoids the LLM call that may timeout or crash
                    evalJs("onPipelineStatus('Cutting clips...')");
                    parseAndCutClips(transJson, inputPath);

                    handler.post(() -> evalJs("onPipelineComplete('done')"));
                } catch (Exception e) {
                    String msg = e.getMessage() != null ? e.getMessage().replace("'", "\\'") : "Unknown error";
                    handler.post(() -> evalJs("onPipelineError('" + msg + "')"));
                }
            }).start();
        }

        @JavascriptInterface
        public void shareVideoClip(String clipPath) {
            runOnUiThread(() -> {
                try {
                    File clipFile = new File(clipPath);
                    if (!clipFile.exists()) { showToast("Clip not found: " + clipPath); return; }

                    // Copy to shared storage so other apps can access it
                    File sharedDir = new File("/sdcard/Download");
                    if (!sharedDir.exists()) sharedDir.mkdirs();
                    File sharedFile = new File(sharedDir, "SermonDUB_clip_" + System.currentTimeMillis() + ".mp4");
                    FileInputStream fis = new FileInputStream(clipFile);
                    FileOutputStream fos = new FileOutputStream(sharedFile);
                    byte[] buf = new byte[8192];
                    int len;
                    while ((len = fis.read(buf)) > 0) fos.write(buf, 0, len);
                    fis.close(); fos.close();

                    // Scan so it shows up in gallery
                    Intent scan = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE, Uri.fromFile(sharedFile));
                    sendBroadcast(scan);

                    Uri uri = Uri.fromFile(sharedFile);
                    Intent share = new Intent(Intent.ACTION_SEND);
                    share.setType("video/mp4");
                    share.putExtra(Intent.EXTRA_STREAM, uri);
                    share.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    try {
                        share.setPackage("com.whatsapp");
                        startActivity(share);
                    } catch (Exception e) {
                        Intent fb = new Intent(Intent.ACTION_SEND);
                        fb.setType("video/mp4");
                        fb.putExtra(Intent.EXTRA_STREAM, uri);
                        fb.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                        startActivity(Intent.createChooser(fb, "Share video clip"));
                    }
                } catch (Exception e) {
                    showToast("Share failed: " + e.getMessage());
                }
            });
        }

        @JavascriptInterface
        public String getWorkDir() { return getFilesDir().getAbsolutePath(); }
    }

    private void parseAndCutClips(String json, String inputPath) {
        try {
            // Try "highlights" first, then fall back to "segments"
            int hlIdx = json.indexOf("\"highlights\"");
            int segIdx = json.indexOf("\"segments\"");
            int arrStart = -1, arrEnd = -1;

            if (hlIdx >= 0) {
                arrStart = json.indexOf("[", hlIdx);
                arrEnd = json.lastIndexOf("]");
            } else if (segIdx >= 0) {
                arrStart = json.indexOf("[", segIdx);
                arrEnd = json.lastIndexOf("]");
            }

            if (arrStart < 0 || arrEnd < 0) {
                // No highlights or segments — create one clip from the whole thing
                String text = jsonGetString(json, "text");
                if (!text.isEmpty()) {
                    String cp = "-1";
                    try { cp = cutVideoClip(inputPath, 0, 30, 1); } catch (Exception e) {}
                    final String fcp = cp;
                    final String ft = text.replace("'", "\\'").replace(":", "-");
                    handler.post(() -> evalJs("onClipGenerated('1:0.0:30.0:" + ft + ":" + fcp + "')"));
                }
                return;
            }
            String arr = json.substring(arrStart + 1, arrEnd);

            int clipNum = 0, depth = 0;
            int objStart = -1;

            for (int i = 0; i < arr.length(); i++) {
                char c = arr.charAt(i);
                if (c == '{') { if (depth == 0) objStart = i; depth++; }
                else if (c == '}') {
                    depth--;
                    if (depth == 0 && objStart >= 0) {
                        clipNum++;
                        String obj = arr.substring(objStart, i + 1);
                        double start = jsonGetDouble(obj, "start");
                        double end = jsonGetDouble(obj, "end");
                        // Highlights use "title", segments use "text"
                        String title = jsonGetString(obj, "title");
                        String text = jsonGetString(obj, "text");
                        String clipTitle = !title.isEmpty() ? title : text;
                        String ct = clipTitle.replace("'", "\\'").replace(":", "-");
                        if (ct.length() > 100) ct = ct.substring(0, 100);

                        // Ensure clip is at least 10 seconds
                        if (end - start < 10) end = start + 15;

                        String cp = "-1";
                        final int cn = clipNum;
                        final double fStart = start, fEnd = end;
                        try {
                            handler.post(() -> evalJs("onPipelineStatus('Cutting clip " + cn + " [" + (int)fStart + "s-" + (int)fEnd + "s]...')"));
                            cp = cutVideoClip(inputPath, start, end, clipNum);
                            final String fcp = cp;
                            handler.post(() -> evalJs("onPipelineStatus('Clip " + cn + " done: " + fcp.substring(Math.max(0, fcp.length()-30)) + "')"));
                        } catch (Exception e) {
                            String errMsg = e.getMessage() != null ? e.getMessage() : "unknown";
                            final String fem = errMsg.replace("'", "\\'");
                            handler.post(() -> evalJs("onPipelineStatus('Clip " + cn + " FAILED: " + fem + "')"));
                        }

                        final String t = ct;
                        final String p = cp;
                        handler.post(() -> evalJs("onClipGenerated('" + cn + ":" + fStart + ":" + fEnd + ":" + t + ":" + p + "')"));
                        objStart = -1;
                    }
                }
            }
        } catch (Exception e) {
            handler.post(() -> evalJs("onPipelineError('Parse error')"));
        }
    }

    private double jsonGetDouble(String json, String key) {
        int idx = json.indexOf("\"" + key + "\"");
        if (idx < 0) return 0;
        int colon = json.indexOf(':', idx) + 1;
        while (colon < json.length() && json.charAt(colon) == ' ') colon++;
        int end = colon;
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '.' || json.charAt(end) == '-')) end++;
        try { return Double.parseDouble(json.substring(colon, end)); } catch (Exception e) { return 0; }
    }

    private String jsonGetString(String json, String key) {
        int idx = json.indexOf("\"" + key + "\"");
        if (idx < 0) return "";
        int colon = json.indexOf(':', idx);
        int qStart = json.indexOf('"', colon + 1);
        if (qStart < 0) return "";
        int qEnd = qStart + 1;
        while (qEnd < json.length()) {
            char c = json.charAt(qEnd);
            if (c == '\\') { qEnd += 2; continue; }
            if (c == '"') break;
            qEnd++;
        }
        return json.substring(qStart + 1, qEnd);
    }

    private String extractSegmentsArray(String json) {
        int segIdx = json.indexOf("\"segments\"");
        if (segIdx < 0) return "[]";
        int arrStart = json.indexOf("[", segIdx);
        int arrEnd = json.lastIndexOf("]");
        if (arrStart < 0 || arrEnd < 0) return "[]";
        return json.substring(arrStart, arrEnd + 1);
    }

    private void evalJs(String js) {
        runOnUiThread(() -> webView.evaluateJavascript(js, null));
    }
    private void showToast(String msg) {
        handler.post(() -> android.widget.Toast.makeText(MainActivity.this, msg, android.widget.Toast.LENGTH_LONG).show());
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK && data != null && data.getData() != null) {
            String path = copyUriToWorkDir(data.getData());
            if (path != null) runOnUiThread(() -> webView.evaluateJavascript("onFileSelected('" + path.replace("'", "\\'") + "')", null));
        }
    }

    private String copyUriToWorkDir(Uri uri) {
        try {
            String name = "input.mp4";
            Cursor cursor = getContentResolver().query(uri, null, null, null, null);
            if (cursor != null) {
                int idx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME);
                if (idx >= 0 && cursor.moveToFirst()) name = cursor.getString(idx);
                cursor.close();
            }
            File outFile = new File(getFilesDir(), name);
            InputStream is = getContentResolver().openInputStream(uri);
            FileOutputStream fos = new FileOutputStream(outFile);
            byte[] buf = new byte[65536]; int len;
            while ((len = is.read(buf)) > 0) fos.write(buf, 0, len);
            fos.close(); is.close();
            return outFile.getAbsolutePath();
        } catch (Exception e) { evalJs("onError('File read failed')"); return null; }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }
}
