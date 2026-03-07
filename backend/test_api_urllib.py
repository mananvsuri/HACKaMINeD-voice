import urllib.request
import urllib.parse
import json

url = 'http://localhost:8000/api/voice/conversation'
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'

chat_history = json.dumps([{"role": "user", "content": "I want one Butter Chicken please."}, {"role": "ai", "content": "Got it, I've added one Butter Chicken to your order. Would you like anything else?"}])
current_cart = json.dumps([{"menu_item_id": 3, "quantity": 1, "name": "Butter Chicken", "modifiers": ""}])

body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="audio"; filename="test.webm"\r\n'
    f'Content-Type: audio/webm\r\n\r\n'
    f'dummy\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="chat_history"\r\n\r\n'
    f'{chat_history}\r\n'
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="current_cart"\r\n\r\n'
    f'{current_cart}\r\n'
    f'--{boundary}--\r\n'
).encode('utf-8')

req = urllib.request.Request(url, data=body, headers={
    'Content-Type': f'multipart/form-data; boundary={boundary}'
})

try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except Exception as e:
    print(e.read().decode('utf-8') if hasattr(e, 'read') else str(e))
