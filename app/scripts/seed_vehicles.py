"""Seed vehicles table with data from the frontend mock file."""
import os
import sys
import re
import json
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

# Add the backend dir to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.models.vehicle import VehicleMaster
from app.core.config import settings

def parse_ts_to_json(filepath: str):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract the array block for SEEDED_VEHICLES_MASTER
    match = re.search(r"export const SEEDED_VEHICLES_MASTER.*?=\s*(\[[\s\S]*?\]);", content)
    if not match:
        raise ValueError("Could not find SEEDED_VEHICLES_MASTER in the file.")
    
    array_str = match.group(1)
    
    # We need to make it valid JSON
    # 1. Replace single quotes with double quotes around string values
    # Be careful with escaped quotes or quotes inside strings, we'll use a simpler approach
    # Let's use Python's parser or write a robust converter if needed.
    pass

# Alternatively, I can just write the list directly in this file since it's just 21 cars!
# I will do exactly that to save parsing headaches.

VEHICLES = [
    {
        "id": "tata-tiago-ev",
        "make": "Tata Motors",
        "model": "Tiago EV",
        "variant": "2026 Facelift (19.2 - 24 kWh)",
        "category": "4W",
        "price": 699000,
        "range_km": 285,
        "battery_kwh": 24,
        "is_empanelled": True
    },
    {
        "id": "tata-tigor-ev",
        "make": "Tata Motors",
        "model": "Tigor EV",
        "variant": "XZ+ (26 kWh)",
        "category": "4W",
        "price": 1249000,
        "range_km": 315,
        "battery_kwh": 26,
        "is_empanelled": True
    },
    {
        "id": "tata-punch-ev",
        "make": "Tata Motors",
        "model": "Punch EV",
        "variant": "Empowered+ LR (35 kWh)",
        "category": "4W",
        "price": 969000,
        "range_km": 421,
        "battery_kwh": 35,
        "is_empanelled": True
    },
    {
        "id": "tata-nexon-ev",
        "make": "Tata Motors",
        "model": "Nexon EV",
        "variant": "Empowered+ 45 (45 kWh)",
        "category": "4W",
        "price": 1249000,
        "range_km": 489,
        "battery_kwh": 45,
        "is_empanelled": True
    },
    {
        "id": "tata-curvv-ev",
        "make": "Tata Motors",
        "model": "Curvv EV",
        "variant": "Empowered+ 55 (55 kWh)",
        "category": "4W",
        "price": 1699000,
        "range_km": 502,
        "battery_kwh": 55,
        "is_empanelled": True
    },
    {
        "id": "tata-sierra-ev",
        "make": "Tata Motors",
        "model": "Sierra EV",
        "variant": "AWD Flagship (75 kWh)",
        "category": "4W",
        "price": 1879000,
        "range_km": 665,
        "battery_kwh": 75,
        "is_empanelled": True
    },
    {
        "id": "tata-harrier-ev",
        "make": "Tata Motors",
        "model": "Harrier EV",
        "variant": "Empowered AWD (75 kWh)",
        "category": "4W",
        "price": 2149000,
        "range_km": 627,
        "battery_kwh": 75,
        "is_empanelled": True
    },
    {
        "id": "mahindra-xuv400",
        "make": "Mahindra",
        "model": "XUV400",
        "variant": "EL Pro (39.4 kWh)",
        "category": "4W",
        "price": 1549000,
        "range_km": 456,
        "battery_kwh": 39.4,
        "is_empanelled": True
    },
    {
        "id": "mahindra-xuv-3xo-ev",
        "make": "Mahindra",
        "model": "XUV 3XO EV",
        "variant": "AX7L (39.4 kWh)",
        "category": "4W",
        "price": 1389000,
        "range_km": 456,
        "battery_kwh": 39.4,
        "is_empanelled": True
    },
    {
        "id": "mahindra-be-6",
        "make": "Mahindra",
        "model": "BE 6",
        "variant": "Pack 79 kWh",
        "category": "4W",
        "price": 1890000,
        "range_km": 682,
        "battery_kwh": 79,
        "is_empanelled": True
    },
    {
        "id": "mahindra-xev-9e",
        "make": "Mahindra",
        "model": "XEV 9e",
        "variant": "Cineluxe (79 kWh)",
        "category": "4W",
        "price": 2190000,
        "range_km": 656,
        "battery_kwh": 79,
        "is_empanelled": True
    },
    {
        "id": "mahindra-xev-9s",
        "make": "Mahindra",
        "model": "XEV 9S",
        "variant": "Pack 79 kWh",
        "category": "4W",
        "price": 1995000,
        "range_km": 679,
        "battery_kwh": 79,
        "is_empanelled": True
    },
    {
        "id": "mg-comet-ev",
        "make": "MG Motor",
        "model": "Comet EV",
        "variant": "Exclusive / Blackstorm (17.3 kWh)",
        "category": "4W",
        "price": 780000,
        "range_km": 230,
        "battery_kwh": 17.3,
        "is_empanelled": True
    },
    {
        "id": "mg-windsor-ev",
        "make": "MG Motor",
        "model": "Windsor EV",
        "variant": "Essence Pro (52.9 kWh)",
        "category": "4W",
        "price": 1400000,
        "range_km": 449,
        "battery_kwh": 52.9,
        "is_empanelled": True
    },
    {
        "id": "mg-zs-ev",
        "make": "MG Motor",
        "model": "ZS EV",
        "variant": "Exclusive Plus (50.3 kWh)",
        "category": "4W",
        "price": 1799000,
        "range_km": 461,
        "battery_kwh": 50.3,
        "is_empanelled": True
    },
    {
        "id": "maruti-e-vitara",
        "make": "Maruti Suzuki",
        "model": "e Vitara",
        "variant": "Alpha Dual Tone (61 kWh)",
        "category": "4W",
        "price": 1599000,
        "range_km": 543,
        "battery_kwh": 61,
        "is_empanelled": True
    },
    {
        "id": "hyundai-creta-electric",
        "make": "Hyundai",
        "model": "Creta Electric",
        "variant": "Excellence LR (51.4 kWh)",
        "category": "4W",
        "price": 1802000,
        "range_km": 510,
        "battery_kwh": 51.4,
        "is_empanelled": True
    },
    {
        "id": "kia-syros-ev",
        "make": "Kia",
        "model": "Syros EV",
        "variant": "HTX+ / X-Line (51.4 kWh)",
        "category": "4W",
        "price": 1349000,
        "range_km": 526,
        "battery_kwh": 51.4,
        "is_empanelled": True
    },
    {
        "id": "kia-carens-clavis-ev",
        "make": "Kia",
        "model": "Carens Clavis EV",
        "variant": "X-Line 7-Seater (51.4 kWh)",
        "category": "4W",
        "price": 1799000,
        "range_km": 490,
        "battery_kwh": 51.4,
        "is_empanelled": True
    },
    {
        "id": "byd-atto-3",
        "make": "BYD",
        "model": "Atto 3",
        "variant": "Superior (60.48 kWh)",
        "category": "4W",
        "price": 2499000,
        "range_km": 521,
        "battery_kwh": 60.48,
        "is_empanelled": True
    },
    {
        "id": "byd-emax-7",
        "make": "BYD",
        "model": "eMax 7",
        "variant": "Comfort 7-Seater (71.8 kWh)",
        "category": "4W",
        "price": 2690000,
        "range_km": 530,
        "battery_kwh": 71.8,
        "is_empanelled": True
    },
    {
        "id": "vinfast-vf6",
        "make": "VinFast",
        "model": "VF6",
        "variant": "Plus (59.6 kWh)",
        "category": "4W",
        "price": 1819000,
        "range_km": 468,
        "battery_kwh": 59.6,
        "is_empanelled": True
    },
    {
        "id": "vinfast-vf7",
        "make": "VinFast",
        "model": "VF7",
        "variant": "Plus AWD (75.3 kWh)",
        "category": "4W",
        "price": 2299000,
        "range_km": 532,
        "battery_kwh": 75.3,
        "is_empanelled": True
    },
    {
        "id": "citroen-ec3x",
        "make": "Citroën",
        "model": "ë-C3 / eC3X",
        "variant": "Shine 2026 (29.2 kWh)",
        "category": "4W",
        "price": 1199000,
        "range_km": 325,
        "battery_kwh": 29.2,
        "is_empanelled": True
    }
]

