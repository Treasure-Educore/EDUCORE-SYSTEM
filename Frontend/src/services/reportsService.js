import { apiHttp } from "../lib/auth";
import { normalizeList } from "../lib/normalize";

async function request(path, options = {}) {
  const response = await apiHttp.request({
    url: path,
    method: options.method || "GET",
    data: options.data,
    params: options.params,
    headers: options.headers,
  });

  return response.status === 204 ? null : response.data;
}

export async function getReportCard(studentId, termId) {
  if (!studentId) return null;
  try {
    const payload = await request(`/reports/student/${studentId}/`, { params: { termId } });
    return payload || null;
  } catch {
    return null;
  }
}

export async function downloadReportCardPDF(studentId, termId) {
  if (!studentId) return null;
  return request(`/reports/student/${studentId}/download/`, { params: { termId }, method: "GET" });
}
