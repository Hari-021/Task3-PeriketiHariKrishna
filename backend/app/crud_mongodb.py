import datetime
from bson.objectid import ObjectId
from fastapi import HTTPException, status
from . import schemas

def to_db_id(id_val):
    if isinstance(id_val, ObjectId):
        return id_val
    id_str = str(id_val)
    try:
        return ObjectId(id_str)
    except:
        try:
            return int(id_str)
        except ValueError:
            return id_str

def serialize_doc(doc):
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# --- Menu Items CRUD ---

def get_menu_items(db):
    cursor = db.menu.find()
    return [serialize_doc(doc) for doc in cursor]

def get_menu_item(db, menu_id: str):
    doc = db.menu.find_one({"_id": to_db_id(menu_id)})
    return serialize_doc(doc)

def create_menu_item(db, menu_item: schemas.MenuCreate):
    doc = menu_item.model_dump()
    doc["created_at"] = datetime.datetime.utcnow()
    res = db.menu.insert_one(doc)
    doc["id"] = str(res.inserted_id)
    doc.pop("_id", None)
    return doc

def update_menu_item(db, menu_id: str, menu_item: schemas.MenuUpdate):
    update_data = menu_item.model_dump(exclude_unset=True)
    if not update_data:
        return get_menu_item(db, menu_id)
    
    db.menu.update_one({"_id": to_db_id(menu_id)}, {"$set": update_data})
    return get_menu_item(db, menu_id)

def delete_menu_item(db, menu_id: str):
    item = get_menu_item(db, menu_id)
    if not item:
        return None
    db.menu.delete_one({"_id": to_db_id(menu_id)})
    return item


# --- Orders CRUD ---

def get_orders(db):
    cursor = db.orders.find().sort("created_at", -1)
    return [serialize_doc(doc) for doc in cursor]

def get_order(db, order_id: str):
    doc = db.orders.find_one({"_id": to_db_id(order_id)})
    return serialize_doc(doc)

def create_order(db, order: schemas.OrderCreate):
    total_amount = 0.0
    order_items = []
    order_oid = ObjectId()
    
    for item in order.items:
        menu_item = get_menu_item(db, item.menu_id)
        if not menu_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with ID {item.menu_id} not found"
            )
        if not menu_item["available"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Menu item '{menu_item['name']}' is currently not available"
            )
        
        subtotal = menu_item["price"] * item.quantity
        total_amount += subtotal
        
        # Construct embedded OrderItem document
        item_oid = ObjectId()
        db_order_item = {
            "id": str(item_oid),
            "order_id": str(order_oid),
            "menu_id": str(item.menu_id),
            "quantity": item.quantity,
            "subtotal": subtotal,
            "menu_item": menu_item
        }
        order_items.append(db_order_item)
        
    order_doc = {
        "_id": order_oid,
        "customer_name": order.customer_name,
        "table_number": order.table_number,
        "total_amount": total_amount,
        "status": "Pending",
        "created_at": datetime.datetime.utcnow(),
        "items": order_items
    }
    
    db.orders.insert_one(order_doc)
    return serialize_doc(order_doc)

def update_order_status(db, order_id: str, status_str: str):
    db.orders.update_one(
        {"_id": to_db_id(order_id)},
        {"$set": {"status": status_str}}
    )
    return get_order(db, order_id)

def delete_order(db, order_id: str):
    order = get_order(db, order_id)
    if not order:
        return None
    db.orders.delete_one({"_id": to_db_id(order_id)})
    return order
