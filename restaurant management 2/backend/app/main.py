from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.routers import menu, tables, orders, billing, analytics, dishes, inventory, auth, chef
import os

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Restaurant Management API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
static_dir = "static"
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

app.include_router(auth.router)
app.include_router(menu.router)
app.include_router(tables.router)
app.include_router(orders.router)
app.include_router(billing.router)
app.include_router(analytics.router)
app.include_router(dishes.router)
app.include_router(inventory.router)
app.include_router(chef.router)

@app.get("/")
def read_root():
    return {"message": "Restaurant Management API"}
