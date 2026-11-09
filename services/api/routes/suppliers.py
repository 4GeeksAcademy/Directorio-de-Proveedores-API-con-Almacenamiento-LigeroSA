"""Operaciones del directorio; los payloads se validan antes de abrir TinyDB."""

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, HTTPException, Response
from tinydb import Query

from services.api.database import supplier_table
from services.api.models import (
    Country,
    SupplierCategory,
    SupplierCreate,
    SupplierRateUpdate,
    SupplierResponse,
    SupplierStatusUpdate,
)


router = APIRouter(prefix="/suppliers", tags=["suppliers"])


def timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.post("", response_model=SupplierResponse, status_code=201)
def create_supplier(payload: SupplierCreate):
    supplier = payload.model_dump(mode="json") | {"id": uuid4().hex, "updated_at": timestamp()}
    with supplier_table() as table:
        table.insert(supplier)
        total = len(table)
    print(f"Proveedor agregado: {supplier['name']}. Total en la base: {total}.", flush=True)
    return supplier


@router.get("", response_model=list[SupplierResponse])
def list_suppliers(country: Country | None = None, category: SupplierCategory | None = None):
    with supplier_table() as table:
        return [
            supplier for supplier in table.all()
            if (country is None or supplier["country"] == country.value)
            and (category is None or supplier["category"] == category.value)
        ]


@router.get("/{supplier_id}", response_model=SupplierResponse)
def get_supplier(supplier_id: str):
    with supplier_table() as table:
        supplier = table.get(Query().id == supplier_id)
        if supplier is None:
            raise HTTPException(404, "Proveedor no encontrado.")
        return supplier


def update_supplier(supplier_id: str, changes: dict):
    with supplier_table() as table:
        supplier = table.get(Query().id == supplier_id)
        if supplier is None:
            raise HTTPException(404, "Proveedor no encontrado.")
        updated = dict(supplier) | changes | {"updated_at": timestamp()}
        table.update(updated, doc_ids=[supplier.doc_id])
        return updated


@router.patch("/{supplier_id}/rate", response_model=SupplierResponse)
def update_rate(supplier_id: str, payload: SupplierRateUpdate):
    return update_supplier(supplier_id, payload.model_dump(mode="json"))


@router.patch("/{supplier_id}/status", response_model=SupplierResponse)
def update_status(supplier_id: str, payload: SupplierStatusUpdate):
    return update_supplier(supplier_id, payload.model_dump(mode="json"))


@router.delete("/{supplier_id}", status_code=204)
def delete_supplier(supplier_id: str):
    with supplier_table() as table:
        removed = table.remove(Query().id == supplier_id)
        if not removed:
            raise HTTPException(404, "Proveedor no encontrado.")
    return Response(status_code=204)