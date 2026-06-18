import sys
import unittest
from fastapi.testclient import TestClient

# Add current directory to path
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

client = TestClient(app)

class TestRestaurantPOS(unittest.TestCase):
    menu_id = None
    order_id = None

    def test_01_create_menu_item(self):
        payload = {
            "name": "Truffle Burger",
            "description": "Premium wagyu beef patty with truffle aioli",
            "price": 18.50,
            "category": "Mains",
            "available": True
        }
        res = client.post("/menu", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["name"], "Truffle Burger")
        self.assertEqual(data["price"], 18.50)
        self.assertIn("id", data)
        self.assertIn("created_at", data)
        TestRestaurantPOS.menu_id = data["id"]

    def test_02_validation_menu_item(self):
        # Empty name validation check
        payload = {
            "name": "   ",
            "description": "Empty name",
            "price": 10.0,
            "category": "Mains",
            "available": True
        }
        res = client.post("/menu", json=payload)
        self.assertEqual(res.status_code, 422)

        # Price <= 0 check
        payload = {
            "name": "Truffle Fries",
            "description": "Fries with truffle oil",
            "price": 0.0,
            "category": "Starters",
            "available": True
        }
        res = client.post("/menu", json=payload)
        self.assertEqual(res.status_code, 422)

    def test_03_read_menu_items(self):
        res = client.get("/menu")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(len(data), 0)

    def test_04_create_order(self):
        payload = {
            "customer_name": "Bob",
            "table_number": 4,
            "items": [
                {
                    "menu_id": TestRestaurantPOS.menu_id,
                    "quantity": 2
                }
            ]
        }
        res = client.post("/orders", json=payload)
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["customer_name"], "Bob")
        self.assertEqual(data["table_number"], 4)
        self.assertEqual(data["total_amount"], 37.0)  # 18.50 * 2
        self.assertEqual(data["status"], "Pending")
        TestRestaurantPOS.order_id = data["id"]

    def test_05_validation_order(self):
        # Empty customer name
        payload = {
            "customer_name": " ",
            "table_number": 4,
            "items": [{"menu_id": TestRestaurantPOS.menu_id, "quantity": 1}]
        }
        res = client.post("/orders", json=payload)
        self.assertEqual(res.status_code, 422)

        # Negative table number
        payload = {
            "customer_name": "Bob",
            "table_number": -1,
            "items": [{"menu_id": TestRestaurantPOS.menu_id, "quantity": 1}]
        }
        res = client.post("/orders", json=payload)
        self.assertEqual(res.status_code, 422)

        # Invalid quantity (must be >= 1)
        payload = {
            "customer_name": "Bob",
            "table_number": 4,
            "items": [{"menu_id": TestRestaurantPOS.menu_id, "quantity": 0}]
        }
        res = client.post("/orders", json=payload)
        self.assertEqual(res.status_code, 422)

    def test_06_update_order_status(self):
        # Valid status update
        res = client.put(f"/orders/{TestRestaurantPOS.order_id}", json={"status": "Served"})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["status"], "Served")

        # Invalid status update validation check
        res = client.put(f"/orders/{TestRestaurantPOS.order_id}", json={"status": "Delivered"})
        self.assertEqual(res.status_code, 422)

    def test_07_delete_order(self):
        # Delete the order
        res = client.delete(f"/orders/{TestRestaurantPOS.order_id}")
        self.assertEqual(res.status_code, 200)

        # Verify not found
        res = client.get(f"/orders/{TestRestaurantPOS.order_id}")
        self.assertEqual(res.status_code, 404)

if __name__ == '__main__':
    unittest.main()
