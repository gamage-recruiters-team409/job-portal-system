import apiClient from './apiClient.js';

/**
 * Fetch a paginated, filtered list of applicants for the authenticated employer.
 *
 * Query parameters (all optional — omit to get defaults from the backend):
 *   @param {string}  [jobId]   - Filter by a specific job posting ID.
 *   @param {string}  [status]  - One of: applied | under_review | shortlisted | selected | rejected | withdrawn
 *   @param {string}  [search]  - Free-text search against applicant name / email.
 *   @param {number}  [page]    - 1-based page number.
 *   @param {number}  [limit]   - Items per page.
 *   @param {AbortSignal} [signal] - Optional AbortSignal to cancel the request.
 *
 * @returns {Promise<object>} The raw `data` envelope from the API response.
 */
export const getApplicants = async ({ jobId, status, search, page, limit, signal } = {}) => {
  const { data } = await apiClient.get('/applicants', {
    params: {
      ...(jobId && { jobId }),
      ...(status && { status }),
      ...(search && { search }),
      ...(page && { page }),
      ...(limit && { limit }),
    },
    signal, // <--- This passes the abort signal to axios
  });

  return data;
};

/**
 * Fetch a single applicant / application record by its ID.
 *
 * @param {string} applicantId - The application document ID.
 * @returns {Promise<object>} The raw `data` envelope from the API response.
 */
export const getApplicantById = async (applicantId) => {
  const { data } = await apiClient.get(`/applicants/${applicantId}`);

  return data;
};

/**
 * Fetch the authenticated employer's own job listings (Disura's endpoint).
 * Used to populate the "Job" filter dropdown on the Applicant List page.
 *
 * Endpoint: GET /api/v1/employer/jobs
 * Auth:     Bearer token (employer role required)
 *
 * @returns {Promise<object>} The raw `data` envelope — array of jobs with
 *                            at minimum { _id, title } per item.
 */
export const getEmployerJobs = async () => {
  const { data } = await apiClient.get('/employer/jobs');

  return data;
};

/**
 * Generic status update for an application.
 *
 * @param {string} applicationId - The application document ID.
 * @param {object} payload - { status, note }
 * @returns {Promise<object>}
 */
export const updateApplicantStatus = async (applicationId, { status, note } = {}) => {
  const { data } = await apiClient.patch(`/applicants/${applicationId}/status`, {
    status,
    ...(note !== undefined && note !== '' && { note }),
  });

  return data;
};

/**
 * Shortlist an applicant convenience function.
 *
 * @param {string} applicationId - The application document ID.
 * @param {object} payload - { note }
 * @returns {Promise<object>}
 */
export const shortlistApplicant = async (applicationId, { note } = {}) => {
  const { data } = await apiClient.patch(`/applicants/${applicationId}/shortlist`, {
    ...(note !== undefined && note !== '' && { note }),
  });

  return data;
};

/**
 * Reject an applicant convenience function.
 *
 * @param {string} applicationId - The application document ID.
 * @param {object} payload - { note }
 * @returns {Promise<object>}
 */
export const rejectApplicant = async (applicationId, { note } = {}) => {
  const { data } = await apiClient.patch(`/applicants/${applicationId}/reject`, {
    ...(note !== undefined && note !== '' && { note }),
  });

  return data;
};

/**
 * Fetch a short-lived signed CV download URL for an applicant.
 *
 * @param {string} applicationId - The application document ID.
 * @returns {Promise<object>} The raw `data` envelope containing { downloadUrl, expiresAt, fileName }.
 */
export const getApplicantCv = async (applicationId) => {
  const { data } = await apiClient.get(`/applicants/${applicationId}/cv`);

  return data;
};
