import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "restaurant.db")
if not os.path.exists(db_path):
    print("Database file does not exist yet.")
    exit()

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("================ SQLite Database Inspector ================")
print("\n[MENU TABLE]")
cursor.execute("SELECT id, name, price, category, available FROM menu")
menu_rows = cursor.fetchall()
if not menu_rows:
    print("No menu items found.")
else:
    for row in menu_rows:
        print(f"ID: {row[0]} | Name: {row[1]} | Price: ${row[2]:.2f} | Category: {row[3]} | Available: {bool(row[4])}")

print("\n[ORDERS TABLE]")
cursor.execute("SELECT id, customer_name, table_number, total_amount, status FROM orders")
order_rows = cursor.fetchall()
if not order_rows:
    print("No orders found.")
else:
    for row in order_rows:
        print(f"ID: {row[0]} | Customer: {row[1]} | Table: {row[2]} | Total: ${row[3]:.2f} | Status: {row[4]}")

print("\n[ORDER ITEMS TABLE]")
cursor.execute("SELECT id, order_id, menu_id, quantity, subtotal FROM order_items")
item_rows = cursor.fetchall()
if not item_rows:
    print("No order items found.")
else:
    for row in item_rows:
        print(f"ID: {row[0]} | Order ID: {row[1]} | Menu ID: {row[2]} | Qty: {row[3]} | Subtotal: ${row[4]:.2f}")

print("==========================================================")
conn.close()
