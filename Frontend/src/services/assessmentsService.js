import { apiHttp } from "../lib/auth";
import { normalizeList } from "../lib/normalize";

export async function getCARecords(params = {}) {
  try {
    const response = await apiHttp.get("/assessments/", { params });
    return normalizeList(response.data);
  } catch {
    return [];
  }
}

export async function bulkSubmit(payload) {
  try {
    const response = await apiHttp.post("/assessments/bulk/", payload);
    return response.data;
  } catch {
    return null;
  }
}
