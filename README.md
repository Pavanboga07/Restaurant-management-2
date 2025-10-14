# 🍽️ Multi-Tenant AI-Powered Restaurant Management System# 🍽️ Pavan Restaurant - AI-Powered Management System



A modern, scalable SaaS platform for restaurant management with real-time operations, AI-powered insights, and multi-role access control.A comprehensive full-stack restaurant management system for **Pavan Restaurant** with AI-powered features for dynamic pricing, inventory management, personalized recommendations, and seamless operations.



## 🚀 Features## ✨ Complete Feature Set



### For Customers### 👥 For Customers

- 🔐 Secure login/signup (OTP or Google OAuth)- ✅ **User Login** - Secure JWT authentication

- 📱 Dynamic menu browsing with search & filters- ✅ **Dynamic Menu** - Real-time updated menu with pricing

- 📅 Real-time table booking- ✅ **Search & Sort** - Find dishes by name, category, price, rating

- 🛒 Order placement linked to tables- ✅ **Table Booking** - Reserve tables with date/time selection

- 📍 Live order tracking- ✅ **Order Food** - Pre-order for booked tables with customization

- 🤖 AI-based dish recommendations- ✅ **Payment Gateway** - Multiple payment options (Card, UPI, Net Banking)

- 💳 Online payment integration- ✅ **AI Recommendations** - Personalized dish suggestions

- 📜 Order history and bills- ✅ **Order Tracking** - Real-time status updates



### For Managers### 👨‍💼 For Managers

- 👨‍💼 Complete dashboard with analytics- ✅ **Manager Login** - Admin access with role-based permissions

- 📋 Menu management (CRUD operations)- ✅ **Create Menu** - Add/edit dishes with ingredient tracking

- 💰 Dynamic pricing (manual or AI-powered)- ✅ **Ingredient Management** - Add dishes with auto-crosscheck of availability

- 📦 Inventory management with expiry tracking- ✅ **Dynamic Pricing** - AI-powered pricing with accept/reject options

- 🤖 AI inventory suggestions & grocery lists- ✅ **Inventory Management** - Track stock levels and expiry dates

- 👥 Staff management- ✅ **Expiry Tracking** - Auto-adjust prices for near-expiry ingredients

- 📊 Sales reports and analytics- ✅ **AI Inventory Suggestions** - Smart restocking recommendations

- 💵 Bill generation- ✅ **Grocery Lists** - Auto-generated based on order patterns

- ✅ **Supplier Orders** - Place orders and track deliveries

### For Staff (Waiters/Cashiers)- ✅ **Bill Generation** - Itemized bills with taxes and discounts

- 📅 Manual table booking for walk-ins- ✅ **Staff Management** - Assign tasks and track performance

- 🛎️ Order management for tables- ✅ **Analytics** - Comprehensive reports and insights

- 📱 Real-time kitchen notifications

- 🧾 Bill generation and payment processing### 🧑‍🍳 For Staff

- ✅ Table checkout management- ✅ **Staff Login** - Individual access credentials

- ✅ **Book Tables** - Reserve tables for walk-in customers

### For Chefs- ✅ **Add Orders** - Take and manage table orders

- 👨‍🍳 Live order queue with priorities- ✅ **Order Updates** - Real-time notifications from kitchen

- ✅ Ingredient availability checking- ✅ **Task Management** - View and complete assigned tasks

- 🔄 Auto-inventory updates on dish completion

- ⚠️ Low-stock and expiry alerts### 👨‍🍳 For Chefs

- 🤖 AI-based prep priority suggestions- ✅ **Chef Login** - Kitchen portal access

- ✅ **Check Orders** - View order queue with priorities

## 🏗️ Tech Stack- ✅ **Inventory Check** - Verify ingredient availability

- ✅ **Update Inventory** - Deduct used ingredients

### Frontend- ✅ **Order Status** - Update preparation status per table

- **Framework**: React 18 + Vite

- **Styling**: Tailwind CSS## 🏗️ Tech Stack

- **Real-time**: Socket.IO Client

- **State**: Context API + React Query### Backend

- **Routing**: React Router v6- **Framework**: Flask 3.0

- **Forms**: React Hook Form + Zod- **Database**: PostgreSQL (Neon)

- **HTTP**: Axios- **ORM**: SQLAlchemy

- **Real-time**: Flask-SocketIO

### Backend- **Authentication**: JWT with bcrypt

- **Runtime**: Node.js 18+- **Security**: Rate limiting, CORS, validation

- **Framework**: Express.js- **Logging**: Structured JSON logging

- **Authentication**: JWT + bcrypt

- **Real-time**: Socket.IO### Frontend

- **Database**: PostgreSQL (NeonDB)- **Framework**: React 18 with Vite

