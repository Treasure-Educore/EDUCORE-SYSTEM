import { apiHttp } from "../lib/auth";
import { normalizeList } from "../lib/normalize";

export async function getTimetableSlots(params = {}) {
  try {
    const response = await apiHttp.get("/timetable/slots/", { params });
    return normalizeList(response.data);
  } catch {
    return [];
  }
}

export async function createTimetableSlot(payload) {
  const response = await apiHttp.post("/timetable/slots/", payload);
  return response.data;
}

export async function updateTimetableSlot(id, payload) {
  const response = await apiHttp.patch(`/timetable/slots/${id}/`, payload);
  return response.data;
}

export async function deleteTimetableSlot(id) {
  await apiHttp.delete(`/timetable/slots/${id}/`);
}

export async function getTimetablePeriods() {
  try {
    const response = await apiHttp.get("/timetable/periods/");
    return normalizeList(response.data);
  } catch {
    return [];
  }
}
