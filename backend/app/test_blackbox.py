import os

import httpx
from dotenv import load_dotenv

load_dotenv()

headers = {"Authorization": f"Bearer {os.getenv('BLACKBOX_API_KEY')}"}

response = httpx.get(
    "https://api.blackbox.ai/v1/models",
    headers=headers,
)

print(response.status_code)
print(response.text)
