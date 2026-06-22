import axios from 'axios';
import type {
  Settings,
  TestStrategyRequest,
  TestPlanRequest,
  RCARequest,
  DashboardStats,
  HistoryItem,
  TestConnectionResult,
  ExportResult,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export async function getSettings(): Promise<Settings> {
  const { data } = await api.get('/settings');
  return data;
}

export async function updateSettings(settings: Partial<Settings>): Promise<{ success: boolean; message: string; settings: Settings }> {
  const { data } = await api.post('/settings', settings);
  return data;
}

export async function testConnection(): Promise<TestConnectionResult> {
  const { data } = await api.post('/settings/test-connection');
  return data;
}

export async function getModels(): Promise<string[]> {
  const { data } = await api.get('/settings/models');
  return data.models;
}

export async function getJIRAIssue(issueKey: string): Promise<any> {
  const { data } = await api.get(`/jira/issue/${issueKey}`);
  return data;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const { data } = await api.get('/history/dashboard');
  return data;
}

export async function getHistory(): Promise<HistoryItem[]> {
  const { data } = await api.get('/history');
  return data;
}

export async function getHistoryItem(id: number): Promise<HistoryItem> {
  const { data } = await api.get(`/history/${id}`);
  return data;
}

export async function deleteHistoryItem(id: number): Promise<void> {
  await api.delete(`/history/${id}`);
}

export async function generateTestStrategy(request: TestStrategyRequest): Promise<{ content: string; title: string; jira_id: string }> {
  const { data } = await api.post('/test-strategy/generate', request);
  return data;
}

export async function exportTestStrategy(content: string, format: string, filename: string): Promise<ExportResult> {
  const { data } = await api.post('/test-strategy/export', { content, format, filename });
  return data;
}

export async function generateTestPlan(request: TestPlanRequest): Promise<{ content: string; title: string; jira_id: string }> {
  const { data } = await api.post('/test-plan/generate', request);
  return data;
}

export async function exportTestPlan(content: string, format: string, filename: string): Promise<ExportResult> {
  const { data } = await api.post('/test-plan/export', { content, format, filename });
  return data;
}

export async function generateRCA(request: RCARequest): Promise<{ content: string; title: string; jira_id: string }> {
  const { data } = await api.post('/rca/generate', request);
  return data;
}

export async function exportRCA(content: string, format: string, filename: string): Promise<ExportResult> {
  const { data } = await api.post('/rca/export', { content, format, filename });
  return data;
}

export async function exportHistoryItem(id: number, format: string): Promise<ExportResult> {
  const { data } = await api.post(`/history/${id}/export`, { format });
  return data;
}
