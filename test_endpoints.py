import asyncio
import httpx

async def test():
    async with httpx.AsyncClient(base_url="http://localhost:8000/api/v1", timeout=10.0) as client:
        # Test 1: GET /vehicles
        r1 = await client.get("/vehicles?empanelled=true&limit=10")
        print("GET /api/v1/vehicles status:", r1.status_code)
        if r1.status_code == 200:
            vehicles = r1.json()
            print(f"  Count returned: {len(vehicles)}")
            if len(vehicles) > 0:
                print(f"  Sample vehicle: {vehicles[0].get('make')} {vehicles[0].get('model')} - ₹{vehicles[0].get('price')}")
        else:
            print("  Error:", r1.text)

        # Test 2: POST /subsidy/calculate
        payload = {
            "category": "4W",
            "price": 1449000,
            "battery": 45,
            "scrapping": "yes",
            "city": "Delhi",
            "reg_year": 2026
        }
        r2 = await client.post("/subsidy/calculate", json=payload)
        print("\nPOST /api/v1/subsidy/calculate status:", r2.status_code)
        if r2.status_code == 200:
            print("  Calculation:", r2.json())
        else:
            print("  Error:", r2.text)

if __name__ == "__main__":
    asyncio.run(test())
