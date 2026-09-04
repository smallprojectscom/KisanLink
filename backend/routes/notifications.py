from fastapi import APIRouter
from pydantic import BaseModel
from database import get_connection

router = APIRouter()


class NotificationCreate(BaseModel):
    user_id: int
    message: str
    type: str = "general"


@router.post("/api/notifications")
def create_notification(data: NotificationCreate):
    connection = get_connection()

    try:
        user = connection.execute(
            "SELECT id FROM users WHERE id = ?",
            (data.user_id,)
        ).fetchone()

        if not user:
            return {
                "success": False,
                "message": "User not found"
            }

        cursor = connection.execute(
            """
            INSERT INTO notifications (
                user_id,
                message,
                type
            )
            VALUES (?, ?, ?)
            """,
            (
                data.user_id,
                data.message,
                data.type
            )
        )

        connection.commit()

        return {
            "success": True,
            "message": "Notification created successfully",
            "notification_id": cursor.lastrowid
        }

    except Exception as error:
        connection.rollback()

        return {
            "success": False,
            "message": str(error)
        }

    finally:
        connection.close()


@router.get("/api/notifications")
def get_notifications(user_id: int):
    connection = get_connection()

    try:
        rows = connection.execute(
            """
            SELECT
                id,
                user_id,
                message,
                type,
                is_read,
                created_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY id DESC
            """,
            (user_id,)
        ).fetchall()

        return {
            "success": True,
            "count": len(rows),
            "notifications": [dict(row) for row in rows]
        }

    finally:
        connection.close()


@router.patch("/api/notifications/{notification_id}/read")
def mark_notification_read(notification_id: int, user_id: int):
    connection = get_connection()

    try:
        cursor = connection.execute(
            """
            UPDATE notifications
            SET is_read = 1
            WHERE id = ?
              AND user_id = ?
            """,
            (notification_id, user_id)
        )

        connection.commit()

        if cursor.rowcount == 0:
            return {
                "success": False,
                "message": "Notification not found"
            }

        return {
            "success": True,
            "message": "Notification marked as read"
        }

    except Exception as error:
        connection.rollback()

        return {
            "success": False,
            "message": str(error)
        }

    finally:
        connection.close()


@router.delete("/api/notifications/{notification_id}")
def delete_notification(notification_id: int, user_id: int):
    connection = get_connection()

    try:
        cursor = connection.execute(
            """
            DELETE FROM notifications
            WHERE id = ?
              AND user_id = ?
            """,
            (notification_id, user_id)
        )

        connection.commit()

        if cursor.rowcount == 0:
            return {
                "success": False,
                "message": "Notification not found"
            }

        return {
            "success": True,
            "message": "Notification deleted successfully"
        }

    except Exception as error:
        connection.rollback()

        return {
            "success": False,
            "message": str(error)
        }

    finally:
        connection.close()