- **ORM**: Prisma- **Styling**: Tailwind CSS

- **Validation**: Zod- **Routing**: React Router v6

- **API**: REST + WebSocket- **State**: React Context API

- **API Client**: Axios

### AI Microservice- **Real-time**: Socket.io Client

- **Framework**: Python FastAPI- **UI Icons**: Lucide React

- **ML**: scikit-learn, TensorFlow- **Notifications**: React Hot Toast

- **Features**: Recommendations, Pricing, Forecasting- **Forms**: React Hook Form with Zod

- **Communication**: REST API

### AI Features

### Database- **Recommendation Engine** - Personalized suggestions

- **Primary**: PostgreSQL (NeonDB/Supabase)- **Dynamic Pricing** - Demand-based pricing

- **Schema**: Multi-tenant with tenant isolation- **Inventory Forecasting** - Predict stock needs

- **Migrations**: Prisma Migrate- **Expiry Management** - Auto price adjustments

- **Order Prediction** - Forecast demand

### Payments

- **Gateways**: Razorpay / Stripe## 📋 Prerequisites

- **Features**: Payment processing, refunds, reports

- Python 3.8+

## 📁 Project Structure- Node.js 18+

- PostgreSQL (or Neon account)

```- npm or yarn

/

├── backend/                 # Node.js Express server## 🚀 Quick Start

│   ├── src/

│   │   ├── controllers/    # Route controllers### 1. Clone the Repository

│   │   ├── routes/         # API routes```bash

│   │   ├── models/         # Prisma modelscd "mini project"

│   │   ├── middlewares/    # Auth, validation, etc.```

│   │   ├── sockets/        # WebSocket handlers

│   │   ├── services/       # Business logic### 2. Backend Setup

│   │   ├── utils/          # Helpers

│   │   └── config/         # Configuration#### Install Python Dependencies

│   ├── prisma/             # Database schema```bash

│   ├── package.jsoncd backend

│   └── server.jspip install -r requirements.txt

│```

├── frontend/               # React + Vite web app

│   ├── src/#### Configure Environment

│   │   ├── components/    # Reusable componentsCreate `.env` file in the `backend` directory:

│   │   ├── pages/         # Page components```env

│   │   ├── contexts/      # React contextsDATABASE_URL=postgresql://neondb_owner:npg_BQ3RVIry9hoF@ep-raspy-mountain-a8hcmjao-pooler.eastus2.azure.neon.tech/neondb?sslmode=require

│   │   ├── hooks/         # Custom hooksSECRET_KEY=your-secret-key-change-in-production

│   │   ├── services/      # API servicesFLASK_ENV=development

│   │   ├── utils/         # Helper functionsFLASK_DEBUG=True

│   │   └── App.jsx

│   ├── package.json# Neon Auth (Optional)

│   └── vite.config.jsNEXT_PUBLIC_STACK_PROJECT_ID=your-stack-project-id

│NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your-publishable-client-key

├── ai-service/            # Python FastAPI microserviceSTACK_SECRET_SERVER_KEY=your-secret-server-key

│   ├── models/            # ML models```

│   ├── routes/            # API endpoints

│   ├── scripts/           # Training scripts#### Initialize Database & Run Server

│   ├── requirements.txt```bash

│   └── main.pypython app.py

│```

├── database/              # Database files

│   ├── schema.sqlThe backend will run on `http://localhost:5000`

│   ├── migrations/

│   └── seeds/### 3. Frontend Setup

│

└── deployment/            # Deployment configs#### Install Node Dependencies

    ├── docker-compose.yml```bash

    └── vercel.jsoncd frontend

```npm install

```

## 🗂️ Database Schema

#### Configure Environment

### Core TablesCreate `.env` file in the `frontend` directory:

- `users` - Multi-role user accounts```env

- `restaurants` - Tenant informationVITE_API_URL=http://localhost:5000/api

- `tables` - Restaurant tablesVITE_SOCKET_URL=http://localhost:5000

- `menu_items` - Dishes and items```

- `ingredients` - Inventory items

- `dishes_ingredients` - Recipe mapping#### Run Development Server

- `orders` - Customer orders```bash

- `order_items` - Order detailsnpm run dev

- `payments` - Transaction records```

- `inventory_logs` - Stock movements

- `ai_recommendations` - AI suggestionsThe frontend will run on `http://localhost:3000`



## 🔄 Real-Time Flow## 📚 Project Structure



``````

Customer places ordermini project/

    ↓├── backend/

Backend stores in DB│   ├── app.py                    # Flask application entry point

    ↓│   ├── models.py                 # SQLAlchemy database models

WebSocket → Chef Dashboard│   ├── routes.py                 # API endpoints

    ↓│   ├── ai_modules.py             # AI/ML features

