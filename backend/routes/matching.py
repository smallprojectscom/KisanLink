from fastapi import APIRouter
from pydantic import BaseModel
from database import get_connection

router = APIRouter()


class MatchRequest(BaseModel):
    crop: str
    quantity: float
    location: str
    max_price: float


@router.post("/api/match")
def find_matches(data: MatchRequest):
    connection = get_connection()

    try:
        rows = connection.execute(
            """
            SELECT
                p.id AS product_id,
                p.farmer_id,
                p.crop_name,
                p.quantity,
                p.unit,
                p.price,
                p.location,
                p.description,
                u.name AS farmer_name,
                u.mobile AS farmer_mobile,
                u.verified AS verified
            FROM products p
            JOIN users u ON u.id = p.farmer_id
            WHERE p.status = 'available'
              AND LOWER(p.crop_name) LIKE LOWER(?)
            """,
            (f"%{data.crop}%",)
        ).fetchall()

        matches = []

        for row in rows:
            score = 50

            product_location = (row["location"] or "").lower()
            requested_location = data.location.lower()

            if product_location == requested_location:
                score += 25
            elif requested_location in product_location or product_location in requested_location:
                score += 15

            if row["price"] <= data.max_price:
                score += 15
            elif row["price"] <= data.max_price * 1.10:
                score += 8

            if row["quantity"] >= data.quantity:
                score += 10
            elif row["quantity"] >= data.quantity * 0.5:
                score += 5

            if row["verified"]:
                score += 5

            score = min(score, 100)

            matches.append({
                "product_id": row["product_id"],
                "farmer_id": row["farmer_id"],
                "farmer_name": row["farmer_name"],
                "farmer_mobile": row["farmer_mobile"],
                "crop_name": row["crop_name"],
                "quantity": row["quantity"],
                "unit": row["unit"],
                "price": row["price"],
                "location": row["location"],
                "description": row["description"],
                "verified": bool(row["verified"]),
                "match_score": score
            })

        matches.sort(
            key=lambda item: item["match_score"],
            reverse=True
        )

        return {
            "success": True,
            "requirement": {
                "crop": data.crop,
                "quantity": data.quantity,
                "location": data.location,
                "max_price": data.max_price
            },
            "count": len(matches),
            "matches": matches[:3]
        }

    finally:
        connection.close()
