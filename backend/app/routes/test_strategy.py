from fastapi import APIRouter, HTTPException
from app.models.schemas import TestStrategyRequest
from app.services.document_service import generate_test_strategy
from app.services.export_service import export_service
from app.database import save_history

router = APIRouter(prefix="/api/test-strategy", tags=["Test Strategy"])


@router.post("/generate")
def generate(body: TestStrategyRequest):
    if not body.jira_id:
        raise HTTPException(status_code=400, detail="JIRA ID is required")
    content = generate_test_strategy(body.jira_id, body.test_type, body.environment, body.release_version)
    if not content:
        raise HTTPException(status_code=500, detail="Failed to generate document. Check API configuration.")
    title = f"Test Strategy - {body.jira_id}"
    save_history(body.jira_id, "Test Strategy", title, content)
    return {"content": content, "title": title, "jira_id": body.jira_id}


@router.post("/export")
def export(body: dict):
    content = body.get("content", "")
    fmt = body.get("format", "markdown")
    filename = body.get("filename", "test-strategy")
    if not content:
        raise HTTPException(status_code=400, detail="Content is required")

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
