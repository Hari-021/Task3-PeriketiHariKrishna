from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from .database import engine, Base, get_db, DATABASE_TYPE
from . import crud, schemas, models

# Create the SQLite tables
if DATABASE_TYPE == "sqlite":
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Restaurant Order Management System API",
    description="Backend API for managing restaurant menu items and customer orders.",
    version="1.0.0"
)

# Configure CORS so the React frontend can make API requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "online", "message": "Restaurant Order Management System API"}


# --- Menu Management APIs ---

@app.post("/menu", response_model=schemas.Menu, status_code=status.HTTP_201_CREATED)
def create_menu_item(menu_item: schemas.MenuCreate, db = Depends(get_db)):
    return crud.create_menu_item(db=db, menu_item=menu_item)

@app.get("/menu", response_model=List[schemas.Menu])
def read_all_menu_items(db = Depends(get_db)):
    return crud.get_menu_items(db=db)

@app.get("/menu/{id}", response_model=schemas.Menu)
def read_one_menu_item(id: str, db = Depends(get_db)):
    db_menu_item = crud.get_menu_item(db=db, menu_id=id)
    if not db_menu_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {id} not found."
        )
    return db_menu_item

@app.put("/menu/{id}", response_model=schemas.Menu)
def update_menu_item(id: str, menu_item: schemas.MenuUpdate, db = Depends(get_db)):
    db_menu = crud.update_menu_item(db=db, menu_id=id, menu_item=menu_item)
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {id} not found."
        )
    return db_menu

@app.delete("/menu/{id}", response_model=schemas.Menu)
def delete_menu_item(id: str, db = Depends(get_db)):
    db_menu = crud.get_menu_item(db=db, menu_id=id)
    if not db_menu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Menu item with ID {id} not found."
        )
    menu_schema = schemas.Menu.model_validate(db_menu)
    crud.delete_menu_item(db=db, menu_id=id)
    return menu_schema


# --- Order Management APIs ---

@app.post("/orders", response_model=schemas.Order, status_code=status.HTTP_201_CREATED)
def create_order(order: schemas.OrderCreate, db = Depends(get_db)):
    return crud.create_order(db=db, order=order)

@app.get("/orders", response_model=List[schemas.Order])
def read_all_orders(db = Depends(get_db)):
    return crud.get_orders(db=db)

@app.get("/orders/{id}", response_model=schemas.Order)
def read_one_order(id: str, db = Depends(get_db)):
    db_order = crud.get_order(db=db, order_id=id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {id} not found."
        )
    return db_order

@app.put("/orders/{id}", response_model=schemas.Order)
def update_order_status(id: str, status_update: schemas.OrderStatusUpdate, db = Depends(get_db)):
    db_order = crud.update_order_status(db=db, order_id=id, status=status_update.status)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {id} not found."
        )
    return db_order

@app.delete("/orders/{id}", response_model=schemas.Order)
def delete_order(id: str, db = Depends(get_db)):
    db_order = crud.get_order(db=db, order_id=id)
    if not db_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order with ID {id} not found."
        )
    order_schema = schemas.Order.model_validate(db_order)
    crud.delete_order(db=db, order_id=id)
    return order_schema

