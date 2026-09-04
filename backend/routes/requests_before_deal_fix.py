from fastapi import APIRouter
from pydantic import BaseModel
from database import get_connection

router = APIRouter(prefix="/api/requests", tags=["Requests"])


class RequestCreate(BaseModel):
    product_id: int
    buyer_id: int
    quantity: float
    message: str = ""


class RequestStatus(BaseModel):
    request_id: int
    user_id: int
    status: str


@router.post("")
def create_request(data: RequestCreate):
    db = get_connection()

    try:
        buyer = db.execute(
            "SELECT id FROM users WHERE id = ? AND role = 'buyer'",
            (data.buyer_id,)
        ).fetchone()

        if not buyer:
            return {
                "success": False,
                "message": "Buyer not found"
            }

        product = db.execute(
            """
            SELECT id, farmer_id, quantity, status
            FROM products
            WHERE id = ?
            """,
            (data.product_id,)
        ).fetchone()

        if not product:
            return {
                "success": False,
                "message": "Product not found"
            }

        if product["status"] != "available":
            return {
                "success": False,
                "message": "Product not available"
            }

        if data.quantity <= 0:
            return {
                "success": False,
                "message": "Quantity must be greater than 0"
            }

        if data.quantity > product["quantity"]:
            return {
                "success": False,
                "message": "Requested quantity exceeds available quantity"
            }

        cursor = db.execute(
            """
            INSERT INTO requests
            (product_id, buyer_id, quantity, message, status)
            VALUES (?, ?, ?, ?, 'pending')
            """,
            (
                data.product_id,
                data.buyer_id,
                data.quantity,
                data.message
            )
        )

        db.commit()

        return {
            "success": True,
            "message": "Request sent successfully",
            "request_id": cursor.lastrowid
        }

    finally:
        db.close()


@router.get("")
def get_requests(user_id: int, role: str):
    db = get_connection()

    try:
        if role == "buyer":

            rows = db.execute(
                """
                SELECT
                    r.id,
                    r.product_id,
                    r.buyer_id,
                    r.quantity,
                    r.message,
                    r.status,
                    r.created_at,
                    p.crop_name,
                    p.price,
                    p.location,
                    p.farmer_id,
                    u.name AS farmer_name
                FROM requests r
                JOIN products p ON p.id = r.product_id
                JOIN users u ON u.id = p.farmer_id
                WHERE r.buyer_id = ?
                ORDER BY r.id DESC
                """,
                (user_id,)
            ).fetchall()

        elif role == "farmer":

            rows = db.execute(
                """
                SELECT
                    r.id,
                    r.product_id,
                    r.buyer_id,
                    r.quantity,
                    r.message,
                    r.status,
                    r.created_at,
                    p.crop_name,
                    p.price,
                    p.location,
                    p.farmer_id,
                    u.name AS buyer_name,
                    u.mobile AS buyer_mobile,
                    u.verified AS buyer_verified
                FROM requests r
                JOIN products p ON p.id = r.product_id
                JOIN users u ON u.id = r.buyer_id
                WHERE p.farmer_id = ?
                ORDER BY r.id DESC
                """,
                (user_id,)
            ).fetchall()

        else:
            return {
                "success": False,
                "message": "Role must be farmer or buyer"
            }

        return {
            "success": True,
            "requests": [dict(row) for row in rows]
        }

    finally:
        db.close()


@router.post("/status")
def update_request_status(data: RequestStatus):

    allowed = ["accepted", "rejected", "cancelled"]

    if data.status not in allowed:
        return {
            "success": False,
            "message": "Invalid request status"
        }

    db = get_connection()

    try:
        request = db.execute(
            """
            SELECT
                r.id,
                r.buyer_id,
                r.product_id,
                r.status,
                p.farmer_id
            FROM requests r
            JOIN products p ON p.id = r.product_id
            WHERE r.id = ?
            """,
            (data.request_id,)
        ).fetchone()

        if not request:
            return {
                "success": False,
                "message": "Request not found"
            }

        is_buyer = request["buyer_id"] == data.user_id
        is_farmer = request["farmer_id"] == data.user_id

        if not is_buyer and not is_farmer:
            return {
                "success": False,
                "message": "Unauthorized user"
            }

        if data.status in ["accepted", "rejected"] and not is_farmer:
            return {
                "success": False,
                "message": "Only farmer can accept or reject request"
            }

        if data.status == "cancelled" and not is_buyer:
            return {
                "success": False,
                "message": "Only buyer can cancel request"
            }

        if request["status"] != "pending":
            return {
                "success": False,
                "message": "Request is no longer pending"
            }

        db.execute(
            """
            UPDATE requests
            SET status = ?
            WHERE id = ?
            """,
            (data.status, data.request_id)
        )

        db.commit()

        return {
            "success": True,
            "message": f"Request {data.status} successfully"
        }

    finally:
        db.close()

