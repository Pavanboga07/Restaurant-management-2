"""
Backend API Testing Script
Automated tests for all major endpoints
"""
import requests
import json
from datetime import datetime

# Base URL
BASE_URL = "http://localhost:8000"

# Colors for output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_test(name, status, details=""):
    """Print test result"""
    symbol = "✓" if status else "✗"
    color = Colors.GREEN if status else Colors.RED
    print(f"{color}{symbol} {name}{Colors.RESET}")
    if details:
        print(f"  {Colors.YELLOW}{details}{Colors.RESET}")

def print_header(text):
    """Print section header"""
    print(f"\n{Colors.BLUE}{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}{Colors.RESET}\n")

# Global variable to store tokens
tokens = {}

def test_health_check():
    """Test health check endpoint"""
    print_header("1. Testing Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        success = response.status_code == 200
        print_test("Health Check", success, f"Status: {response.status_code}")
        if success:
            print(f"  Response: {response.json()}")
        return success
    except Exception as e:
        print_test("Health Check", False, f"Error: {str(e)}")
        return False

def test_register():
    """Test user registration"""
    print_header("2. Testing User Registration")
    try:
        data = {
            "email": f"test_{datetime.now().timestamp()}@example.com",
            "password": "testpass123",
            "name": "Test User",
            "phone": f"+1555{int(datetime.now().timestamp()) % 10000}",
            "role": "customer",
            "restaurant_id": 1
        }
        response = requests.post(f"{BASE_URL}/api/v1/auth/register", json=data)
        success = response.status_code == 201
        print_test("User Registration", success, f"Status: {response.status_code}")
        if success:
            user = response.json()
            print(f"  Created user: {user['name']} ({user['email']})")
        else:
            print(f"  Error: {response.json()}")
        return success
    except Exception as e:
        print_test("User Registration", False, f"Error: {str(e)}")
        return False

def test_login(email, password, role_name):
    """Test user login"""
    print_header(f"3. Testing Login - {role_name}")
    try:
        data = {
            "email": email,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/api/v1/auth/login", json=data)
        success = response.status_code == 200
        print_test(f"Login as {role_name}", success, f"Status: {response.status_code}")
        
        if success:
            result = response.json()
            tokens[role_name] = result['access_token']
            print(f"  Token received: {result['access_token'][:50]}...")
            print(f"  Token type: {result['token_type']}")
        else:
            print(f"  Error: {response.json()}")
        return success
    except Exception as e:
        print_test(f"Login as {role_name}", False, f"Error: {str(e)}")
        return False

def test_get_current_user(role_name):
    """Test getting current user info"""
    print_header(f"4. Testing Get Current User - {role_name}")
    try:
        headers = {"Authorization": f"Bearer {tokens[role_name]}"}
        response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
        success = response.status_code == 200
        print_test(f"Get Current User ({role_name})", success, f"Status: {response.status_code}")
        
        if success:
            user = response.json()
            print(f"  User: {user['name']}")
            print(f"  Email: {user['email']}")
            print(f"  Role: {user['role']}")
            print(f"  Restaurant ID: {user['restaurant_id']}")
        return success
    except Exception as e:
        print_test(f"Get Current User ({role_name})", False, f"Error: {str(e)}")
        return False

def test_get_menu(role_name):
    """Test getting menu items"""
    print_header(f"5. Testing Get Menu - {role_name}")
    try:
        headers = {"Authorization": f"Bearer {tokens[role_name]}"}
        response = requests.get(f"{BASE_URL}/api/v1/menu", headers=headers)
        success = response.status_code == 200
        print_test(f"Get Menu ({role_name})", success, f"Status: {response.status_code}")
        
        if success:
            menu_items = response.json()
            print(f"  Found {len(menu_items)} menu items:")
            for item in menu_items[:3]:  # Show first 3 items
                print(f"    - {item['name']}: ${item['price']} ({item['category']})")
        return success, menu_items if success else []
    except Exception as e:
        print_test(f"Get Menu ({role_name})", False, f"Error: {str(e)}")
        return False, []

def test_get_categories(role_name):
    """Test getting menu categories"""
    print_header(f"6. Testing Get Categories - {role_name}")
    try:
        headers = {"Authorization": f"Bearer {tokens[role_name]}"}
        response = requests.get(f"{BASE_URL}/api/v1/menu/categories/list", headers=headers)
        success = response.status_code == 200
        print_test(f"Get Categories ({role_name})", success, f"Status: {response.status_code}")
        
        if success:
            categories = response.json()
            print(f"  Categories: {', '.join(categories)}")
        return success
    except Exception as e:
        print_test(f"Get Categories ({role_name})", False, f"Error: {str(e)}")
        return False

def test_create_order(role_name, menu_items):
    """Test creating an order"""
    print_header(f"7. Testing Create Order - {role_name}")
    try:
        if not menu_items:
            print_test("Create Order", False, "No menu items available")
            return False, None
        
        headers = {"Authorization": f"Bearer {tokens[role_name]}"}
        data = {
            "restaurant_id": 1,
            "items": [
                {"menu_item_id": menu_items[0]['id'], "quantity": 2},
                {"menu_item_id": menu_items[1]['id'], "quantity": 1}
            ],
            "is_takeaway": False,
            "special_instructions": "Test order from API testing script"
        }
        response = requests.post(f"{BASE_URL}/api/v1/orders", json=data, headers=headers)
        success = response.status_code == 201
        print_test(f"Create Order ({role_name})", success, f"Status: {response.status_code}")
        
        if success:
            order = response.json()
            print(f"  Order Number: {order['order_number']}")
            print(f"  Status: {order['status']}")
            print(f"  Total: ${order['total_amount']:.2f}")
            print(f"  Tax: ${order['tax_amount']:.2f}")
            print(f"  Final Amount: ${order['final_amount']:.2f}")
            print(f"  Estimated Time: {order['estimated_time']} mins")
            return success, order
        else:
            print(f"  Error: {response.json()}")
        return success, None
    except Exception as e:
        print_test(f"Create Order ({role_name})", False, f"Error: {str(e)}")
        return False, None

def test_get_orders(role_name):
    """Test getting orders"""
    print_header(f"8. Testing Get Orders - {role_name}")
    try:
        headers = {"Authorization": f"Bearer {tokens[role_name]}"}
        response = requests.get(f"{BASE_URL}/api/v1/orders", headers=headers)
        success = response.status_code == 200
        print_test(f"Get Orders ({role_name})", success, f"Status: {response.status_code}")
        
        if success:
            orders = response.json()
            print(f"  Found {len(orders)} orders")
            for order in orders[:2]:  # Show first 2 orders
                print(f"    - {order['order_number']}: ${order['final_amount']:.2f} ({order['status']})")
        return success
    except Exception as e:
        print_test(f"Get Orders ({role_name})", False, f"Error: {str(e)}")
        return False

def test_create_menu_item(role_name):
    """Test creating a menu item (Manager only)"""
    print_header(f"9. Testing Create Menu Item - {role_name}")
    try:
        headers = {"Authorization": f"Bearer {tokens[role_name]}"}
        data = {
            "restaurant_id": 1,
            "name": "Test Burger",
            "description": "A delicious test burger created by API test",
            "category": "Burgers",
            "price": 9.99,
            "is_vegetarian": False,
            "spice_level": 2,
            "prep_time_minutes": 15,
            "calories": 650,
            "tags": ["test", "api"],
            "allergens": ["gluten"]
        }
        response = requests.post(f"{BASE_URL}/api/v1/menu", json=data, headers=headers)
        success = response.status_code == 201
        print_test(f"Create Menu Item ({role_name})", success, f"Status: {response.status_code}")
        
        if success:
            item = response.json()
            print(f"  Created: {item['name']}")
            print(f"  Price: ${item['price']}")
            print(f"  Category: {item['category']}")
        else:
            print(f"  Response: {response.json()}")
        return success
    except Exception as e:
        print_test(f"Create Menu Item ({role_name})", False, f"Error: {str(e)}")
        return False

def test_get_staff(role_name):
    """Test getting staff list (Manager only)"""
    print_header(f"10. Testing Get Staff - {role_name}")
    try:
        headers = {"Authorization": f"Bearer {tokens[role_name]}"}
        response = requests.get(f"{BASE_URL}/api/v1/staff", headers=headers)
        success = response.status_code == 200
        print_test(f"Get Staff ({role_name})", success, f"Status: {response.status_code}")
        
        if success:
            staff = response.json()
            print(f"  Found {len(staff)} staff members:")
            for member in staff:
                print(f"    - {member['name']} ({member['role']})")
        else:
            print(f"  Response: {response.json()}")
        return success
    except Exception as e:
        print_test(f"Get Staff ({role_name})", False, f"Error: {str(e)}")
        return False

def test_get_tables(role_name):
    """Test getting tables"""
    print_header(f"11. Testing Get Tables - {role_name}")
    try:
        headers = {"Authorization": f"Bearer {tokens[role_name]}"}
        response = requests.get(f"{BASE_URL}/api/v1/tables", headers=headers)
        success = response.status_code == 200
        print_test(f"Get Tables ({role_name})", success, f"Status: {response.status_code}")
        
        if success:
            tables = response.json()
            print(f"  Found {len(tables)} tables")
        else:
            print(f"  Response: {response.json()}")
        return success
    except Exception as e:
        print_test(f"Get Tables ({role_name})", False, f"Error: {str(e)}")
        return False

def run_all_tests():
    """Run all tests"""
    print(f"\n{Colors.BLUE}")
    print("=" * 60)
    print("  🧪 BACKEND API TESTING SUITE")
    print("  Restaurant Management System")
    print("=" * 60)
    print(Colors.RESET)
    
    results = {
        "passed": 0,
        "failed": 0,
        "total": 0
    }
    
    # Test 1: Health Check
    if test_health_check():
        results["passed"] += 1
    else:
        results["failed"] += 1
    results["total"] += 1
    
    # Test 2: Register (optional)
    # test_register()
    
    # Test 3-4: Login as Customer
    if test_login("customer@demo.com", "customer123", "customer"):
        results["passed"] += 1
        if test_get_current_user("customer"):
            results["passed"] += 1
        else:
            results["failed"] += 1
        results["total"] += 1
    else:
        results["failed"] += 2
    results["total"] += 2
    
    # Test 5-6: Menu operations
    menu_success, menu_items = test_get_menu("customer")
    if menu_success:
        results["passed"] += 1
    else:
        results["failed"] += 1
    results["total"] += 1
    
    if test_get_categories("customer"):
        results["passed"] += 1
    else:
        results["failed"] += 1
    results["total"] += 1
    
    # Test 7-8: Order operations
    order_success, order = test_create_order("customer", menu_items)
    if order_success:
        results["passed"] += 1
    else:
        results["failed"] += 1
    results["total"] += 1
    
    if test_get_orders("customer"):
        results["passed"] += 1
    else:
        results["failed"] += 1
    results["total"] += 1
    
    # Test 9-11: Manager operations
    if test_login("manager@demo.com", "manager123", "manager"):
        results["passed"] += 1
        
        if test_create_menu_item("manager"):
            results["passed"] += 1
        else:
            results["failed"] += 1
        results["total"] += 1
        
        if test_get_staff("manager"):
            results["passed"] += 1
        else:
            results["failed"] += 1
        results["total"] += 1
        
        if test_get_tables("manager"):
            results["passed"] += 1
        else:
            results["failed"] += 1
        results["total"] += 1
    else:
        results["failed"] += 4
    results["total"] += 4
    
    # Print summary
    print_header("TEST SUMMARY")
    print(f"{Colors.GREEN}✓ Passed: {results['passed']}/{results['total']}{Colors.RESET}")
    print(f"{Colors.RED}✗ Failed: {results['failed']}/{results['total']}{Colors.RESET}")
    
    percentage = (results['passed'] / results['total'] * 100) if results['total'] > 0 else 0
    color = Colors.GREEN if percentage >= 80 else Colors.YELLOW if percentage >= 60 else Colors.RED
    print(f"{color}Success Rate: {percentage:.1f}%{Colors.RESET}\n")
    
    return results

if __name__ == "__main__":
    try:
        results = run_all_tests()
        exit(0 if results['failed'] == 0 else 1)
    except KeyboardInterrupt:
        print(f"\n\n{Colors.YELLOW}Tests interrupted by user{Colors.RESET}\n")
        exit(1)
    except Exception as e:
        print(f"\n\n{Colors.RED}Unexpected error: {str(e)}{Colors.RESET}\n")
        exit(1)
