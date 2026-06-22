from typing import Optional, Dict, Any
from app.services.jira_service import jira_service
from app.services.groq_service import groq_service
from app.services.blast_parser import blast_parser


SYSTEM_PROMPT_BASE = """You are a professional QA Documentation Generator for enterprise software testing teams.
You generate comprehensive, well-structured QA documents using the B.L.A.S.T. methodology framework.

## Core Rules:
1. NEVER hallucinate or invent project-specific details.
2. Use ONLY the data provided in the context.
3. If information is missing, state "Information Not Available" clearly.
4. Use concise, professional language suitable for enterprise testing teams.
5. Structure documents with clear headings, bullet points, and tables where appropriate.
6. Follow the B.L.A.S.T. methodology principles: Blueprint (planning), Link (connectivity), Architect (structure), Stylize (refinement), Trigger (deployment).
7. Generate deterministic, actionable content - never vague or generic statements.

## B.L.A.S.T. Context:
{BLAST_CONTENT}
"""


def generate_test_strategy(jira_id: str, test_type: str, environment: str, release_version: str) -> Optional[str]:
    blast_parser.load()
    jira_details = jira_service.get_issue_details(jira_id)

    blast_context = blast_parser.get_context(4000)
    jira_context = _format_jira_context(jira_details)
    comments = jira_service.get_comments(jira_id)
    comments_text = "\n".join([f"- {c.get('body', '')[:200]}" for c in comments[:5]])

    system_prompt = SYSTEM_PROMPT_BASE.format(BLAST_CONTENT=blast_context)

    user_prompt = f"""Generate a comprehensive Test Strategy document based on the following inputs:

## JIRA Issue Details
{jira_context}

## Comments (Top 5)
{comments_text if comments_text else "Information Not Available"}

## User Inputs
- Test Type: {test_type}
- Target Environment: {environment}
- Release Version: {release_version if release_version else "Information Not Available"}

## Document Structure Required
Generate a Test Strategy with these sections (use all available data, mark missing as "Information Not Available"):

1. **Scope** - What is in scope and out of scope for testing
2. **Objectives** - Testing goals and success criteria
3. **Testing Types** - Types of testing to be performed (functional, regression, integration, etc.)
4. **Test Environment** - Environment requirements and configuration
5. **Entry Criteria** - Conditions that must be met before testing begins
6. **Exit Criteria** - Conditions that must be met to conclude testing
7. **Risks** - Potential risks and mitigation strategies
8. **Deliverables** - Test artifacts to be delivered
9. **Resource Planning** - Team roles and responsibilities
10. **Schedule** - Timeline and milestones

Format in clean Markdown suitable for export."""

    return groq_service.generate(system_prompt, user_prompt)


def generate_test_plan(jira_id: str, sprint: str, release: str) -> Optional[str]:
    blast_parser.load()
    jira_details = jira_service.get_issue_details(jira_id)

    blast_context = blast_parser.get_context(4000)
    jira_context = _format_jira_context(jira_details)
    comments = jira_service.get_comments(jira_id)
    comments_text = "\n".join([f"- {c.get('body', '')[:200]}" for c in comments[:5]])
    linked_issues = jira_service.get_linked_issues(jira_id)
    linked_text = "\n".join([f"- {li['key']}: {li['summary']} ({li['type']})" for li in linked_issues[:10]])

    system_prompt = SYSTEM_PROMPT_BASE.format(BLAST_CONTENT=blast_context)

    user_prompt = f"""Generate a comprehensive Test Plan document based on the following inputs:

## JIRA Issue Details
{jira_context}

## Comments (Top 5)
{comments_text if comments_text else "Information Not Available"}

## Linked Issues
{linked_text if linked_text else "Information Not Available"}

## User Inputs
- Sprint: {sprint if sprint else "Information Not Available"}
- Release: {release if release else "Information Not Available"}

## Document Structure Required
Generate a Test Plan with these sections (use all available data, mark missing as "Information Not Available"):

1. **Features to Test** - List of features and functionalities to be tested
2. **Features Not to Test** - Explicitly excluded features with rationale
3. **Test Approach** - Overall testing strategy and methodology
4. **Test Scenarios** - High-level test scenarios with descriptions
5. **Test Data Requirements** - Data needed for testing
6. **Test Environment** - Environment setup and configuration details
7. **Test Deliverables** - Documents, reports, and artifacts to be produced
8. **Resource Allocation** - Team members, tools, and their responsibilities
9. **Risk Analysis** - Risk identification, impact, and mitigation

Format in clean Markdown suitable for export."""

    return groq_service.generate(system_prompt, user_prompt)


