import asyncio
from httpx import AsyncClient
from app.main import app

async def print_cards():
    async with AsyncClient(app=app, base_url="http://test/api/v1") as client:
        r = await client.get("/vehicles?empanelled=true")
        data = r.json()
        print("=== FIRST 5 MARKETPLACE CARDS FROM BACKEND ===")
        for i, v in enumerate(data[:5], 1):
            print(f"Card {i}:")
            print(f"  id: {v.get('id')}")
            print(f"  slug: {v.get('make', '').lower().replace(' ', '-')}-{v.get('model', '').lower().replace(' ', '-')}")
            print(f"  make: {v.get('make')}")
            print(f"  model: {v.get('model')}")
            print(f"  price: ₹{v.get('price')}")
            print(f"  specs: {v.get('specs')}\n")

if __name__ == "__main__":
    asyncio.run(print_cards())
