import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from .database import Base

class Menu(Base):
    __tablename__ = "menu"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship to order items
    order_items = relationship("OrderItem", back_populates="menu_item", cascade="all, delete-orphan")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String, nullable=False)
    table_number = Column(Integer, nullable=False)
    total_amount = Column(Float, default=0.0)
    status = Column(String, default="Pending")  # Pending, Preparing, Served, Completed, Cancelled
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationship to order items (cascade delete order items if order is deleted)
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    menu_id = Column(Integer, ForeignKey("menu.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    subtotal = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    menu_item = relationship("Menu", back_populates="order_items")
