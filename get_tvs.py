import asyncio
import asyncpg
import json

async def check_tvs():
    conn = await asyncpg.connect("postgresql://postgres:ahkOeuYwJ8uTzPbI@db.yvoqtdsfqgijqirwronl.supabase.co:5432/postgres")
    rows = await conn.fetch("SELECT id, make, model, category, price, range_km, is_empanelled, specs FROM vehicles_master WHERE LOWER(make) LIKE '%tvs%' OR LOWER(model) LIKE '%iqube%';")
    for r in rows:
        d = dict(r)
        d['id'] = str(d['id'])
        d['specs'] = json.loads(d['specs']) if isinstance(d['specs'], str) else d['specs']
        print("Backend DB Object for TVS iQube:")
        print(json.dumps(d, indent=2))
    await conn.close()

if __name__ == "__main__":
    asyncio.run(check_tvs())