def generate_rca(jira_id: str, defect_id: str, failure_logs: str, error_message: str, analysis_type: str = "standard") -> Optional[str]:
    blast_parser.load()
    jira_details = jira_service.get_issue_details(jira_id)

    blast_context = blast_parser.get_context(4000)
    jira_context = _format_jira_context(jira_details)

    system_prompt = SYSTEM_PROMPT_BASE.format(BLAST_CONTENT=blast_context)

    extra_instructions = ""
    if analysis_type == "5whys":
        extra_instructions = """
## 5 Whys Analysis
Include a detailed 5 Whys analysis section that traces the root cause by asking "Why?" five times, starting from the symptom and drilling down to the root cause.
"""
    elif analysis_type == "fishbone":
        extra_instructions = """
## Fishbone (Ishikawa) Analysis
Include a Fishbone diagram analysis that categorizes potential causes into: People, Process, Technology, Environment, Data, and External factors.
"""

    user_prompt = f"""Generate a comprehensive Root Cause Analysis (RCA) document based on the following inputs:

## JIRA Issue Details
{jira_context}

## Defect/RCA Details
- Defect ID: {defect_id if defect_id else "Information Not Available"}
- Failure Logs: {failure_logs if failure_logs else "Information Not Available"}
- Error Message: {error_message if error_message else "Information Not Available"}
- Analysis Type: {analysis_type}

## Document Structure Required
Generate an RCA with these sections (use all available data, mark missing as "Information Not Available"):

1. **Problem Statement** - Clear description of the issue
2. **Impact Analysis** - Business and technical impact assessment
3. **Root Cause** - Identified root cause(s) of the issue
4. **Contributing Factors** - Secondary factors that contributed
5. **Corrective Actions** - Immediate actions to fix the issue
6. **Preventive Actions** - Long-term measures to prevent recurrence
7. **Lessons Learned** - Key takeaways for the team
{extra_instructions}

Format in clean Markdown suitable for export."""

    return groq_service.generate(system_prompt, user_prompt)


def _format_jira_context(jira_details: Dict[str, Any]) -> str:
    if "error" in jira_details:
        return f"JIRA Details: {jira_details.get('error', 'Information Not Available')}"

    return f"""- Issue Key: {jira_details.get('key', 'Information Not Available')}
- Summary: {jira_details.get('summary', 'Information Not Available')}
- Description: {jira_details.get('description', 'Information Not Available')[:1000]}
- Status: {jira_details.get('status', 'Information Not Available')}
- Priority: {jira_details.get('priority', 'Information Not Available')}
- Issue Type: {jira_details.get('issuetype', 'Information Not Available')}
- Project: {jira_details.get('project', 'Information Not Available')} - {jira_details.get('project_name', '')}
- Assignee: {jira_details.get('assignee', 'Information Not Available')}
- Reporter: {jira_details.get('reporter', 'Information Not Available')}
- Created: {jira_details.get('created', 'Information Not Available')}
- Updated: {jira_details.get('updated', 'Information Not Available')}
- Labels: {', '.join(jira_details.get('labels', [])) if jira_details.get('labels') else 'None'}
- Fix Versions: {', '.join(jira_details.get('fix_versions', [])) if jira_details.get('fix_versions') else 'Information Not Available'}
- Components: {', '.join(jira_details.get('components', [])) if jira_details.get('components') else 'Information Not Available'}"""
