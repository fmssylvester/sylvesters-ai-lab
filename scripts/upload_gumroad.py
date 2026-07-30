"""
Upload n8n workflow templates to Gumroad via API.

Gumroad Product Structure (complete):
  - Thumbnail: image upload (manual via dashboard)
  - Product info:
      - Call to action: dropdown
      - Summary (custom_summary): short 1-2 sentence pitch
  - Additional details: rich text content (rich_content array)
  - Pricing:
      - Amount (price_cents): base price in cents
      - Allow customers to pay what they want: toggle
      - Allow customers to pay in installments: toggle
  - Versions (variant_categories / variants):
      Each version has:
        - Name: text input
        - Description: large text area / rich text
        - Additional amount: price difference in cents
        - Maximum number of purchases: optional limit
      API for variants:
        - List: GET /v2/products/:id/variant_categories
        - Create: POST /v2/products/:id/variant_categories
        - Update: PUT /v2/products/:id/variant_categories/:cat_id
        - Variants: POST /v2/products/:id/variant_categories/:id/variants
        - Update variant: PUT /v2/products/:id/variant_categories/:id/variants/:vid
  - Settings: various checkboxes + custom domain
  - Refund policy: dropdown

Usage:
  1. Get your Gumroad access token from https://gumroad.com/settings/advanced
  2. python3 scripts/upload_gumroad.py <access_token> [product_name]
"""

import sys
import os
import json
import urllib.request
import urllib.parse

PRODUCTS = {
    "ai-customer-support": {
        "dir": "products/ai-customer-support-agent",
        "name": "AI Customer Support Agent - n8n Workflow Template",
        "price": 29,
        "description": (
            "Deploy a fully functional AI customer support agent in minutes. "
            "This n8n workflow handles customer inquiries, remembers conversation "
            "context, and integrates with your existing tools.\n\n"
            "**What's Included:**\n"
            "- Ready-to-import n8n workflow JSON\n"
            "- Professional system prompt (empathetic, context-aware)\n"
            "- 10-message conversation memory\n"
            "- Webhook endpoint for easy integration\n"
            "- Detailed setup guide\n\n"
            "**Features:**\n"
            "- Handles unlimited concurrent conversations\n"
            "- Remembers context across messages\n"
            "- Escalates to humans when needed\n"
            "- Customizable brand voice and tone\n"
            "- Works with any frontend\n\n"
            "**Requirements:**\n"
            "- n8n instance (free self-hosted or cloud)\n"
            "- OpenAI API key"
        ),
        "files": ["template.json", "SETUP.md"],
        "tags": ["AI", "Customer Support", "Chatbot", "n8n", "Automation"],
    },
    "missed-call-sms": {
        "dir": "products/missed-call-sms",
        "name": "Missed Call SMS Text-Back - n8n Workflow Template",
        "price": 39,
        "description": (
            "Convert missed calls into booked appointments with this AI-powered "
            "SMS follow-up workflow. When a customer calls and misses you, this "
            "template automatically sends a warm, personalized text message.\n\n"
            "**What's Included:**\n"
            "- Ready-to-import n8n workflow JSON\n"
            "- AI-generated SMS replies\n"
            "- Twilio integration for SMS delivery\n"
            "- Detailed setup guide\n\n"
            "**Use Cases:**\n"
            "- Dental and medical offices\n"
            "- Auto repair shops\n"
            "- Hair salons and barbershops\n"
            "- Real estate agents\n\n"
            "**Requirements:**\n"
            "- n8n instance\n"
            "- OpenAI API key\n"
            "- Twilio account"
        ),
        "files": ["template.json", "SETUP.md"],
        "tags": ["SMS", "AI", "Appointment", "Automation", "Twilio"],
    },
    "patient-records": {
        "dir": "products/patient-records-system",
        "name": "Patient Records Lookup - n8n Workflow Template",
        "price": 49,
        "custom_summary": "Instant patient records from any phone. Type a name or ID and get a complete medical summary in seconds via Telegram, WhatsApp, SMS, or web.",
        "description": (
            "Give your clinic instant patient record access from any phone. "
            "Type a patient name or ID and get a complete medical summary in seconds.\n\n"
            "Works via Telegram, WhatsApp, SMS, or web dashboard. No expensive EHR system needed.\n\n"
            "**What's Included:**\n"
            "- Ready-to-import n8n workflow JSON\n"
            "- Google Sheets template (CSV)\n"
            "- Professional patient dashboard HTML (login + search UI)\n"
            "- Setup guide\n\n"
            "**Features:**\n"
            "- Search by patient name or ID\n"
            "- Returns: allergies, medications, blood type, conditions, visits\n"
            "- Works with Google Sheets (free tier)\n"
            "- Webhook trigger for easy frontend integration\n"
            "- n8n Data Table integration\n\n"
            "**Perfect For:**\n"
            "- Small clinics and solo doctors\n"
            "- Dental practices\n"
            "- Physiotherapy clinics\n"
            "- Pharmacies\n\n"
            "**Requirements:**\n"
            "- n8n instance\n"
            "- Google Sheets (free)"
        ),
        "files": ["workflow-patient-lookup.json", "google-sheet-template.csv"],
        "tags": ["Healthcare", "Medical", "Patient Records", "n8n", "Clinic"],
    },
}

