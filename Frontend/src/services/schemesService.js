import { apiHttp } from "../lib/auth";
import { normalizeList } from "../lib/normalize";

export async function getSchemes(params = {}) {
  try {
    const response = await apiHttp.get("/schemes/", { params });
    return normalizeList(response.data);
  } catch {
    return [];
  }
}

export async function createScheme(payload) {
  const response = await apiHttp.post("/schemes/", payload);
  return response.data;
}

export async function updateScheme(id, payload) {
  const response = await apiHttp.patch(`/schemes/${id}/`, payload);
  return response.data;
}

export async function deleteScheme(id) {
  await apiHttp.delete(`/schemes/${id}/`);
}

export async function approveScheme(id, feedback) {
  const response = await apiHttp.patch(`/schemes/${id}/approve/`, { feedback });
  return response.data;
}

export async function requestRevision(id, feedback) {
  const response = await apiHttp.patch(`/schemes/${id}/request-revision/`, { feedback });
  return response.data;
}
