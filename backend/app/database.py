import sqlite3
import os
from datetime import datetime
from pathlib import Path

IS_VERCEL = os.environ.get("VERCEL") == "1" or os.environ.get("AWS_LAMBDA_FUNCTION_NAME") is not None

if IS_VERCEL:
    DB_DIR = Path("/tmp")
else:
    DB_DIR = Path(__file__).resolve().parent.parent
DB_PATH = DB_DIR / "app.db"


def get_connection():
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            jira_id TEXT NOT NULL,
            document_type TEXT NOT NULL,
            title TEXT,
            content TEXT,
            file_path TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def save_history(jira_id: str, document_type: str, title: str, content: str, file_path: str = ""):
    conn = get_connection()
    now = datetime.utcnow().isoformat()
    conn.execute(
        "INSERT INTO history (jira_id, document_type, title, content, file_path, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        (jira_id, document_type, title, content, file_path, now, now),
    )
    conn.commit()
    conn.close()


def get_history(limit: int = 50):
    conn = get_connection()
    rows = conn.execute(
        "SELECT * FROM history ORDER BY created_at DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_history_by_id(history_id: int):
    conn = get_connection()
    row = conn.execute("SELECT * FROM history WHERE id = ?", (history_id,)).fetchone()
    conn.close()
    return dict(row) if row else None


def delete_history(history_id: int):
    conn = get_connection()
    conn.execute("DELETE FROM history WHERE id = ?", (history_id,))
    conn.commit()
    conn.close()


def get_dashboard_stats():
    conn = get_connection()
    total = conn.execute("SELECT COUNT(*) as count FROM history").fetchone()["count"]
    last = conn.execute("SELECT * FROM history ORDER BY created_at DESC LIMIT 1").fetchone()
    recent = conn.execute("SELECT * FROM history ORDER BY created_at DESC LIMIT 5").fetchall()
    conn.close()
    return {
        "total_documents": total,
        "last_document": dict(last) if last else None,
        "recent_activities": [dict(r) for r in recent],
    }
