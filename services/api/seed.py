"""Datos de demostracion: las tarifas no representan acuerdos comerciales reales."""

from uuid import uuid4

from services.api.database import supplier_table
from services.api.models import SupplierCreate
from services.api.routes.suppliers import timestamp


SUPPLIERS = [
    ("Epic Systems", "US", "health_tech_software", 185),
    ("EMIS Health UK", "UK", "health_tech_software", 135),
    ("Change Healthcare", "US", "revenue_billing_services", 120),
    ("Medline Industries", "US", "medical_supplies", 85),
    ("BioMedical Recruitment UK", "UK", "recruitment_hr", 95),
    ("Dataguard", "UK", "compliance_legal", 160),
    ("ISS Facility Services UK", "UK", "general_operations", 55),
]


def seed() -> int:
    with supplier_table() as table:
        existing = {record["name"] for record in table.all()}
        records = [
            SupplierCreate(name=name, country=country, category=category, rate=rate).model_dump(mode="json")
            | {"id": uuid4().hex, "updated_at": timestamp()}
            for name, country, category, rate in SUPPLIERS
            if name not in existing
        ]
        if records:
            table.insert_multiple(records)
        return len(records)


def main() -> None:
    seed()
    with supplier_table() as table:
        total = len(table)
    print(f"Total de proveedores en la base: {total}.")


if __name__ == "__main__":
    main()