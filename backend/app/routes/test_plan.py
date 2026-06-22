from fastapi import APIRouter, HTTPException
from app.models.schemas import TestPlanRequest
from app.services.document_service import generate_test_plan
from app.services.export_service import export_service
from app.database import save_history

router = APIRouter(prefix="/api/test-plan", tags=["Test Plan"])


@router.post("/generate")
def generate(body: TestPlanRequest):
    if not body.jira_id:
        raise HTTPException(status_code=400, detail="JIRA ID is required")
    content = generate_test_plan(body.jira_id, body.sprint, body.release)
    if not content:
        raise HTTPException(status_code=500, detail="Failed to generate document. Check API configuration.")
    title = f"Test Plan - {body.jira_id}"
    save_history(body.jira_id, "Test Plan", title, content)
    return {"content": content, "title": title, "jira_id": body.jira_id}


@router.post("/export")
def export(body: dict):
    content = body.get("content", "")
    fmt = body.get("format", "markdown")
    filename = body.get("filename", "test-plan")
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
