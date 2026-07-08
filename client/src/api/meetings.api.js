import api from "./axios";

export const meetingsAPI = {
  getMeetings() {
    return api.get("/meetings");
  },

  getMeeting(id) {
    return api.get(`/meetings/${id}`);
  },

  createMeeting(data) {
    return api.post("/meetings", data);
  },

  updateMeeting(id, data) {
    return api.patch(`/meetings/${id}`, data);
  },

  deleteMeeting(id) {
    return api.delete(`/meetings/${id}`);
  },
};