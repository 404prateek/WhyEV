import asyncio
import asyncpg
import json

async def check():
    conn = await asyncpg.connect("postgresql://postgres:ahkOeuYwJ8uTzPbI@db.yvoqtdsfqgijqirwronl.supabase.co:5432/postgres")
    rows = await conn.fetch("SELECT id, make, model, category, price, range_km, is_empanelled, specs FROM vehicles_master ORDER BY category, make, model;")
    print(f"Total vehicles in DB: {len(rows)}\n")
    for r in rows:
        specs_str = r['specs']
        specs = json.loads(specs_str) if isinstance(specs_str, str) else (specs_str or {})
        print(f"[{r['category']}] {r['make']} {r['model']} - Price: Rs.{r['price']} | Range: {r['range_km']}km | Specs: {specs}")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(check())
