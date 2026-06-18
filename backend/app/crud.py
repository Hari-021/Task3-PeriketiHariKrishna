from .database import DATABASE_TYPE
from . import crud_sqlite, crud_mongodb

# --- Menu Items CRUD ---

def get_menu_items(db):
    if DATABASE_TYPE == "mongodb":
        return crud_mongodb.get_menu_items(db)
    return crud_sqlite.get_menu_items(db)

def get_menu_item(db, menu_id: str):
    if DATABASE_TYPE == "mongodb":
        return crud_mongodb.get_menu_item(db, menu_id)
    return crud_sqlite.get_menu_item(db, menu_id)

def create_menu_item(db, menu_item):
    if DATABASE_TYPE == "mongodb":
        return crud_mongodb.create_menu_item(db, menu_item)
    return crud_sqlite.create_menu_item(db, menu_item)

def update_menu_item(db, menu_id: str, menu_item):
    if DATABASE_TYPE == "mongodb":
        return crud_mongodb.update_menu_item(db, menu_id, menu_item)
    return crud_sqlite.update_menu_item(db, menu_id, menu_item)

def delete_menu_item(db, menu_id: str):
    if DATABASE_TYPE == "mongodb":
        return crud_mongodb.delete_menu_item(db, menu_id)
    return crud_sqlite.delete_menu_item(db, menu_id)


# --- Orders CRUD ---

def get_orders(db):
    if DATABASE_TYPE == "mongodb":
        return crud_mongodb.get_orders(db)
    return crud_sqlite.get_orders(db)

def get_order(db, order_id: str):
    if DATABASE_TYPE == "mongodb":
        return crud_mongodb.get_order(db, order_id)
    return crud_sqlite.get_order(db, order_id)

def create_order(db, order):
    if DATABASE_TYPE == "mongodb":
        return crud_mongodb.create_order(db, order)
    return crud_sqlite.create_order(db, order)

def update_order_status(db, order_id: str, status: str):
    if DATABASE_TYPE == "mongodb":
        return crud_mongodb.update_order_status(db, order_id, status)
    return crud_sqlite.update_order_status(db, order_id, status)

def delete_order(db, order_id: str):
    if DATABASE_TYPE == "mongodb":
        return crud_mongodb.delete_order(db, order_id)
    return crud_sqlite.delete_order(db, order_id)

