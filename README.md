# Restaurant Order Management System

A modern, full-stack POS and order management web application designed for restaurants. This application features a responsive React user interface and a robust FastAPI backend. It dynamically supports both **SQLite** and **MongoDB** databases, allowing you to choose the database engine that best fits your environment.

---

## 🚀 Key Features

* **Multi-Database Support**: Dynamically switch between **SQLite** and **MongoDB** via an environment configuration file without code changes.
* **Menu Management Dashboard**: Full CRUD (Create, Read, Update, Delete) capability for menu items (pricing, categorization, and availability).
* **Live Order Tracking**: Manage customer orders, assign tables, calculate subtotals, and update status workflow (`Pending` ➡️ `Preparing` ➡️ `Served` ➡️ `Completed` / `Cancelled`).
* **Validation & Security**: Strong type validation using Pydantic V2 and foreign key constraints on the database layer.

---

## 🛠️ Technology Stack

### Backend API
* **Framework**: FastAPI (Python)
* **Web Server**: Uvicorn
* **ORM / Database Engines**: 
  * SQLAlchemy (for SQL/SQLite engine)
  * PyMongo (for NoSQL/MongoDB engine)
* **Configuration**: Python-dotenv & Pydantic settings

### Frontend Client
* **Framework**: React 19 (Vite)
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **HTTP Client**: Axios

---

## 📁 Project Structure

```text
Restaurant Order Management System/
├── backend/
│   ├── app/
│   │   ├── crud.py          # Database router/dispatcher
│   │   ├── crud_sqlite.py   # SQLite database operations
│   │   ├── crud_mongodb.py  # MongoDB database operations
│   │   ├── database.py      # Multi-db connection configuration
│   │   ├── main.py          # FastAPI application server and routes
│   │   ├── models.py        # SQLite relational schemas
│   │   └── schemas.py       # Pydantic validation schemas
│   ├── .env                 # Active database configuration settings
│   ├── requirements.txt     # Python backend dependencies
│   ├── sql_shell.py         # Custom SQLite terminal utility
│   └── test_backend.py      # Automated backend unit tests
└── frontend/
    ├── src/                 # React source code (components, pages, api.js)
    ├── index.html
    ├── package.json         # Node.js dependencies
    └── tailwind.config.js
```

---

## ⚙️ Setup & Configuration

### 1. Database Configuration
Navigate to the `backend/` folder and configure the connection settings in the **`.env`** file:

```env
# Choose database: 'sqlite' or 'mongodb'
DATABASE_TYPE=mongodb

# MongoDB Settings (only active if DATABASE_TYPE=mongodb)
MONGO_URI=mongodb://localhost:27017
MONGO_DB=restaurant_order_management
```

---

## 🏃 Run the Application Locally

Follow these instructions to run the application in development mode:

### 1. Start the Backend API
In your terminal, navigate to the `backend` folder, install the Python packages, and boot up the server:

```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
*The API will be available at: **`http://localhost:8000`***
*Interactive Swagger docs will be available at: **`http://localhost:8000/docs`***

### 2. Start the Frontend Client
Open a second terminal, navigate to the `frontend` folder, install dependencies, and run the Vite dev server:

```bash
cd frontend
npm install
npm run dev
```
*The user interface will be live at: **`http://localhost:5174`***

---

## 🧪 Running Automated Tests

A suite of unit tests is included in the backend directory. To execute the tests against your currently selected database (SQLite or MongoDB), run:

```bash
cd backend
python -m unittest test_backend.py
```
