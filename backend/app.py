from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from database import get_connection

app = FastAPI(title="KisanLink Python API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class RegisterRequest(BaseModel):
    name: str
    email: str
    mobile: str
    state: str = ""
    district: str = ""
    pincode: str = ""
    role: str
    password: str


class LoginRequest(BaseModel):
    identifier: str
    password: str

class ProductRequest(BaseModel):
    farmer_id: int
    crop_name: str
    quantity: float
    unit: str
    price: float
    location: str
    description: str = ""



@app.post("/api/register")
def register(data: RegisterRequest):
    if data.role not in ["farmer", "buyer"]:
        raise HTTPException(
            status_code=400,
            detail="Role must be farmer or buyer"
        )

    connection = get_connection()

    try:
        existing = connection.execute(
            """
            SELECT id
            FROM users
            WHERE email = ? OR mobile = ?
            """,
            (data.email, data.mobile)
        ).fetchone()

        if existing:
            return {
                "success": False,
                "message": "Email or mobile already registered"
            }

        cursor = connection.execute(
            """
            INSERT INTO users
            (
                name,
                email,
                mobile,
                state,
                district,
                pincode,
                role,
                password
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.name,
                data.email,
                data.mobile,
                data.state,
                data.district,
                data.pincode,
                data.role,
                data.password
            )
        )

        connection.commit()

        return {
            "success": True,
            "message": "Registration successful",
            "user_id": cursor.lastrowid
        }

    except Exception as error:
        connection.rollback()
        print("Registration error:", error)

        return {
            "success": False,
            "message": "Registration failed"
        }

    finally:
        connection.close()
@app.post("/api/register")
def register(data: RegisterRequest):
    if data.role not in ["farmer", "buyer"]:
        raise HTTPException(status_code=400, detail="Role must be farmer or buyer")

    connection = get_connection()

    try:
        existing = connection.execute(
            "SELECT id FROM users WHERE email = ? OR mobile = ?",
            (data.email, data.mobile)
        ).fetchone()

        if existing:
            return {
                "success": False,
                "message": "Email or mobile already registered"
            }

        cursor = connection.execute(
            """
            INSERT INTO users
            (name, email, mobile, state, district, pincode, role, password)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.name,
                data.email,
                data.mobile,
                data.state,
                data.district,
                data.pincode,
                data.role,
                data.password
            )
        )

        connection.commit()

        return {
            "success": True,
            "message": "Registration successful",
            "user_id": cursor.lastrowid
        }

    except Exception as error:
        connection.rollback()
        print("Registration error:", error)

        return {
            "success": False,
            "message": "Registration failed"
        }

    finally:
        connection.close()

@app.post("/api/login")
def login(data: LoginRequest):
    connection = get_connection()

    try:
        user = connection.execute(
            """
            SELECT id, name, email, mobile, state, district,
                   pincode, role, verified
            FROM users
            WHERE (email = ? OR mobile = ?) AND password = ?
            """,
            (data.identifier, data.identifier, data.password)
        ).fetchone()

        if not user:
            return {
                "success": False,
                "message": "Invalid email/mobile or password"
            }

        user_data = dict(user)

        return {
            "success": True,
            "message": "Login successful",
            "user_id": user_data["id"],
            "name": user_data["name"],
            "email": user_data["email"],
            "mobile": user_data["mobile"],
            "state": user_data["state"],
            "district": user_data["district"],
            "pincode": user_data["pincode"],
            "role": user_data["role"],
            "verified": user_data["verified"],
            "user": user_data
        }

    finally:
        connection.close()


@app.post("/api/products")
def add_product(data: ProductRequest):
    connection = get_connection()

    try:
        farmer = connection.execute(
            "SELECT id FROM users WHERE id = ? AND role = 'farmer'",
            (data.farmer_id,)
        ).fetchone()

        if not farmer:
            return {
                "success": False,
                "message": "Valid farmer not found"
            }

        if data.quantity <= 0:
            return {
                "success": False,
                "message": "Quantity must be greater than 0"
            }

        if data.price < 0:
            return {
                "success": False,
                "message": "Price cannot be negative"
            }

        cursor = connection.execute(
            """
            INSERT INTO products
            (farmer_id, crop_name, quantity, unit, price,
             location, description, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'available')
            """,
            (
                data.farmer_id,
                data.crop_name,
                data.quantity,
                data.unit,
                data.price,
                data.location,
                data.description
            )
        )

        connection.commit()

        return {
            "success": True,
            "message": "Crop listed successfully",
            "product_id": cursor.lastrowid
        }

    finally:
        connection.close()


@app.get("/api/products")
def get_products(
    crop: str = "",
    location: str = "",
    min_price: float = 0,
    max_price: float = 0
):
    connection = get_connection()

    try:
        query = """
            SELECT
                p.*,
                u.name AS farmer_name
            FROM products p
            LEFT JOIN users u ON p.farmer_id = u.id
            WHERE p.status = 'available'
        """

        params = []

        if crop.strip():
            query += " AND LOWER(p.crop_name) LIKE LOWER(?)"
            params.append("%" + crop.strip() + "%")

        if location.strip():
            query += " AND LOWER(p.location) LIKE LOWER(?)"
            params.append("%" + location.strip() + "%")

        if min_price > 0:
            query += " AND p.price >= ?"
            params.append(min_price)

        if max_price > 0:
            query += " AND p.price <= ?"
            params.append(max_price)

        query += " ORDER BY p.id DESC"

        cursor = connection.execute(query, params)
        products = [dict(row) for row in cursor.fetchall()]

        return {
            "success": True,
            "products": products
        }

    finally:
        connection.close()


# KisanLink Python API Routers
from routes.requests import router as request_router
from routes.deals import router as deal_router
from routes.history import router as history_router
from routes.prices import router as price_router
from routes.notifications import router as notification_router
from routes.matching import router as matching_router

app.include_router(request_router)
app.include_router(deal_router)
app.include_router(history_router)
app.include_router(price_router)
app.include_router(notification_router)
app.include_router(matching_router)



