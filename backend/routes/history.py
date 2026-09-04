from fastapi import APIRouter
from database import get_connection

router = APIRouter()


@router.get("/api/history")
def get_history(user_id: int, role: str):
    connection = get_connection()

    try:
        if role == "buyer":
            rows = connection.execute(
                """
                SELECT
                    d.id AS deal_id,
                    d.product_id,
                    d.farmer_id,
                    d.buyer_id,
                    d.quantity,
                    d.agreed_price,
                    d.status,
                    d.created_at,
                    p.crop_name,
                    p.unit,
                    p.location,
                    u.name AS farmer_name
                FROM deals d
                JOIN products p ON p.id = d.product_id
                JOIN users u ON u.id = d.farmer_id
                WHERE d.buyer_id = ?
                  AND d.status = 'completed'
                ORDER BY d.id DESC
                """,
                (user_id,)
            ).fetchall()

        elif role == "farmer":
            rows = connection.execute(
                """
                SELECT
                    d.id AS deal_id,
                    d.product_id,
                    d.farmer_id,
                    d.buyer_id,
                    d.quantity,
                    d.agreed_price,
                    d.status,
                    d.created_at,
                    p.crop_name,
                    p.unit,
                    p.location,
                    u.name AS buyer_name
                FROM deals d
                JOIN products p ON p.id = d.product_id
                JOIN users u ON u.id = d.buyer_id
                WHERE d.farmer_id = ?
                  AND d.status = 'completed'
                ORDER BY d.id DESC
                """,
                (user_id,)
            ).fetchall()

        else:
            return {
                "success": False,
                "message": "Invalid role"
            }

        return {
            "success": True,
            "count": len(rows),
            "history": [dict(row) for row in rows]
        }

    finally:
        connection.close()
