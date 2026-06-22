from fastapi import APIRouter, HTTPException
from app.database import get_history, get_history_by_id, delete_history, get_dashboard_stats
from app.services.export_service import export_service

router = APIRouter(prefix="/api/history", tags=["History"])


@router.get("")
def list_history():
    return get_history(50)


@router.get("/dashboard")
def dashboard():
    stats = get_dashboard_stats()
    return stats


@router.get("/{history_id}")
def get_item(history_id: int):
    item = get_history_by_id(history_id)
    if not item:
        raise HTTPException(status_code=404, detail="History item not found")
    return item


@router.delete("/{history_id}")
def remove_item(history_id: int):
    delete_history(history_id)
    return {"success": True, "message": "History item deleted"}


@router.post("/{history_id}/export")
def export_item(history_id: int, body: dict):
    item = get_history_by_id(history_id)
    if not item:
        raise HTTPException(status_code=404, detail="History item not found")
    fmt = body.get("format", "markdown")
    content = item["content"]
    filename = f"{item['jira_id']}_{item['document_type'].replace(' ', '_')}"

    if fmt == "markdown":
        path = export_service.export_markdown(content, filename)
    elif fmt == "pdf":
        path = export_service.export_pdf(content, filename)
    elif fmt == "docx":
        path = export_service.export_docx(content, filename)
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported format: {fmt}")

    if not path:
        raise HTTPException(status_code=500, detail="Export failed")

    return {"file_path": path, "format": fmt, "filename": f"{filename}.{fmt}"}
