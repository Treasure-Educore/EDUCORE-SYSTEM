import { apiHttp } from "../lib/auth";

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

function normalizeList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return [];
}

export async function getFees(params = {}) {
  const payload = await request("/fees/", { params });
  return normalizeList(payload);
}

export async function recordPayment(payload) {
  return request("/fees/payments/", { method: "POST", data: payload });
}

export async function getFeeStructures(params = {}) {
  const payload = await request("/fee-structures/", { params });
  return normalizeList(payload);
}
