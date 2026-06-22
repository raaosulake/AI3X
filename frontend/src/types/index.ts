export interface Settings {
  jira_base_url: string;
  jira_username: string;
  jira_api_token: string;
  jira_default_project: string;
  groq_api_key: string;
  groq_model: string;
  blast_file_path: string;
}

export interface TestStrategyRequest {
  jira_id: string;
  test_type: string;
  environment: string;
  release_version: string;
}

export interface TestPlanRequest {
  jira_id: string;
  sprint: string;
  release: string;
}

export interface RCARequest {
  jira_id: string;
  defect_id: string;
  failure_logs: string;
  error_message: string;
  analysis_type: string;
}

export interface JIRAIssue {
  key: string;
  summary: string;
  description: string;
  status: string;
  priority: string;
  issuetype: string;
  project: string;
  project_name: string;
  assignee: string;
  reporter: string;
  created: string;
  updated: string;
  labels: string[];
  fix_versions: string[];
  components: string[];
}

export interface HistoryItem {
  id: number;
  jira_id: string;
  document_type: string;
  title: string;
  content: string;
  file_path: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_documents: number;
  last_document: HistoryItem | null;
  recent_activities: HistoryItem[];
}

export interface TestConnectionResult {
  jira: boolean;
  groq: boolean;
  blast: boolean;
  jira_message: string;
  groq_message: string;
  blast_message: string;
}

export interface ExportResult {
  file_path: string;
  format: string;
  filename: string;
}
