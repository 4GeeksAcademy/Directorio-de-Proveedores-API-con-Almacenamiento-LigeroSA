"""TinyDB local: una instancia por operacion y un unico proceso escritor."""

import os
from contextlib import contextmanager
from pathlib import Path
from threading import RLock

from tinydb import TinyDB


DEFAULT_DATABASE_PATH = Path(__file__).resolve().parents[2] / "data" / "suppliers.json"
DATABASE_LOCK = RLock()


@contextmanager
def supplier_table():
    """Serializa lecturas/escrituras y cierra el fichero aun si hay errores."""
    with DATABASE_LOCK:
        path = Path(os.environ.get("HEALTHCORE_DB_PATH", str(DEFAULT_DATABASE_PATH)))
        path.parent.mkdir(parents=True, exist_ok=True)
        with TinyDB(path, encoding="utf-8", ensure_ascii=False) as database:
            yield database.table("suppliers")