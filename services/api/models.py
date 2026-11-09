"""Contratos del directorio de proveedores de HealthCore."""

from datetime import datetime
from enum import Enum
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field


class Country(str, Enum):
    US = "US"
    UK = "UK"


class SupplierCategory(str, Enum):
    health_tech_software = "health_tech_software"
    revenue_billing_services = "revenue_billing_services"
    medical_supplies = "medical_supplies"
    recruitment_hr = "recruitment_hr"
    compliance_legal = "compliance_legal"
    general_operations = "general_operations"


class SupplierStatus(str, Enum):
    activo = "activo"
    suspendido = "suspendido"


PositiveRate = Annotated[float, Field(strict=True, gt=0, allow_inf_nan=False)]


class SupplierBase(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=200)
    country: Country
    category: SupplierCategory
    rate: PositiveRate
    status: SupplierStatus = SupplierStatus.activo


class SupplierCreate(SupplierBase):
    pass


class SupplierRateUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    rate: PositiveRate


class SupplierStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: SupplierStatus


class SupplierResponse(SupplierBase):
    id: str
    updated_at: datetime