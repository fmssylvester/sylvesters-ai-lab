"""One-time YouTube OAuth helper.

Step 1:  python3 auth_youtube.py           -> prints the consent URL
Step 2:  python3 auth_youtube.py "<code>"  -> exchanges the code, writes the token

This is only needed once; the resulting pipeline/youtube_token.json (with its
refresh token) is then supplied to CI as the YOUTUBE_TOKEN secret, so the
remote workflow never has to prompt for a code.
"""

import sys
from pathlib import Path

import config
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]
# Copy-paste flow: Google redirects to localhost (which won't load on the
# phone) — you just copy the ?code=... value from the browser's address bar.
REDIRECT_URI = "http://localhost"


def main() -> None:
    flow = InstalledAppFlow.from_client_secrets_file(
        config.YOUTUBE_CLIENT_SECRETS, SCOPES, redirect_uri=REDIRECT_URI
    )
    if len(sys.argv) > 1:
        code = sys.argv[1].strip()
        flow.fetch_token(code=code)
        Path(config.YOUTUBE_TOKEN).write_text(
            flow.credentials.to_json(), encoding="utf-8"
        )
        print("Token written to", config.YOUTUBE_TOKEN)
    else:
        url, _ = flow.authorization_url(prompt="consent")
        print(
            "Open this URL and authorize. The browser will then try to load\n"
            "http://localhost and fail — that's expected. Copy the value of the\n"
            "'code' parameter from the address bar, e.g. from:\n"
            "   http://localhost/?code=4/ABCD...&scope=...\n"
            "and run:\n"
        )
        print(url)
        print('\n  python3 auth_youtube.py "<code>"')


if __name__ == "__main__":
    main()
