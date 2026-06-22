import { apiHttp } from "../lib/auth";

async function request(path, options = {}) {
  const response = await apiHttp.request({
    url: path,
    method: options.method || "GET",
    data: options.body ? JSON.parse(options.body) : undefined,
    headers: options.headers,
    skipAuthRefresh: options.skipAuthRefresh,
  });

  return response.status === 204 ? null : response.data;
}

export const api = {
  students: {
    list: () => request("/students/"),
    create: (payload) => request("/students/", { method: "POST", body: JSON.stringify(payload) }),
    update: (id, payload) => request(`/students/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
    remove: (id) => request(`/students/${id}/`, { method: "DELETE" }),
  },
  teachers: {
    list: () => request("/teachers/"),
  },
  classes: {
    list: () => request("/classes/"),
  },
  attendance: {
    list: () => request("/attendance/"),
  },
  exams: {
    list: () => request("/exams/"),
  },
  library: {
    list: () => request("/library/"),
  },
  reports: {
    list: () => request("/reports/"),
  },
};

export default api;
