from fastapi import APIRouter, HTTPException
from app.config import settings
from app.models.schemas import SettingsUpdate
from app.services.jira_service import jira_service
from app.services.groq_service import groq_service
from app.services.blast_parser import blast_parser

router = APIRouter(prefix="/api/settings", tags=["Settings"])


@router.get("")
def get_settings():
    return settings.to_dict()


@router.post("")
def update_settings(body: SettingsUpdate):
    if body.jira_base_url is not None:
        settings.jira_base_url = body.jira_base_url
    if body.jira_username is not None:
        settings.jira_username = body.jira_username
    if body.jira_api_token is not None:
        settings.jira_api_token = body.jira_api_token
    if body.jira_default_project is not None:
        settings.jira_default_project = body.jira_default_project
    if body.groq_api_key is not None:
        settings.groq_api_key = body.groq_api_key
    if body.groq_model is not None:
        settings.groq_model = body.groq_model
    if body.blast_file_path is not None:
        settings.blast_file_path = body.blast_file_path
    settings.save()
    return {"success": True, "message": "Settings saved successfully", "settings": settings.to_dict()}


@router.post("/test-connection")
def test_connection():
    jira_result = jira_service.test_connection()
    groq_result = groq_service.test_connection()
    blast_result = blast_parser.validate()

    return {
        "jira": jira_result["success"],
        "jira_message": jira_result["message"],
        "groq": groq_result["success"],
        "groq_message": groq_result["message"],
        "blast": blast_result["valid"],
        "blast_message": blast_result["message"],
    }


@router.get("/models")
def get_models():
    return {"models": groq_service.get_available_models()}
