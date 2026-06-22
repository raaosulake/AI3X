from pydantic import BaseModel, Field
from typing import Optional, List


class SettingsUpdate(BaseModel):
    jira_base_url: Optional[str] = ""
    jira_username: Optional[str] = ""
    jira_api_token: Optional[str] = ""
    jira_default_project: Optional[str] = ""
    groq_api_key: Optional[str] = ""
    groq_model: Optional[str] = "mixtral-8x7b-32768"
    blast_file_path: Optional[str] = ""


class TestStrategyRequest(BaseModel):
    jira_id: str
    test_type: str = "Functional"
    environment: str = "QA"
    release_version: str = ""


class TestPlanRequest(BaseModel):
    jira_id: str
    sprint: str = ""
    release: str = ""


class RCARequest(BaseModel):
    jira_id: str
    defect_id: str = ""
    failure_logs: str = ""
    error_message: str = ""
    analysis_type: str = "standard"


class JIRAConnectRequest(BaseModel):
    base_url: str
    username: str
    api_token: str


class ExportRequest(BaseModel):
    content: str
    format: str = "markdown"
    filename: str = "document"


class TestConnectionResult(BaseModel):
    jira: bool = False
    groq: bool = False
    blast: bool = False
    jira_message: str = ""
    groq_message: str = ""
    blast_message: str = ""
