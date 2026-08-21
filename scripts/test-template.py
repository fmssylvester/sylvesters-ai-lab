import urllib.request, json, sys, time

OLLAMA = "http://localhost:11434/api/generate"
MODEL = "qwen2.5:1.5b"

def ask(prompt, max_tokens=400):
    data = json.dumps({
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"num_predict": max_tokens, "temperature": 0.7}
    }).encode()
    req = urllib.request.Request(OLLAMA, data=data, headers={"Content-Type": "application/json"})
    try:
        t0 = time.time()
        resp = urllib.request.urlopen(req, timeout=60)
        result = json.loads(resp.read().decode())
        t = time.time() - t0
        return result.get("response", "NO RESPONSE"), t
    except Exception as e:
        return f"ERROR: {e}", 0

print("=" * 70)
print("PRODUCT 1: AI Customer Support Agent")
print(f"Model: {MODEL}")
print("=" * 70)

SYSTEM = """You are a professional, friendly customer support agent for a SaaS company. Your name is 'SupportAI'.

Rules:
- Be helpful, concise, and empathetic
- Never make up information
- If a customer is frustrated, acknowledge their frustration first

When to Escalate:
If the customer asks about account deletion, billing disputes, or security concerns, respond with: ESCALATE: [reason]

Keep responses under 150 words."""

tests_1 = [
    ("Basic question", "Hi, I'm trying to export my data but I can't find the export button. Where is it?"),
    ("Frustrated customer", "Your service is terrible! I've been charged twice this month and can't get through to anyone!!"),
    ("Escalation needed", "I need to delete my account and all my personal data please."),
]

for label, msg in tests_1:
    print(f"\n--- Test: {label} ---")
    print(f"User: {msg}")
    print("Thinking...", end=" ", flush=True)
    reply, elapsed = ask(f"{SYSTEM}\n\nCustomer message: {msg}\n\nSupportAI response:")
    print(f"({elapsed:.1f}s)")
    print(f"SupportAI: {reply[:500]}")
    if "ERROR" in reply and "TIMEOUT" in reply.upper():
        print("[Request timed out - model may be loading]")
        break

print("\n" + "=" * 70)
print("PRODUCT 2: Missed Call SMS Text-Back")
print("=" * 70)

tests_2 = [
    ("Dentist office", "Bright Smile Dental", "today at 10:30 AM"),
    ("Hair salon", "Luxe Cuts Salon", "today at 2:15 PM"),
]

for label, business, time_of_call in tests_2:
    print(f"\n--- Test: {label} ---")
    prompt = f"""You are an automated SMS assistant for {business}. A customer just called and missed reaching someone.
Your ONLY job is to generate a friendly SMS reply that:
1. Greets the customer by name (use 'there' if unknown)
2. Apologizes for missing their call
3. Explains they can reply to book an appointment or ask a question
4. Keeps tone warm and professional
Keep under 160 characters.

Customer called: {time_of_call}

Generate the SMS now:"""
    print("Thinking...", end=" ", flush=True)
    reply, elapsed = ask(prompt, max_tokens=200)
    print(f"({elapsed:.1f}s)")
    print(f"SMS: {reply[:300]}")

print("\n" + "=" * 70)
print("DONE - Templates simulated successfully")
print("=" * 70)
