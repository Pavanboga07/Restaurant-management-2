# Restaurant Management System - Backend# Flask Backend for Restaurant Management System



Multi-tenant, AI-powered restaurant management system built with Python FastAPI.## Setup Instructions



## Tech Stack### 1. Install Python Dependencies

```bash

- **Framework**: FastAPIpip install -r requirements.txt

- **Database**: PostgreSQL with SQLAlchemy ORM```

- **Authentication**: JWT with bcrypt

- **Real-time**: python-socketio### 2. Configure Environment Variables

- **Payment**: Stripe & RazorpayCopy `.env.example` to `.env` and update with your credentials:

- **AI/ML**: NumPy, Pandas, Scikit-learn```bash

cp .env.example .env

## Features```



- ✅ Multi-tenant architecture (restaurant_id isolation)### 3. Initialize Database

- ✅ Role-based access control (Customer, Staff, Manager, Chef)The database will be automatically created when you run the app:

- ✅ JWT authentication with refresh tokens```bash

- ✅ Menu management with search & filterspython app.py

- ✅ Order management with real-time updates```

- ✅ Inventory tracking

- ✅ Payment integration (Stripe/Razorpay)### 4. Run the Development Server

- ✅ AI-powered recommendations```bash

- ✅ Rate limitingpython app.py

- ✅ CORS support```



## Project StructureThe API will be available at `http://localhost:5000`



```## API Endpoints

backend/

├── app/### Authentication

│   ├── api/- `POST /api/auth/register` - Register new user

│   │   └── routes/          # API endpoints- `GET /api/auth/user/<stack_user_id>` - Get user details

│   │       ├── auth.py      # Authentication

│   │       ├── menu.py      # Menu management### Menu

│   │       ├── orders.py    # Order management- `GET /api/menu` - Get all menu items

│   │       ├── inventory.py- `GET /api/menu/<id>` - Get menu item details

│   │       ├── tables.py- `POST /api/menu` - Create menu item

│   │       ├── payments.py- `PUT /api/menu/<id>` - Update menu item

│   │       └── ai.py

│   ├── core/### Tables

│   │   ├── config.py        # Configuration- `GET /api/tables` - Get all tables

│   │   ├── database.py      # Database setup- `POST /api/tables` - Create table

│   │   └── security.py      # JWT & password handling- `POST /api/tables/<id>/assign-waiter` - Assign waiter to table

│   ├── models/

│   │   └── models.py        # SQLAlchemy models### Bookings

│   ├── schemas/- `GET /api/bookings` - Get all bookings

│   │   └── schemas.py       # Pydantic schemas- `POST /api/bookings` - Create booking

│   ├── middleware/- `PUT /api/bookings/<id>` - Update booking

│   │   ├── tenant.py        # Multi-tenant isolation

│   │   └── rate_limit.py    # Rate limiting### Orders

│   ├── services/            # Business logic- `GET /api/orders` - Get all orders

│   ├── sockets/             # Socket.IO events- `POST /api/orders` - Create order

│   └── utils/               # Helper functions- `PUT /api/orders/<id>` - Update order status

├── alembic/                 # Database migrations

├── tests/                   # Test files### Inventory

├── main.py                  # Application entry point- `GET /api/inventory` - Get inventory items

├── requirements.txt         # Python dependencies- `POST /api/inventory` - Add inventory item

└── .env.example             # Environment variables template- `PUT /api/inventory/<id>` - Update inventory

```

### AI Features

## Installation- `GET /api/recommendations/<customer_id>` - Get personalized recommendations

- `GET /api/pricing/dynamic` - Get current dynamic pricing

### 1. Clone the repository- `POST /api/ai/chatbot` - Chat with AI assistant

- `GET /api/ai/forecast/orders` - Get order predictions

```bash- `GET /api/ai/forecast/inventory` - Get inventory forecast

cd backend

```### Analytics

- `GET /api/reports/sales` - Sales report

### 2. Create virtual environment- `GET /api/dashboard/stats` - Dashboard statistics



```bash## WebSocket Events

python -m venv venv

```### Client to Server

- `connect` - Connect to server

### 3. Activate virtual environment- `join` - Join a room

- `send_notification` - Send notification

**Windows (PowerShell):**- `table_status_update` - Update table status

```powershell- `order_update` - Update order status

.\venv\Scripts\Activate.ps1

```### Server to Client

- `new_booking` - New booking created

**Linux/Mac:**- `new_order` - New order placed

```bash- `order_status_updated` - Order status changed

source venv/bin/activate- `low_stock_alert` - Inventory low stock

```- `notification` - General notification


### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your actual values:
- Database URL
- JWT secret key
- Payment gateway keys
- SMTP settings
- etc.

### 6. Initialize database

```bash
# Create database tables
alembic upgrade head
```

### 7. Run the application

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: http://localhost:8000

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Database Models

### Core Models
- **Restaurant** - Multi-tenant restaurant data
- **User** - Users with roles (customer, staff, manager, chef)
- **Table** - Table management
- **MenuItem** - Menu items with categories
- **Ingredient** - Inventory tracking
- **Order** - Order management
- **OrderItem** - Order line items
- **Payment** - Payment tracking
- **InventoryLog** - Inventory changes
- **AIRecommendation** - AI suggestions

## User Roles

1. **Customer** - Browse menu, order food, track orders
2. **Staff** - Manage orders, bookings, generate bills
3. **Manager** - Full restaurant management, analytics
4. **Chef** - View orders, update preparation status

## Authentication

### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "customer",
  "restaurant_id": 1
}
```

### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Returns:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### Protected Routes

Include JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `STRIPE_SECRET_KEY` - Stripe payment key
- `RAZORPAY_KEY_ID` - Razorpay key
- `SMTP_HOST` - Email server
- `AI_SERVICE_URL` - AI microservice URL
- etc.

## Development

### Run with hot reload
```bash
uvicorn main:app --reload
```

### Create database migration
```bash
alembic revision --autogenerate -m "description"
```

### Apply migrations
```bash
alembic upgrade head
```

### Run tests
```bash
pytest
```

## Multi-Tenant Support

The system supports multiple restaurants on a single backend:

1. **Subdomain-based**: `restaurant1.yourdomain.com`
2. **Header-based**: `X-Restaurant-ID: 1`
3. **JWT-based**: Restaurant ID in token

All queries are automatically filtered by `restaurant_id`.

## Rate Limiting

- Default: 60 requests per minute per IP
- Configurable in `.env`: `RATE_LIMIT_PER_MINUTE`
- Returns `429 Too Many Requests` when exceeded

## Socket.IO Events

Real-time events for:
- `order:placed` - New order notification
- `order:updated` - Order status changes
- `inventory:low` - Low stock alerts
- `table:booked` - Table reservations

## Next Steps

- [ ] Create remaining routes (inventory, tables, payments, AI)
- [ ] Implement Socket.IO event handlers
- [ ] Set up database migrations with Alembic
- [ ] Add comprehensive tests
- [ ] Set up AI microservice
- [ ] Create frontend application

## License

MIT
