from fastapi import APIRouter, HTTPException
from app.services.jira_service import jira_service

router = APIRouter(prefix="/api/jira", tags=["JIRA"])


@router.get("/issue/{issue_key}")
def get_issue(issue_key: str):
    if not jira_service.is_configured():
        raise HTTPException(status_code=400, detail="JIRA not configured")
    details = jira_service.get_issue_details(issue_key)
    if "error" in details:
        raise HTTPException(status_code=404, detail=details["error"])
    comments = jira_service.get_comments(issue_key)
    attachments = jira_service.get_attachments(issue_key)
    linked = jira_service.get_linked_issues(issue_key)
    return {
        "details": details,
        "comments": comments[:10],
        "attachments": attachments[:5],
        "linked_issues": linked,
    }


@router.get("/{issue_key}/details")
def get_issue_details(issue_key: str):
    if not jira_service.is_configured():
        raise HTTPException(status_code=400, detail="JIRA not configured")
    details = jira_service.get_issue_details(issue_key)
    if "error" in details:
        raise HTTPException(status_code=404, detail=details["error"])
    return details
