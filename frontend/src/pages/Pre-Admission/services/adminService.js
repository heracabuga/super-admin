import api from "./api";

export const getApplicants = () => api.get("/admin/applicants");
export const createApplicant = (data) => api.post("/admin/applicants", data);
export const updateApplicantStatus = (id, status) =>
    api.put(`/admin/applicant/${id}/status`, { status });
export const unlockApplicant = (id) => api.put(`/admin/applicant/${id}/unlock`);
export const acceptApplication = (id) => api.put(`/admin/applicant/${id}/accept-application`);
export const deleteApplicant = (id) => api.delete(`/admin/applicant/${id}`);
export const reassignProgram = (id, newProgram) =>
    api.put(`/admin/applicant/${id}/reassign-program`, { newProgram });
export const importScores = (formData) =>
    api.post("/admin/applicants/import-scores", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    });
export const getSettings = () => api.get('/admin/settings');
export const getRubric = () => api.get('/admin/rubric');
export const saveRubric = (rubricData) => api.put('/admin/rubric', rubricData);
export const bulkUpdateStatus = (applicantIds, status) =>
    api.put("/admin/applicants/bulk-status", { applicantIds, status });
export const encodeScore = async(id, score, ratings, interviewDate, interviewer) => {
    return await api.put(`/admin/applicant/${id}/score`, {
        score,
        ratings,
        interviewDate,
        interviewer
    });
};

export const getCourses = () => api.get("/admin/courses");
export const getInstitutes = () => api.get("/admin/institutes");
export const fixMissingSections = () => api.get("/admin/utilities/fix-missing-sections");
export const backfillActivePrograms = () => api.get("/admin/utilities/backfill-active-programs");