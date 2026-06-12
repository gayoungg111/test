import sys
from pathlib import Path

from mangum import Mangum

BACKEND_ROOT = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(BACKEND_ROOT))

from app.main import app  # noqa: E402

handler = Mangum(app, lifespan="off")
