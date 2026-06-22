import requests
from typing import Optional, Dict, Any
from app.config import settings


class JIRAService:
    def __init__(self):
        self.base_url = settings.jira_base_url.rstrip("/") if settings.jira_base_url else ""
        self.username = settings.jira_username
        self.api_token = settings.jira_api_token
        self.session = requests.Session()
        if self.username and self.api_token:
            self.session.auth = (self.username, self.api_token)
        self.session.headers.update({"Accept": "application/json", "Content-Type": "application/json"})

    def is_configured(self) -> bool:
        return bool(self.base_url and self.username and self.api_token)

    def test_connection(self) -> Dict[str, Any]:
        if not self.is_configured():
            return {"success": False, "message": "JIRA not configured. Set credentials in Settings."}
        try:
            resp = self.session.get(f"{self.base_url}/rest/api/3/myself", timeout=10)
            if resp.status_code == 200:
                data = resp.json()
                return {"success": True, "message": f"Connected as {data.get('displayName', data.get('emailAddress', 'Unknown'))}"}
            return {"success": False, "message": f"JIRA API error: {resp.status_code} - {resp.text[:200]}"}
        except requests.exceptions.RequestException as e:
            return {"success": False, "message": f"Connection failed: {str(e)}"}

    def get_issue(self, issue_key: str) -> Optional[Dict[str, Any]]:
        if not self.is_configured():
            return None
        try:
            resp = self.session.get(f"{self.base_url}/rest/api/3/issue/{issue_key}", timeout=15)
            if resp.status_code == 200:
                return resp.json()
            return None
        except requests.exceptions.RequestException:
            return None

    def get_issue_details(self, issue_key: str) -> Dict[str, Any]:
        issue = self.get_issue(issue_key)
        if not issue:
            return {"error": "Issue not found or JIRA not configured", "issue_key": issue_key}

        fields = issue.get("fields", {})
        project = fields.get("project", {})
        issuetype = fields.get("issuetype", {})

        return {
            "key": issue.get("key", issue_key),
            "summary": fields.get("summary", "Information Not Available"),
            "description": fields.get("description", "Information Not Available"),
            "status": fields.get("status", {}).get("name", "Information Not Available"),
            "priority": fields.get("priority", {}).get("name", "Information Not Available"),
            "issuetype": issuetype.get("name", "Information Not Available"),
            "project": project.get("key", "Information Not Available"),
            "project_name": project.get("name", "Information Not Available"),
            "assignee": fields.get("assignee", {}).get("displayName", "Unassigned") if fields.get("assignee") else "Unassigned",
            "reporter": fields.get("reporter", {}).get("displayName", "Information Not Available") if fields.get("reporter") else "Information Not Available",
            "created": fields.get("created", "Information Not Available"),
            "updated": fields.get("updated", "Information Not Available"),
            "labels": fields.get("labels", []),
            "fix_versions": [v.get("name", "") for v in fields.get("fixVersions", [])],
            "components": [c.get("name", "") for c in fields.get("components", [])],
        }

    def get_comments(self, issue_key: str) -> list:
        if not self.is_configured():
            return []
        try:
            resp = self.session.get(f"{self.base_url}/rest/api/3/issue/{issue_key}/comment", timeout=10)
            if resp.status_code == 200:
                return resp.json().get("comments", [])
            return []
        except requests.exceptions.RequestException:
            return []

    def get_attachments(self, issue_key: str) -> list:
        if not self.is_configured():
            return []
        try:
            resp = self.session.get(f"{self.base_url}/rest/api/3/issue/{issue_key}", timeout=10)
            if resp.status_code == 200:
                fields = resp.json().get("fields", {})
                return fields.get("attachment", [])
            return []
        except requests.exceptions.RequestException:
            return []

    def get_linked_issues(self, issue_key: str) -> list:
        if not self.is_configured():
            return []
        try:
            resp = self.session.get(f"{self.base_url}/rest/api/3/issue/{issue_key}", timeout=10)
            if resp.status_code == 200:
                fields = resp.json().get("fields", {})
                links = []
                for link in fields.get("issuelinks", []):
                    if link.get("outwardIssue"):
                        links.append({
                            "key": link["outwardIssue"]["key"],
                            "summary": link["outwardIssue"].get("fields", {}).get("summary", ""),
                            "type": link.get("type", {}).get("outward", "Related"),
                        })
                    elif link.get("inwardIssue"):
                        links.append({
                            "key": link["inwardIssue"]["key"],
                            "summary": link["inwardIssue"].get("fields", {}).get("summary", ""),
                            "type": link.get("type", {}).get("inward", "Related"),
                        })
                return links
            return []
        except requests.exceptions.RequestException:
            return []


jira_service = JIRAService()