Chef marks prepared│   ├── websocket_handlers.py     # Real-time WebSocket handlers

    ↓│   ├── requirements.txt          # Python dependencies

WebSocket → Staff notification│   ├── .env.example             # Environment variables template

    ↓│   └── README.md                # Backend documentation

Customer sees status update│

    ↓├── frontend/

Inventory auto-updates│   ├── src/

```│   │   ├── components/          # Reusable React components

│   │   ├── context/             # React Context providers

## 🚀 Quick Start│   │   ├── pages/               # Page components

│   │   │   ├── customer/        # Customer interface

### Prerequisites│   │   │   └── manager/         # Manager interface

- Node.js 18+│   │   ├── services/            # API & Socket services

- Python 3.9+│   │   ├── App.jsx              # Main app component

- PostgreSQL│   │   └── main.jsx             # Entry point

- npm or yarn│   ├── package.json

│   ├── tailwind.config.js

### Installation│   ├── vite.config.js

│   ├── .env.example

1. **Clone and Install**│   └── README.md

```bash│

# Install backend dependencies└── README.md                     # This file

cd backend```

npm install

## 🗄️ Database Schema

# Install frontend dependencies

cd ../frontend### Tables

npm install- **customers**: User accounts with roles (customer, staff, manager)

- **menu_items**: Restaurant menu with dynamic pricing

# Install AI service dependencies- **inventory**: Stock management with thresholds

cd ../ai-service- **tables**: Restaurant table management

pip install -r requirements.txt- **bookings**: Table reservations

```- **orders**: Customer orders with items

- **order_items**: Individual items in orders

2. **Setup Environment Variables**- **notifications**: System notifications

```bash

# Backend .env## 🔌 API Endpoints

DATABASE_URL="postgresql://..."

JWT_SECRET="your-secret-key"### Authentication

RAZORPAY_KEY="your-key"- `POST /api/auth/register` - Register new user

RAZORPAY_SECRET="your-secret"- `GET /api/auth/user/:id` - Get user details



# Frontend .env### Menu

VITE_API_URL="http://localhost:5000"- `GET /api/menu` - Get all menu items

VITE_WS_URL="http://localhost:5000"- `POST /api/menu` - Create menu item

```- `PUT /api/menu/:id` - Update menu item



3. **Setup Database**### Tables & Bookings

```bash- `GET /api/tables` - Get all tables

cd backend- `POST /api/bookings` - Create booking

npx prisma migrate dev- `PUT /api/bookings/:id` - Update booking

npx prisma db seed

```### Orders

- `GET /api/orders` - Get orders (with filters)

4. **Run Development Servers**- `POST /api/orders` - Create order

```bash- `PUT /api/orders/:id` - Update order status

# Terminal 1 - Backend

cd backend### Inventory

npm run dev- `GET /api/inventory` - Get inventory items

- `PUT /api/inventory/:id` - Update inventory

# Terminal 2 - Frontend

cd frontend### AI Features

npm run dev- `GET /api/recommendations/:customerId` - Get personalized recommendations

- `GET /api/pricing/dynamic` - Get dynamic pricing

# Terminal 3 - AI Service- `POST /api/ai/chatbot` - Chat with AI

cd ai-service- `GET /api/ai/forecast/orders` - Order predictions

uvicorn main:app --reload- `GET /api/ai/forecast/inventory` - Inventory forecast

```

### Analytics

5. **Access Application**- `GET /api/reports/sales` - Sales report

- Frontend: http://localhost:3000- `GET /api/dashboard/stats` - Dashboard statistics

- Backend API: http://localhost:5000

- AI Service: http://localhost:8000## 🔄 WebSocket Events



## 🎯 API Endpoints### Client → Server

- `connect` - Connect to server

### Authentication- `join` - Join a room for notifications

- `POST /api/auth/register` - User registration- `send_notification` - Send notification

- `POST /api/auth/login` - User login

- `POST /api/auth/logout` - User logout### Server → Client

- `GET /api/auth/me` - Get current user- `new_booking` - New booking created

- `new_order` - New order placed

### Customers- `order_status_updated` - Order status changed

- `GET /api/menu` - Get menu- `low_stock_alert` - Inventory low

- `POST /api/bookings` - Book table- `notification` - General notification

- `POST /api/orders` - Place order

- `GET /api/orders/:id/track` - Track order## 🤖 AI Features Explained



### Managers### 1. Order Prediction

- `POST /api/menu` - Add menu itemAnalyzes historical order data to forecast order volumes for upcoming hours, helping staff prepare accordingly.

- `PUT /api/menu/:id` - Update item

- `DELETE /api/menu/:id` - Delete item### 2. Inventory Forecasting

