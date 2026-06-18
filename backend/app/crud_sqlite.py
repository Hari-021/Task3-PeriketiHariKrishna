from sqlalchemy.orm import Session
from . import models, schemas
from fastapi import HTTPException, status

# --- Menu Items CRUD ---

def get_menu_items(db: Session):
    return db.query(models.Menu).all()

def get_menu_item(db: Session, menu_id: str):
    try:
        int_id = int(menu_id)
    except (ValueError, TypeError):
        return None
    return db.query(models.Menu).filter(models.Menu.id == int_id).first()

def create_menu_item(db: Session, menu_item: schemas.MenuCreate):
    db_menu_item = models.Menu(
        name=menu_item.name,
        description=menu_item.description,
        price=menu_item.price,
        category=menu_item.category,
        available=menu_item.available
    )
    db.add(db_menu_item)
    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item

def update_menu_item(db: Session, menu_id: str, menu_item: schemas.MenuUpdate):
    db_menu_item = get_menu_item(db, menu_id)
    if not db_menu_item:
        return None
    
    update_data = menu_item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_menu_item, key, value)
        
    db.commit()
    db.refresh(db_menu_item)
    return db_menu_item

def delete_menu_item(db: Session, menu_id: str):
    db_menu_item = get_menu_item(db, menu_id)
    if not db_menu_item:
        return None
    db.delete(db_menu_item)
    db.commit()
    return db_menu_item


# --- Orders CRUD ---

def get_orders(db: Session):
    return db.query(models.Order).order_by(models.Order.created_at.desc()).all()

def get_order(db: Session, order_id: str):
    try:
        int_id = int(order_id)
    except (ValueError, TypeError):
        return None
    return db.query(models.Order).filter(models.Order.id == int_id).first()

def create_order(db: Session, order: schemas.OrderCreate):
    # 1. Create the base order
    db_order = models.Order(
        customer_name=order.customer_name,
        table_number=order.table_number,
        status="Pending",
        total_amount=0.0
    )
    db.add(db_order)
    db.flush()  # Generate primary key ID for foreign keys
    
    total_amount = 0.0
    # 2. Add order items and compute subtotals
    for item in order.items:
        menu_item = get_menu_item(db, item.menu_id)
        if not menu_item:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with ID {item.menu_id} not found"
            )
        if not menu_item.available:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item '{menu_item.name}' is currently not available"
            )
        
        subtotal = menu_item.price * item.quantity
        total_amount += subtotal
        
        db_order_item = models.OrderItem(
            order_id=db_order.id,
            menu_id=int(item.menu_id),
            quantity=item.quantity,
            subtotal=subtotal
        )
        db.add(db_order_item)
        
    db_order.total_amount = total_amount
    db.commit()
    db.refresh(db_order)
    return db_order

def update_order_status(db: Session, order_id: str, status_str: str):
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    db_order.status = status_str
    db.commit()
    db.refresh(db_order)
    return db_order

def delete_order(db: Session, order_id: str):
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    db.delete(db_order)
    db.commit()
    return db_order
