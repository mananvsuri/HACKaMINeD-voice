import requests
import json

url = "http://localhost:8000/api/voice/conversation"

# Provide a valid empty webm
with open("test.webm", "wb") as f:
    f.write(b"")

data = {
    "chat_history": json.dumps([
        {"role": "user", "content": "I want one Butter Chicken please."},
        {"role": "ai", "content": "Got it, I've added one Butter Chicken to your order. Would you like anything else?"}
    ]),
    "current_cart": json.dumps([
        {"menu_item_id": 3, "quantity": 1, "name": "Butter Chicken", "modifiers": ""}
    ])
}

files = {
    "audio": ("test.webm", open("test.webm", "rb"), "audio/webm")
}

try:
    r = requests.post(url, data=data, files=files)
    print("STATUS:", r.status_code)
    print("RESPONSE:", r.text)
except Exception as e:
    print(e)
