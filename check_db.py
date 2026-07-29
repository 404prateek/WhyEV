import asyncio
import asyncpg

async def check():
    conn = await asyncpg.connect(
        "postgresql://postgres:ahkOeuYwJ8uTzPbI@db.yvoqtdsfqgijqirwronl.supabase.co:5432/postgres"
    )
    tables = await conn.fetch(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"
    )
    print("Tables in Supabase:")
    if tables:
        for t in tables:
            print(" -", t["tablename"])
    else:
        print("  (none — migrations did not run yet)")

    # Also check alembic_version
    try:
        ver = await conn.fetchval("SELECT version_num FROM alembic_version LIMIT 1;")
        print(f"\nAlembic version: {ver}")
    except Exception:
        print("\nNo alembic_version table found.")

    await conn.close()

asyncio.run(check())
