from fastapi import APIRouter
from database import get_connection

router = APIRouter()


@router.get("/api/prices")
def get_prices(crop: str):
    connection = get_connection()

    try:
        rows = connection.execute(
            """
            SELECT price, quantity, unit, location, created_at
            FROM products
            WHERE LOWER(crop_name) LIKE LOWER(?)
              AND status = 'available'
            ORDER BY created_at ASC
            """,
            (f"%{crop.strip()}%",)
        ).fetchall()

        if not rows:
            return {
                "success": True,
                "crop": crop,
                "count": 0,
                "message": "No available price data found",
                "prices": []
            }

        prices = [float(row["price"]) for row in rows]

        average_price = sum(prices) / len(prices)
        minimum_price = min(prices)
        maximum_price = max(prices)

        if maximum_price == minimum_price:
            trend = "→ Stable"
            signal = "Stable market"
        elif len(prices) >= 2:
            first_price = prices[0]
            latest_price = prices[-1]

            if latest_price > first_price:
                trend = "↑ Increasing"
                signal = "Prices are rising"
            elif latest_price < first_price:
                trend = "↓ Decreasing"
                signal = "Prices are falling"
            else:
                trend = "→ Stable"
                signal = "Stable market"
        else:
            trend = "→ Stable"
            signal = "Limited price data"

        return {
            "success": True,
            "crop": crop,
            "count": len(rows),
            "average_price": round(average_price, 2),
            "minimum_price": minimum_price,
            "maximum_price": maximum_price,
            "latest_price": round(prices[-1], 2),
            "trend": trend,
            "signal": signal,
            "prices": [dict(row) for row in rows]
        }

    finally:
        connection.close()
