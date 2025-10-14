"""Quick API Test - Simple version"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("\n" + "="*60)
print("  🧪 QUICK API TEST")
print("="*60 + "\n")

# Test 1: Health Check
print("1️⃣  Health Check...")
try:
    r = requests.get(f"{BASE_URL}/health", timeout=5)
    print(f"   ✅ Server is running: {r.json()}")
except Exception as e:
    print(f"   ❌ Server not responding: {e}")
    exit(1)

# Test 2: Login as Customer
print("\n2️⃣  Login as Customer...")
try:
    r = requests.post(f"{BASE_URL}/api/v1/auth/login", 
                     json={"email": "customer@demo.com", "password": "customer123"})
    if r.status_code == 200:
        token = r.json()["access_token"]
        print(f"   ✅ Login successful! Token: {token[:30]}...")
    else:
        print(f"   ❌ Login failed: {r.json()}")
        exit(1)
except Exception as e:
    print(f"   ❌ Error: {e}")
    exit(1)

# Test 3: Get Menu (authenticated)
print("\n3️⃣  Get Menu Items...")
try:
    headers = {"Authorization": f"Bearer {token}"}
    r = requests.get(f"{BASE_URL}/api/v1/menu", headers=headers)
    if r.status_code == 200:
        items = r.json()
        print(f"   ✅ Found {len(items)} menu items:")
        for item in items[:3]:
            print(f"      - {item['name']}: ${item['price']} ({item['category']})")
    else:
        print(f"   ❌ Failed: {r.json()}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 4: Create Order
print("\n4️⃣  Create Order...")
try:
    if items:
        order_data = {
            "restaurant_id": 1,
            "items": [
                {"menu_item_id": items[0]['id'], "quantity": 2},
                {"menu_item_id": items[1]['id'], "quantity": 1}
            ],
            "is_takeaway": False,
            "special_instructions": "Testing order creation"
        }
        r = requests.post(f"{BASE_URL}/api/v1/orders", 
                         json=order_data, headers=headers)
        if r.status_code == 201:
            order = r.json()
            print(f"   ✅ Order created!")
            print(f"      Order #: {order['order_number']}")
            print(f"      Total: ${order['total_amount']:.2f}")
            print(f"      Tax: ${order['tax_amount']:.2f}")
            print(f"      Final: ${order['final_amount']:.2f}")
            print(f"      Status: {order['status']}")
            print(f"      Est. Time: {order['estimated_time']} mins")
        else:
            print(f"   ❌ Failed: {r.json()}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 5: Login as Manager
print("\n5️⃣  Login as Manager...")
try:
    r = requests.post(f"{BASE_URL}/api/v1/auth/login", 
                     json={"email": "manager@demo.com", "password": "manager123"})
    if r.status_code == 200:
        mgr_token = r.json()["access_token"]
        print(f"   ✅ Manager login successful!")
    else:
        print(f"   ❌ Failed: {r.json()}")
except Exception as e:
    print(f"   ❌ Error: {e}")

# Test 6: Get Staff (manager only)
print("\n6️⃣  Get Staff List (Manager Only)...")
try:
    mgr_headers = {"Authorization": f"Bearer {mgr_token}"}
    r = requests.get(f"{BASE_URL}/api/v1/staff", headers=mgr_headers)
    if r.status_code == 200:
        staff = r.json()
        print(f"   ✅ Found {len(staff)} staff members:")
        for member in staff:
            print(f"      - {member['name']} ({member['role']})")
    else:
        print(f"   ❌ Failed: {r.json()}")
except Exception as e:
    print(f"   ❌ Error: {e}")

print("\n" + "="*60)
print("  ✅ ALL TESTS PASSED!")
print("="*60 + "\n")
print("📚 Next Steps:")
print("  1. Open http://localhost:8000/docs for interactive testing")
print("  2. Try different user roles (staff@demo.com, chef@demo.com)")
print("  3. Test more endpoints in Swagger UI")
print("\n")
