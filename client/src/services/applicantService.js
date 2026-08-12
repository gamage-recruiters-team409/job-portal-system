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
 *
 * @returns {Promise<object>} The raw `data` envelope from the API response.
 */
export const getApplicants = async ({ jobId, status, search, page, limit } = {}) => {
  const { data } = await apiClient.get('/applicants', {
    params: {
      ...(jobId   && { jobId }),
      ...(status  && { status }),
      ...(search  && { search }),
      ...(page    && { page }),
      ...(limit   && { limit }),
    },
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