GUMROAD_API = "https://api.gumroad.com/v2"


def upload_file(token, product_id, filepath, filename):
    """Upload a file (content as multipart) -- note: Gumroad's API for file uploads
    during creation is limited. This script creates the product, then you upload
    files manually via the Gumroad dashboard, OR we use the PUT endpoint."""
    print(f"  File {filename} needs manual upload at: https://gumroad.com/products/{product_id}/edit")
    print(f"  Local path: {filepath}")
    return True


def create_product(token, product_key, product_info):
    print(f"\n{'='*60}")
    print(f"Creating: {product_info['name']}")
    print(f"{'='*60}")

    # Read file contents
    product_dir = product_info["dir"]
    file_contents = {}
    for fname in product_info["files"]:
        fpath = os.path.join(product_dir, fname)
        if os.path.exists(fpath):
            with open(fpath) as f:
                file_contents[fname] = f.read()
            print(f"  Read: {fpath} ({len(file_contents[fname])} bytes)")
        else:
            print(f"  WARNING: {fpath} not found")

    product_payload = {
        "access_token": token,
        "name": product_info["name"],
        "price": str(product_info["price"] * 100),  # dollars to cents
        "description": product_info["description"],
        "custom_summary": product_info.get("custom_summary", ""),
        "variant_categories": [
            {
                "title": "License",
                "variants": [
                    {"name": "Basic - Single Use", "price_difference_cents": 0},
                    {"name": "Pro - Commercial Use", "price_difference_cents": 2000},
                    {"name": "Agency - White Label", "price_difference_cents": 12000},
                ]
            }
        ] if product_key != "patient-records" else [
            {
                "title": "Edition",
                "variants": [
                    {"name": "Essentials", "price_difference_cents": 0},
                    {"name": "Professional", "price_difference_cents": 4800},
                    {"name": "Enterprise", "price_difference_cents": 14800},
                ]
            }
        ],
        "tags": product_info["tags"],
    }

    body = json.dumps(product_payload).encode()

    try:
        req = urllib.request.Request(
            f"{GUMROAD_API}/products",
            data=body,
            method="POST"
        )
        req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=30) as resp:
            result = json.loads(resp.read())
        if result.get("success"):
            product = result["product"]
            pid = product["id"]
            print(f"  CREATED: {product['name']}")
            print(f"  ID: {pid}")
            print(f"  URL: https://gumroad.com/l/{product.get('permalink', pid)}")
            print(f"  Edit: https://gumroad.com/products/{pid}/edit")
            print(f"\n  NEXT STEPS:")
            print(f"  1. Upload template.json and SETUP.md as product files at the edit URL above")
            print(f"  2. Set a custom permalink")
            print(f"  3. Publish the product")
            return pid
        else:
            print(f"  FAILED: {result}")
            return None
    except urllib.error.HTTPError as e:
        print(f"  HTTP ERROR: {e.code} - {e.read().decode()}")
        return None
    except Exception as e:
        print(f"  ERROR: {e}")
        return None


def main():
    token = os.environ.get("GUMROAD_TOKEN") or (sys.argv[1] if len(sys.argv) > 1 else None)

    if not token:
        print("Usage: python3 scripts/upload_gumroad.py [access_token] [product_name]")
        print("\n  Or set GUMROAD_TOKEN environment variable")
        print("\nAvailable products: ai-customer-support, missed-call-sms, patient-records")
        print("\nTo get your access token:")
        print("  1. Go to https://gumroad.com/settings/advanced")
        print("  2. Create an application")
        print("  3. Get your access token")
        print("\nExamples:")
        print("  python3 scripts/upload_gumroad.py <token>")
        print("  python3 scripts/upload_gumroad.py <token> patient-records")
        print("  GUMROAD_TOKEN=<token> python3 scripts/upload_gumroad.py patient-records")
        sys.exit(1)

    product_filter = None
    if len(sys.argv) > 1 and token == sys.argv[1]:
        if len(sys.argv) > 2:
            product_filter = sys.argv[2]
    elif len(sys.argv) > 1:
        product_filter = sys.argv[1]

    for key, info in PRODUCTS.items():
        if product_filter and key != product_filter:
            continue
        create_product(token, key, info)

    print("\nDone! Products created as drafts. Upload files manually at the edit URLs above.")


if __name__ == "__main__":
    main()
