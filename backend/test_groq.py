import asyncio
from core.database import SessionLocal
from routers.voice import process_text_order

async def main():
    db = SessionLocal()
    payload = {"text": "one butter chicken"}
    try:
        res = await process_text_order(payload, db)
        print(res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(main())
