import { apiHttp } from "../lib/auth";

export async function getAnalyticsSummary() {
  const response = await apiHttp.get("/analytics/summary/");
  return response.data || {};
}
