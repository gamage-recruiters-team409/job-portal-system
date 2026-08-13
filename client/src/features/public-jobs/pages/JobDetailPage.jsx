import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJob } from '../../../services/jobService.js';
import { getCategories, getSkills } from '../../../services/referenceService.js';
import { applyToJob } from '../../../services/applicationService.js';
import { formatSalary, timeAgo, formatExperience, titleCase } from '../utils/format.js';
import JobCard from '../../../components/jobs/JobCard.jsx';
import LoadingState from '../../../components/jobs/LoadingState.jsx';
import ApplyJobModal from '../../../components/jobs/ApplyJobModal.jsx';
import ApplicationSubmittedModal from '../../../components/jobs/ApplicationSubmittedModal.jsx';

/**
 * @file JobDetailPage.jsx
 * @description Single Public Job detail view. Shows complete job information,
 * company info, apply call-to-action, and up to 4 similar job recommendations.
 * Owned by Bimsara.
 */
export default function JobDetailPage() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [skillsMap, setSkillsMap] = useState({});
  const [categoriesMap, setCategoriesMap] = useState({});

  // Apply Job modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    async function loadReferenceData() {
      try {
        const [cats, sks] = await Promise.all([
          getCategories().catch(() => []),
          getSkills().catch(() => []),
        ]);

        // Normalise to a { name } shape so consumers use one field.
        // The API returns categoryName / skillName (not `name`).
        const catMap = {};

        cats.forEach((c) => {
          catMap[c._id] = {
            name: c.categoryName,
          };
        });

        setCategoriesMap(catMap);

        const skMap = {};

        sks.forEach((s) => {
          skMap[s._id] = {
            name: s.skillName,
          };
        });

        setSkillsMap(skMap);
      } catch (err) {
        console.error('Failed to load reference data:', err);
      }
    }

    loadReferenceData();
  }, []);

  useEffect(() => {
    async function fetchJobDetail() {
      setLoading(true);
      setError(null);

      try {
        const res = await getJob(id);

        setJob(res.job);
        setSimilar(res.similar ?? []);
      } catch (err) {
        console.error('Error fetching job details:', err);

        setError(
          err?.response?.data?.message ||
            'Job not found or no longer available.'
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchJobDetail();
    }
  }, [id]);

  function handleOpenApplyModal() {
    setApplyError('');
    setShowApplyModal(true);
  }

  function handleCloseApplyModal() {
    if (submitting) return;

    setShowApplyModal(false);
    setApplyError('');
  }

  function handleCloseSubmittedModal() {
    setShowSubmittedModal(false);
  }

  async function handleApply(coverLetter) {
    try {
      setSubmitting(true);
      setApplyError('');

      await applyToJob(job._id, coverLetter);

      // Application submitted successfully
      setShowApplyModal(false);
      setShowSubmittedModal(true);
    } catch (err) {
      console.error('Error submitting application:', err);

      setApplyError(
        err?.response?.data?.message ||
          'Failed to submit application. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState label="Loading job details…" />;
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
          <h2 className="text-lg font-bold text-red-800">
            Job Unavailable
          </h2>

          <p className="mt-2 text-sm text-red-600">
            {error || 'Job not found.'}
          </p>

          <Link
            to="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            ← Back to all jobs
          </Link>
        </div>
      </div>
    );
  }

  const company = job.companyId ?? {};
  const companyName = company.companyName ?? 'Company';

  const categoryName =
    categoriesMap[job.category]?.name || 'General';

  const salaryText = formatSalary(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency
  );

  const skillNames = (job.skills ?? []).map(
    (skId) => skillsMap[skId]?.name || skId
  );

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
          >
            ← Back to jobs
          </Link>
        </div>

        {/* Main Job Details Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Job Overview & Main Details */}
          <div className="space-y-8 lg:col-span-2">
            {/* Hero Banner Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  {company.companyLogo ? (
                    <img
                      src={company.companyLogo}
                      alt={companyName}
                      className="h-16 w-16 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl font-bold text-blue-700">
                      {companyName.charAt(0)}
                    </span>
                  )}

                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                      {job.title}
                    </h1>

                    <p className="mt-1 text-base font-medium text-slate-600">
                      {companyName}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        📍 {job.location}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        💼 {titleCase(job.jobType)}
                      </span>

                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        🏠 {titleCase(job.workMode)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                  {/* Apply Now */}
                  <button
                    type="button"
                    onClick={handleOpenApplyModal}
                    className="w-full rounded-xl bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white shadow transition-colors hover:bg-blue-700 sm:w-auto"
                  >
                    Apply Now
                  </button>

                  <p className="text-xs text-slate-400">
                    Posted {timeAgo(job.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Job Description
                </h3>

                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {job.description}
                </p>
              </div>

              {job.responsibilities && (
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Key Responsibilities
                  </h3>

                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {job.responsibilities}
                  </p>
                </div>
              )}

              {job.requirements && (
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Requirements & Qualifications
                  </h3>

                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {job.requirements}
                  </p>
                </div>
              )}

              {job.benefits && (
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Benefits & Perks
                  </h3>

                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                    {job.benefits}
                  </p>
                </div>
              )}

              {skillNames.length > 0 && (
                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-sm font-bold text-slate-900">
                    Required Skills
                  </h3>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {skillNames.map((name) => (
                      <span
                        key={name}
                        className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Key Job Facts */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">
                Job Summary
              </h3>

              <dl className="mt-4 divide-y divide-slate-100 text-sm">
                <div className="flex justify-between py-3">
                  <dt className="text-slate-500">Offered Salary</dt>
                  <dd className="font-semibold text-slate-900">
                    {salaryText}
                  </dd>
                </div>

                <div className="flex justify-between py-3">
                  <dt className="text-slate-500">Experience</dt>
                  <dd className="font-semibold text-slate-900">
                    {formatExperience(job.experienceYears)}
                  </dd>
                </div>

                <div className="flex justify-between py-3">
                  <dt className="text-slate-500">Job Category</dt>
                  <dd className="font-semibold text-slate-900">
                    {categoryName}
                  </dd>
                </div>

                {job.deadline && (
                  <div className="flex justify-between py-3">
                    <dt className="text-slate-500">
                      Application Deadline
                    </dt>

                    <dd className="font-semibold text-slate-900">
                      {new Date(job.deadline).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between py-3">
                  <dt className="text-slate-500">Views</dt>

                  <dd className="font-semibold text-slate-900">
                    {job.viewsCount ?? 0}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Company Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">
                About the Employer
              </h3>

              <div className="mt-4 flex items-center gap-3">
                {company.companyLogo ? (
                  <img
                    src={company.companyLogo}
                    alt={companyName}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 font-bold text-blue-700">
                    {companyName.charAt(0)}
                  </span>
                )}

                <div>
                  <p className="font-semibold text-slate-900">
                    {companyName}
                  </p>

                  {company.companyLocation && (
                    <p className="text-xs text-slate-500">
                      📍 {company.companyLocation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Jobs Section */}
        {similar.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-10">
            <h2 className="text-xl font-bold text-slate-900">
              Similar Job Openings
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((simJob) => (
                <JobCard
                  key={simJob._id}
                  job={simJob}
                  skillsMap={skillsMap}
                  categoriesMap={categoriesMap}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply Job Modal */}
      {showApplyModal && (
        <ApplyJobModal
          job={job}
          onClose={handleCloseApplyModal}
          onSubmit={handleApply}
          submitting={submitting}
          error={applyError}
        />
      )}

      {/* Application Submitted Modal */}
      {showSubmittedModal && (
        <ApplicationSubmittedModal
          job={job}
          onClose={handleCloseSubmittedModal}
        />
      )}
    </>
  );
}