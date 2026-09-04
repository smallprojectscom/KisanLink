from fastapi import APIRouter
from pydantic import BaseModel
from database import get_connection

router = APIRouter()


class DealCreate(BaseModel):
    request_id: int
    user_id: int


class DealComplete(BaseModel):
    deal_id: int
    user_id: int


@router.post("/api/deals/create")
def create_deal(data: DealCreate):
    connection = get_connection()

    try:
        request_row = connection.execute(
            """
            SELECT
                r.id,
                r.product_id,
                r.buyer_id,
                r.quantity,
                r.status AS request_status,
                p.farmer_id,
                p.crop_name,
                p.price,
                p.unit,
                p.status AS product_status
            FROM requests r
            JOIN products p ON p.id = r.product_id
            WHERE r.id = ?
            """,
            (data.request_id,)
        ).fetchone()

        if not request_row:
            return {
                "success": False,
                "message": "Request not found"
            }

        if data.user_id not in (
            request_row["buyer_id"],
            request_row["farmer_id"]
        ):
            return {
                "success": False,
                "message": "Unauthorized user"
            }

        if request_row["request_status"] != "accepted":
            return {
                "success": False,
                "message": "Only accepted requests can create a deal"
            }

        existing = connection.execute(
            """
            SELECT id, status
            FROM deals
            WHERE product_id = ?
              AND buyer_id = ?
              AND farmer_id = ?
              AND status IN ('active', 'completed')
            LIMIT 1
            """,
            (
                request_row["product_id"],
                request_row["buyer_id"],
                request_row["farmer_id"]
            )
        ).fetchone()

        if existing:
            return {
                "success": True,
                "message": "Deal already exists",
                "deal_id": existing["id"],
                "status": existing["status"]
            }

        cursor = connection.execute(
            """
            INSERT INTO deals (
                product_id,
                farmer_id,
                buyer_id,
                quantity,
                agreed_price,
                status
            )
            VALUES (?, ?, ?, ?, ?, 'active')
            """,
            (
                request_row["product_id"],
                request_row["farmer_id"],
                request_row["buyer_id"],
                request_row["quantity"],
                request_row["price"]
            )
        )

        deal_id = cursor.lastrowid

        connection.commit()

        return {
            "success": True,
            "message": "Deal created successfully",
            "deal_id": deal_id,
            "status": "active"
        }

    except Exception as error:
        connection.rollback()

        return {
            "success": False,
            "message": str(error)
        }

    finally:
        connection.close()


@router.get("/api/deals")
def get_deals(user_id: int, role: str):
    connection = get_connection()

    try:
        if role == "buyer":
            rows = connection.execute(
                """
                SELECT
                    d.id,
                    d.product_id,
                    d.buyer_id,
                    d.farmer_id,
                    d.quantity,
                    d.agreed_price,
                    d.status,
                    d.created_at,
                    p.crop_name,
                    p.unit,
                    p.location,
                    u.name AS farmer_name,
                    u.mobile AS farmer_mobile
                FROM deals d
                JOIN products p ON p.id = d.product_id
                JOIN users u ON u.id = d.farmer_id
                WHERE d.buyer_id = ?
                ORDER BY d.id DESC
                """,
                (user_id,)
            ).fetchall()

        elif role == "farmer":
            rows = connection.execute(
                """
                SELECT
                    d.id,
                    d.product_id,
                    d.buyer_id,
                    d.farmer_id,
                    d.quantity,
                    d.agreed_price,
                    d.status,
                    d.created_at,
                    p.crop_name,
                    p.unit,
                    p.location,
                    u.name AS buyer_name,
                    u.mobile AS buyer_mobile
                FROM deals d
                JOIN products p ON p.id = d.product_id
                JOIN users u ON u.id = d.buyer_id
                WHERE d.farmer_id = ?
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
            "deals": [dict(row) for row in rows]
        }

    finally:
        connection.close()


@router.post("/api/deals/complete")
def complete_deal(data: DealComplete):
    connection = get_connection()

    try:
        deal = connection.execute(
            """
            SELECT id, farmer_id, buyer_id, status
            FROM deals
            WHERE id = ?
            """,
            (data.deal_id,)
        ).fetchone()

        if not deal:
            return {
                "success": False,
                "message": "Deal not found"
            }

        if data.user_id not in (
            deal["farmer_id"],
            deal["buyer_id"]
        ):
            return {
                "success": False,
                "message": "Unauthorized user"
            }

        if deal["status"] == "completed":
            return {
                "success": True,
                "message": "Deal already completed"
            }

        if deal["status"] != "active":
            return {
                "success": False,
                "message": "Only active deals can be completed"
            }

        connection.execute(
            """
            UPDATE deals
            SET status = 'completed'
            WHERE id = ?
            """,
            (data.deal_id,)
        )

        connection.commit()

        return {
            "success": True,
            "message": "Deal marked as completed"
        }

    except Exception as error:
        connection.rollback()

        return {
            "success": False,
            "message": str(error)
        }

    finally:
        connection.close()