async def seed():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        print("Starting seed process...")
        for v in VEHICLES:
            vehicle = VehicleMaster(
                make=v["make"],
                model=v["model"],
                category=v["category"],
                price=v["price"],
                range_km=v["range_km"],
                is_empanelled=v["is_empanelled"],
                specs={"variant": v["variant"], "battery_kwh": v["battery_kwh"]}
            )
            db.add(vehicle)
        
        await db.commit()
        print(f"Successfully inserted {len(VEHICLES)} vehicles into the database.")

        print("Seeding Subsidy Rules...")
        import app.models.user # to load users table
        from app.models.subsidy import SubsidyRule
        from datetime import date
        rules = [
            SubsidyRule(category="2W", year_tier=1, amount=30000, price_ceiling=225000, status="live", effective_from=date(2026, 7, 1)),
            SubsidyRule(category="2W", year_tier=2, amount=20000, price_ceiling=225000, status="live", effective_from=date(2027, 7, 1)),
            SubsidyRule(category="2W", year_tier=3, amount=10000, price_ceiling=225000, status="live", effective_from=date(2028, 7, 1)),
            SubsidyRule(category="3W", year_tier=1, amount=50000, price_ceiling=500000, status="live", effective_from=date(2026, 7, 1)),
            SubsidyRule(category="4W", year_tier=1, amount=0, price_ceiling=3000000, status="live", effective_from=date(2026, 7, 1)),
            SubsidyRule(category="N1_goods", year_tier=1, amount=100000, price_ceiling=2000000, status="live", effective_from=date(2026, 7, 1)),
        ]
        db.add_all(rules)
        await db.commit()
        print(f"Successfully inserted {len(rules)} subsidy rules.")

if __name__ == "__main__":
    asyncio.run(seed())
