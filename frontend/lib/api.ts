import axios from 'axios';
import { Blueprint } from '@/types/blueprint';

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function generateBlueprint(
  idea: string,
  sessionId?: string
): Promise<{ session_id: string; blueprint: Blueprint }> {
  const res = await axios.post(`${BASE}/api/generate`, {
    idea,
    session_id: sessionId ?? null,
  });
  return res.data;
}

export async function sendFollowUp(
  sessionId: string,
  question: string
): Promise<string> {
  const res = await axios.post(`${BASE}/api/followup`, {
    session_id: sessionId,
    question,
  });
  return res.data.answer;
}

export function exportUrl(sessionId: string, format: 'pdf' | 'docx'): string {
  return `${BASE}/api/export`;
}

export async function downloadExport(
  sessionId: string,
  format: 'pdf' | 'docx'
): Promise<void> {
  const res = await axios.post(
    `${BASE}/api/export`,
    { session_id: sessionId, format },
    { responseType: 'blob' }
  );
  const mimeType =
    format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const ext = format === 'pdf' ? 'pdf' : 'docx';
  const blob = new Blob([res.data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `startup-blueprint.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
