import { apiHttp } from "../lib/auth";
import { normalizeList } from "../lib/normalize";

export async function getPortfolios(params = {}) {
  const response = await apiHttp.get("/portfolios/", { params });
  return normalizeList(response.data);
}

export async function createPortfolioItem(payload) {
  const response = await apiHttp.post("/portfolios/", payload);
  return response.data;
}

export async function updatePortfolioItem(id, payload) {
  const response = await apiHttp.patch(`/portfolios/${id}/`, payload);
  return response.data;
}
