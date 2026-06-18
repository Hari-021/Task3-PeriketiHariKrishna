import sqlite3
import os
import sys

def main():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "restaurant.db")
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return

    print("================ SQLite Interactive Python Shell ================")
    print(f"Connected to database: {os.path.basename(db_path)}")
    print("Type '.tables' to list tables, '.schema <table_name>' for table schema, or '.exit' to quit.")
    print("You can run any standard SQL query (e.g., SELECT * FROM menu;).")
    print("================================================================")

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    while True:
        try:
            query = input("sqlite> ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting...")
            break

        if not query:
            continue

        if query.lower() in ('.exit', '.quit', 'exit', 'quit'):
            break

        # Helper: .tables
        if query.lower() == '.tables':
            try:
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = cursor.fetchall()
                if tables:
                    print("Tables:")
                    for table in tables:
                        print(f"  - {table[0]}")
                else:
                    print("No tables found.")
            except Exception as e:
                print(f"Error listing tables: {e}")
            continue

        # Helper: .schema
        if query.lower().startswith('.schema'):
            parts = query.split()
            if len(parts) < 2:
                # Show all schemas
                sql_cmd = "SELECT name, sql FROM sqlite_master WHERE type='table';"
            else:
                table_name = parts[1]
                sql_cmd = f"SELECT name, sql FROM sqlite_master WHERE type='table' AND name='{table_name}';"
            
            try:
                cursor.execute(sql_cmd)
                schemas = cursor.fetchall()
                if schemas:
                    for name, sql in schemas:
                        print(f"\n--- Schema for Table: {name} ---")
                        print(sql)
                else:
                    print(f"No schema found/table does not exist.")
            except Exception as e:
                print(f"Error viewing schema: {e}")
            continue

        # Regular SQL queries
        # SQLite queries usually end with a semicolon, but Python's sqlite3 does not strictly require it.
        # However, let's execute the query.
        try:
            cursor.execute(query)
            # If it is a SELECT query or PRAGMA, print rows
            if cursor.description:
                columns = [col[0] for col in cursor.description]
                rows = cursor.fetchall()
                if not rows:
                    print("No rows returned.")
                    continue
                
                # Calculate column widths
                widths = [len(col) for col in columns]
                for row in rows:
                    for idx, val in enumerate(row):
                        widths[idx] = max(widths[idx], len(str(val if val is not None else "NULL")))
                
                # Print header
                header = " | ".join(col.ljust(widths[idx]) for idx, col in enumerate(columns))
                print(header)
                print("-" * len(header))
                
                # Print rows
                for row in rows:
                    row_str = " | ".join(str(val if val is not None else "NULL").ljust(widths[idx]) for idx, val in enumerate(row))
                    print(row_str)
                print(f"({len(rows)} rows returned)")
            else:
                conn.commit()
                print(f"Statement executed successfully. Rows affected: {cursor.rowcount}")
        except Exception as e:
            print(f"Error: {e}")

    conn.close()

if __name__ == '__main__':
    main()