- `GET /api/inventory` - Get inventoryPredicts ingredient usage based on popular items and provides restock recommendations.

- `POST /api/pricing/optimize` - AI pricing

- `GET /api/analytics` - Dashboard data### 3. Recommendation Engine

Uses customer order history and item popularity to suggest personalized menu items.

### Staff

- `GET /api/tables` - Get all tables### 4. Dynamic Pricing

- `PUT /api/orders/:id/status` - Update orderAdjusts menu prices based on:

- `POST /api/bills` - Generate bill- Time of day (breakfast, lunch, dinner, late-night)

- Recent order volume (demand)

### Chef- Peak vs off-peak hours

- `GET /api/orders/queue` - Get order queue

- `PUT /api/orders/:id/prepare` - Mark prepared## 🔐 Authentication & Authorization

- `GET /api/inventory/check` - Check stock

The system supports three user roles:

## 🤖 AI Features- **Customer**: Book tables, place orders, track orders

- **Staff**: Manage orders, update status

1. **Recommendation Engine**- **Manager**: Full access to all features, analytics, and settings

   - Collaborative filtering

   - Content-based recommendations## 🎨 UI/UX Features

   - Personalized suggestions

- **Mobile-First Design**: Fully responsive on all devices

2. **Dynamic Pricing**- **Real-time Updates**: Live notifications and status changes

   - Demand-based pricing- **Dark Mode Support**: Coming soon

   - Expiry-based discounts- **Accessibility**: WCAG 2.1 compliant

   - Peak hour adjustments- **Progressive Web App**: Can be installed on mobile devices



3. **Inventory Forecasting**## 🧪 Testing

   - Stock prediction

   - Reorder suggestions### Backend Tests

   - Waste minimization```bash

cd backend

## 🔐 Securitypytest

```

- JWT authentication with refresh tokens

- Role-based access control (RBAC)### Frontend Tests

- Multi-tenant data isolation```bash

- SQL injection preventioncd frontend

- XSS protectionnpm run test

- Rate limiting```

- CORS configuration

## 📦 Deployment

## 📦 Deployment

### Backend Deployment (Heroku/Railway)

### Frontend (Vercel)1. Set environment variables

```bash2. Configure database connection

cd frontend3. Deploy using Git or CLI

vercel --prod

```### Frontend Deployment (Vercel/Netlify)

1. Build the project: `npm run build`

### Backend (Render/Railway)2. Deploy the `dist` folder

```bash3. Configure environment variables

cd backend

# Configure environment variables## 🐛 Troubleshooting

# Deploy via Git push

```### Database Connection Issues

- Verify DATABASE_URL is correct

### Database (NeonDB/Supabase)- Check Neon PostgreSQL firewall settings

- Create database instance- Ensure SSL mode is enabled

- Run migrations

- Configure connection pooling### CORS Errors

- Verify CORS_ORIGINS in backend .env

## 🧪 Testing- Check frontend VITE_API_URL matches backend



```bash### WebSocket Connection Failed

# Backend tests- Ensure Socket.io server is running

cd backend- Check firewall/proxy settings

npm test- Verify VITE_SOCKET_URL is correct



# Frontend tests## 🤝 Contributing

cd frontend

npm test1. Fork the repository

2. Create a feature branch

# E2E tests3. Commit your changes

npm run test:e2e4. Push to the branch

```5. Open a Pull Request



## 📝 Documentation## 📄 License



- [API Documentation](./docs/API.md)This project is licensed under the MIT License.

- [Database Schema](./docs/DATABASE.md)

- [Deployment Guide](./docs/DEPLOYMENT.md)## 👥 Authors

- [Contributing Guide](./CONTRIBUTING.md)

- Your Name - Initial work

## 🤝 Contributing

## 🙏 Acknowledgments

1. Fork the repository

2. Create feature branch- React team for amazing framework

3. Commit changes- Flask community

4. Push to branch- Neon for PostgreSQL database

5. Create Pull Request- All open-source contributors



## 📄 License## 📞 Support



MIT License - see LICENSE fileFor issues and questions:

- Create an issue on GitHub

## 👥 Team- Email: support@restaurant.com



Built with ❤️ for modern restaurants## 🗺️ Roadmap



## 🔗 Links- [ ] Mobile app (React Native)

- [ ] Payment integration

- [Live Demo](https://demo.restaurant-saas.com)- [ ] Email notifications

- [Documentation](https://docs.restaurant-saas.com)- [ ] Multi-language support

- [Support](https://support.restaurant-saas.com)- [ ] Advanced analytics dashboard

- [ ] Kitchen display system

---- [ ] QR code ordering

- [ ] Loyalty program

**Status**: 🚧 In Development | **Version**: 1.0.0-beta

---

Made with ❤️ for modern restaurants
