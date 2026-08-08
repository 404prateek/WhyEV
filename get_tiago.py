import asyncio
import asyncpg
import json

async def check_tiago():
    conn = await asyncpg.connect("postgresql://postgres:ahkOeuYwJ8uTzPbI@db.yvoqtdsfqgijqirwronl.supabase.co:5432/postgres")
    rows = await conn.fetch("SELECT id, make, model, category, price, range_km, is_empanelled, specs FROM vehicles_master WHERE LOWER(model) LIKE '%tiago%';")
    for r in rows:
        d = dict(r)
        d['id'] = str(d['id'])
        d['specs'] = json.loads(d['specs']) if isinstance(d['specs'], str) else d['specs']
        print("Backend DB Object for Tata Tiago EV:")
        print(json.dumps(d, indent=2))
    await conn.close()

if __name__ == "__main__":
    asyncio.run(check_tiago())
