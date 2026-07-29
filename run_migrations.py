"""Apply existing alembic migrations to Supabase."""
import os
os.chdir(os.path.dirname(os.path.abspath(__file__)))

from alembic.config import Config
from alembic import command

cfg = Config("alembic.ini")
cfg.set_main_option("script_location", "app/migrations")

print("Applying migrations to Supabase...")
command.upgrade(cfg, "head")
print("Done!")
