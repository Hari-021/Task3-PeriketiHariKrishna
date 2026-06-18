from pydantic import BaseModel, Field, field_validator, BeforeValidator
from typing import List, Optional, Annotated
import datetime

CoercedStr = Annotated[str, BeforeValidator(lambda v: str(v) if v is not None else v)]

# --- Menu Schemas ---
class MenuBase(BaseModel):
    name: str = Field(..., min_length=1, description="Menu item name cannot be empty")
    description: Optional[str] = None
    price: float = Field(..., gt=0, description="Price must be greater than 0")
    category: str = Field(..., min_length=1, description="Category cannot be empty")
    available: bool = True

    @field_validator('name', 'category')
    @classmethod
    def check_not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Value cannot be empty or whitespace only")
        return v.strip()

class MenuCreate(MenuBase):
    pass

class MenuUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    category: Optional[str] = Field(None, min_length=1)
    available: Optional[bool] = None

    @field_validator('name', 'category')
    @classmethod
    def check_not_empty_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Value cannot be empty or whitespace only")
            return v.strip()
        return v

class Menu(MenuBase):
    id: CoercedStr
    created_at: datetime.datetime

    class Config:
        from_attributes = True


# --- Order Item Schemas ---
class OrderItemBase(BaseModel):
    menu_id: CoercedStr
    quantity: int = Field(..., ge=1, description="Quantity must be at least 1")

class OrderItemCreate(OrderItemBase):
    pass

class OrderItem(OrderItemBase):
    id: CoercedStr
    order_id: CoercedStr
    subtotal: float
    menu_item: Menu  # Nested menu item details for ease of frontend display

    class Config:
        from_attributes = True


# --- Order Schemas ---
class OrderBase(BaseModel):
    customer_name: str = Field(..., min_length=1, description="Customer name is required")
    table_number: int = Field(..., gt=0, description="Table number must be positive")

    @field_validator('customer_name')
    @classmethod
    def check_customer_name(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Customer name cannot be empty or whitespace only")
        return v.strip()

class OrderCreate(OrderBase):
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Order must contain at least one item")

class OrderStatusUpdate(BaseModel):
    status: str

    @field_validator('status')
    @classmethod
    def check_status(cls, v: str) -> str:
        valid_statuses = {"Pending", "Preparing", "Served", "Completed", "Cancelled"}
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v

class OrderUpdate(BaseModel):
    customer_name: Optional[str] = Field(None, min_length=1)
    table_number: Optional[int] = Field(None, gt=0)
    status: Optional[str] = None
    items: Optional[List[OrderItemCreate]] = None

    @field_validator('customer_name')
    @classmethod
    def check_customer_name_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Customer name cannot be empty or whitespace only")
            return v.strip()
        return v

    @field_validator('status')
    @classmethod
    def check_status_opt(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            valid_statuses = {"Pending", "Preparing", "Served", "Completed", "Cancelled"}
            if v not in valid_statuses:
                raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v

class Order(OrderBase):
    id: CoercedStr
    total_amount: float
    status: str
    created_at: datetime.datetime
    items: List[OrderItem]

    class Config:
        from_attributes = True
