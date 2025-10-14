"""
Socket.IO Event Handlers
Real-time communication for orders, inventory, and notifications
"""
import socketio

# Create Socket.IO server
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins='*'
)

# Connected clients by restaurant
connected_clients = {}

@sio.event
async def connect(sid, environ):
    """Handle client connection"""
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    """Handle client disconnection"""
    print(f"Client disconnected: {sid}")
    
    # Remove from connected clients
    for restaurant_id in list(connected_clients.keys()):
        if sid in connected_clients[restaurant_id]:
            connected_clients[restaurant_id].remove(sid)
            if not connected_clients[restaurant_id]:
                del connected_clients[restaurant_id]

@sio.event
async def join_restaurant(sid, data):
    """Join a restaurant room for updates"""
    restaurant_id = data.get('restaurant_id')
    if restaurant_id:
        if restaurant_id not in connected_clients:
            connected_clients[restaurant_id] = []
        connected_clients[restaurant_id].append(sid)
        await sio.enter_room(sid, f"restaurant_{restaurant_id}")
        print(f"Client {sid} joined restaurant {restaurant_id}")

@sio.event
async def leave_restaurant(sid, data):
    """Leave a restaurant room"""
    restaurant_id = data.get('restaurant_id')
    if restaurant_id:
        await sio.leave_room(sid, f"restaurant_{restaurant_id}")
        if restaurant_id in connected_clients and sid in connected_clients[restaurant_id]:
            connected_clients[restaurant_id].remove(sid)

# Event emitters (to be called from routes)
async def emit_order_placed(restaurant_id: int, order_data: dict):
    """Emit new order notification"""
    await sio.emit(
        'order:placed',
        order_data,
        room=f"restaurant_{restaurant_id}"
    )

async def emit_order_updated(restaurant_id: int, order_data: dict):
    """Emit order status update"""
    await sio.emit(
        'order:updated',
        order_data,
        room=f"restaurant_{restaurant_id}"
    )

async def emit_inventory_low(restaurant_id: int, inventory_data: dict):
    """Emit low inventory alert"""
    await sio.emit(
        'inventory:low',
        inventory_data,
        room=f"restaurant_{restaurant_id}"
    )

async def emit_table_booked(restaurant_id: int, table_data: dict):
    """Emit table booking notification"""
    await sio.emit(
        'table:booked',
        table_data,
        room=f"restaurant_{restaurant_id}"
    )

# TODO: Add more event handlers as needed
# - Payment notifications
# - Staff updates
# - Chef notifications
# - Customer notifications
