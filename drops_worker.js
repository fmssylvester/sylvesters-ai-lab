const CTYPES = {
  "": "application/octet-stream",
  txt: "text/plain; charset=utf-8", md: "text/markdown", json: "application/json",
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp",
  mp4: "video/mp4", mov: "video/quicktime", webm: "video/webm",
  safetensors: "application/octet-stream", zip: "application/zip", pt: "application/octet-stream",
  pth: "application/octet-stream", gguf: "application/octet-stream", ckpt: "application/octet-stream", bin: "application/octet-stream",
};
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));}
function fmtSize(n){if(n<1024)return n+" B";if(n<1048576)return (n/1024).toFixed(1)+" KB";if(n<1073741824)return (n/1048576).toFixed(1)+" MB";return (n/1073741824).toFixed(2)+" GB";}
const PAGE = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sylvester's AI Lab — Channel Drops</title>
<style>
:root{--bg:#07090D;--cyan:#00D9FF;--gold:#E7B84D;}
*{box-sizing:border-box;}
body{margin:0;background:radial-gradient(1200px 600px at 12% -10%,rgba(0,217,255,0.10),transparent 60%),radial-gradient(1000px 600px at 100% 110%,rgba(231,184,77,0.08),transparent 60%),var(--bg);color:#eaf6ff;font-family:'Inter',system-ui,sans-serif;min-height:100vh;}
.wrap{max-width:980px;margin:0 auto;padding:28px 20px 60px;}
.header{display:flex;align-items:center;gap:16px;padding:18px 22px;border:1px solid rgba(0,217,255,0.18);border-radius:18px;background:linear-gradient(135deg,rgba(0,217,255,0.06),rgba(231,184,77,0.04));backdrop-filter:blur(14px);box-shadow:0 10px 40px rgba(0,0,0,0.45);}
.logo{width:52px;height:52px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:22px;color:#04121A;background:linear-gradient(135deg,var(--cyan),#0A8FBF);box-shadow:0 0 22px rgba(0,217,255,0.35);}
.title{font-weight:700;letter-spacing:2px;font-size:20px;} .title .accent{color:var(--gold);}
.tag{font-size:10.5px;letter-spacing:3px;color:rgba(0,217,255,0.75);margin-top:3px;}
.sub{margin:18px 4px 10px;color:#9fb3c8;font-size:14px;}
.search{width:100%;padding:12px 14px;border-radius:12px;border:1px solid rgba(0,217,255,0.18);background:rgba(0,0,0,0.30);color:#eaf6ff;font-size:15px;margin-bottom:14px;}
.search:focus{outline:none;border-color:var(--cyan);box-shadow:0 0 14px rgba(0,217,255,0.3);}
table{width:100%;border-collapse:collapse;}
th,td{text-align:left;padding:12px 10px;border-bottom:1px solid rgba(0,217,255,0.10);}
th{color:#9fb3c8;font-weight:600;font-size:12px;letter-spacing:1px;text-transform:uppercase;}
td.name a{color:var(--cyan);text-decoration:none;font-weight:600;word-break:break-all;}
td.name a:hover{text-decoration:underline;}
.dl{display:inline-block;padding:6px 12px;border-radius:10px;background:linear-gradient(90deg,var(--cyan),#0A8FBF);color:#04121A;font-weight:700;text-decoration:none;font-size:13px;}
.empty{color:#7e93a8;text-align:center;padding:40px;}
footer{margin-top:30px;text-align:center;color:#7e93a8;font-size:12px;letter-spacing:0.5px;} footer b{color:#cfe9f7;font-family:'Space Grotesk',sans-serif;}
</style></head><body>
<div class="wrap"><div class="header"><div class="logo">S</div><div><div class="title">SYLVESTER'S <span class="accent">AI LAB</span></div><div class="tag">CHANNEL DROPS · ASSET LIBRARY</div></div></div>
<div class="sub">Free assets for the channel — prompts, images, LoRAs, videos. Drop new ones any time from Telegram with <code>/drop</code>.</div>
<input id="q" class="search" placeholder="Filter assets by name…" oninput="filter()">
<table><thead><tr><th>Asset</th><th>Size</th><th>Added</th><th></th></tr></thead><tbody id="rows">__ROWS__</tbody></table>
<div id="empty" class="empty" style="display:none;">No assets yet — send a file or <code>/drop your prompt</code> in Telegram.</div>
<footer>SYLVESTER'S AI LAB · <b>Crafted with light</b></footer></div>
<script>
const all=__DATA__;const tbody=document.getElementById('rows');const empty=document.getElementById('empty');
function render(list){tbody.innerHTML=list.map(it=>{const enc=encodeURIComponent(it.key);return '<tr><td class="name"><a href="/d/'+enc+'">'+esc(it.fname)+'</a></td><td>'+it.size+'</td><td>'+it.mod+'</td><td><a class="dl" href="/d/'+enc+'">Download</a></td></tr>';}).join('');empty.style.display=list.length?'none':'block';}
function esc(s){const d={'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'};return String(s).replace(/[&<>"']/g,c=>d[c]);}
function filter(){const q=document.getElementById('q').value.toLowerCase();render(all.filter(x=>x.fname.toLowerCase().includes(q)));}
render(all);
</script></body></html>`;
async function listPage(env){
  const listed = await env.BUCKET.list({ prefix: "drops/", limit: 1000 });
  let items = (listed.objects||[]).map(o=>({key:o.key,fname:o.key.split("/").pop(),size:fmtSize(o.size||0),mod:o.uploaded?new Date(o.uploaded).toISOString().slice(0,10):""}));
  items.sort((a,b)=>b.key.localeCompare(a.key));
  const html = PAGE.replace("__ROWS__","").replace("__DATA__",JSON.stringify(items));
  return new Response(html,{headers:{"Content-Type":"text/html; charset=utf-8"}});
}
async function handleTranscribe(request, env) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let audioBase64;
    let language = "en";

    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("audio");
      if (!file) return new Response("No audio file", { status: 400 });
      language = form.get("language") || "en";
      const buf = await file.arrayBuffer();
      audioBase64 = Buffer.from(buf).toString("base64");
    } else {
      const body = await request.json();
      audioBase64 = body.audio;
      language = body.language || "en";
      if (!audioBase64) return new Response("No audio data", { status: 400 });
    }

    const result = await env.AI.run("@cf/openai/whisper-large-v3-turbo", {
      audio: audioBase64,
      language: language,
      task: "transcribe",
      vad_filter: true,
      word_timestamps: true,
    });

    const segments = [];
    if (result.segments) {
      for (const seg of result.segments) {
        segments.push({
          start: seg.start || 0,
          end: seg.end || 0,
          text: (seg.text || "").trim(),
          words: (seg.words || []).map(w => ({
            word: w.word || "",
            start: w.start || 0,
            end: w.end || 0,
            probability: w.probability || 0.5
          }))
        });
      }
    } else if (result.text) {
      segments.push({
        start: 0,
        end: 30,
        text: result.text.trim(),
        words: []
      });
    }

    return new Response(JSON.stringify({
      text: result.text || "",
      language: result.language || language,
      segments: segments,
      duration: segments.length > 0 ? segments[segments.length - 1].end : 0
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}

async function handleHighlights(request, env) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await request.json();
    const segments = body.segments;
    const language = body.language || "en";
    if (!segments || !segments.length) return new Response("No segments", { status: 400 });

    // Build transcript with timestamps for the LLM
    let transcript = segments.map(s => {
      const mins = Math.floor(s.start / 60);
      const secs = Math.floor(s.start % 60);
      const ts = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
      return `[${ts}] ${s.text}`;
    }).join('\n');

    const prompt = `You are a sermon clip editor. Analyze this sermon transcript and find the 5-8 best moments to share as short video clips (15-60 seconds each).

RULES:
- Each clip should be a complete thought, not a fragment
- Look for: powerful statements, emotional moments, key teachings, memorable quotes, call-to-action moments
- Each clip must include enough context to be understood on its own
- Return ONLY valid JSON, no explanation

TRANSCRIPT:
${transcript}

Return a JSON array of highlights. Each highlight object must have:
- "start": start time in seconds (number)
- "end": end time in seconds (number)  
- "title": short title (string, max 50 chars)
- "reason": why this moment is shareable (string, max 100 chars)

Example: [{"start": 120, "end": 165, "title": "The Gospel in 45 seconds", "reason": "Powerful concise summary that resonates"}]

Return ONLY the JSON array, nothing else.`;

    const result = await env.AI.run("@cf/mistralai/mistral-small-3.1-24b-instruct", {
      messages: [{ role: "user", content: prompt }],
      max_tokens: 2048,
      temperature: 0.3
    });

    let responseText = result.response || '';
    // Extract JSON from the response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      // Fallback: create clips from every 30 seconds
      const fallback = [];
      const duration = segments[segments.length - 1].end;
      for (let t = 0; t < duration; t += 30) {
        fallback.push({
          start: t,
          end: Math.min(t + 30, duration),
          title: `Clip at ${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}`,
          reason: "Auto-generated clip"
        });
      }
      return new Response(JSON.stringify({ highlights: fallback }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    const highlights = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify({ highlights }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}

function handleCORS() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

export default {
  async fetch(request, env){
    const url = new URL(request.url); const p = url.pathname;
    if (request.method === "OPTIONS") return handleCORS();
    if(p==="/transcribe") return await handleTranscribe(request, env);
    if(p==="/highlights") return await handleHighlights(request, env);
    if(p==="/"||p==="/index.html") return await listPage(env);
    if(p.startsWith("/d/")){
      const key = decodeURIComponent(p.slice(3));
      const obj = await env.BUCKET.get(key);
      if(!obj) return new Response("Not found",{status:404});
      const ext = key.includes(".")?key.split(".").pop().toLowerCase():"";
      const ctype = CTYPES[ext]||"application/octet-stream";
      return new Response(obj.body,{headers:{"Content-Type":ctype,"Content-Disposition":`attachment; filename="${key.split("/").pop()}"`,"Cache-Control":"public, max-age=3600"}});
    }
    return new Response("Not found",{status:404});
  }
};
