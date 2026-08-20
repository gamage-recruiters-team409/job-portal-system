import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEmployerJobById } from '../../../services/jobService.js';
import { getMyCompany } from '../../../services/companyService.js';
import { getCategories, getSkills } from '../../../services/lookupService.js';

function titleCase(value) {
  if (!value) return '';
  return value
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatSalary(min, max, currency) {
  if (min == null && max == null) return 'Not specified';
  if (min != null && max != null)
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min != null) return `${currency} ${min.toLocaleString()}+`;
  return `Up to ${currency} ${max.toLocaleString()}`;
}

export default function JobPreviewPage() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [company, setCompany] = useState(null);
  const [categoryName, setCategoryName] = useState('General');
  const [skillNames, setSkillNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [jobRes, companyRes, categoriesRes, skillsRes] = await Promise.all([
          getEmployerJobById(jobId),
          getMyCompany().catch(() => ({ data: { company: null } })),
          getCategories(),
          getSkills(),
        ]);

        const fetchedJob = jobRes.data.job;
        setJob(fetchedJob);
        setCompany(companyRes.data.company);

        const categories = categoriesRes.data.categories || [];
        const matchedCategory = categories.find((c) => c._id === fetchedJob.category);
        setCategoryName(matchedCategory?.categoryName || 'General');

        const skills = skillsRes.data.skills || [];
        const names = (fetchedJob.skills || []).map((skillId) => {
          const matched = skills.find((s) => s._id === skillId);
          return matched?.skillName || skillId;
        });
        setSkillNames(names);
      } catch (error) {
        setLoadError(error.response?.data?.message || 'Failed to load job.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [jobId]);

  if (isLoading) {
    return <div className="p-10 text-sm text-[#64748B]">Loading preview...</div>;
  }

  if (loadError || !job) {
    return (
      <div className="mx-auto max-w-4xl p-10 text-center">
        <div className="rounded-2xl border border-[#FCA5A5] bg-[#FEF2F2] p-8">
          <h2 className="text-lg font-bold text-[#991B1B]">Preview Unavailable</h2>
          <p className="mt-2 text-sm text-[#DC2626]">{loadError || 'Job not found.'}</p>
          <button
            type="button"
            onClick={() => navigate('/jobs/manage')}
            className="mt-6 rounded-xl bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1E40AF]"
          >
            ← Back to Manage Jobs
          </button>
        </div>
      </div>
    );
  }

  const companyName = company?.companyName || 'Your Company';
  const salaryText = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/jobs/manage')}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:text-[#1E40AF]"
        >
          ← Back to Manage Jobs
        </button>
      </div>

      <div className="mb-6 rounded-xl border border-[#93C5FD] bg-[#EFF6FF] px-4 py-3 text-center text-sm font-medium text-[#1E40AF]">
        Preview — this is how job seekers will see this posting once it's published.
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              {company?.companyLogo ? (
                <img
                  src={company.companyLogo}
                  alt={companyName}
                  className="h-16 w-16 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-[#DBEAFE] text-xl font-bold text-[#1D4ED8]">
                  {companyName.charAt(0)}
                </span>
              )}
              <div>
                <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">{job.title}</h1>
                <p className="mt-1 text-base font-medium text-[#475569]">{companyName}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#F1F5F9] px-2.5 py-1 text-xs font-semibold text-[#334155]">
                    📍 {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-[#1D4ED8]">
                    💼 {titleCase(job.jobType)}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-[#ECFDF5] px-2.5 py-1 text-xs font-semibold text-[#047857]">
                    🏠 {titleCase(job.workMode)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm sm:p-8">
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">Job Description</h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#475569]">
                {job.description}
              </p>
            </div>
            {job.responsibilities && (
              <div className="border-t border-[#F1F5F9] pt-6">
                <h3 className="text-lg font-bold text-[#0F172A]">Key Responsibilities</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#475569]">
                  {job.responsibilities}
                </p>
              </div>
            )}
            {job.requirements && (
              <div className="border-t border-[#F1F5F9] pt-6">
                <h3 className="text-lg font-bold text-[#0F172A]">Requirements & Qualifications</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#475569]">
                  {job.requirements}
                </p>
              </div>
            )}
            {job.benefits && (
              <div className="border-t border-[#F1F5F9] pt-6">
                <h3 className="text-lg font-bold text-[#0F172A]">Benefits & Perks</h3>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#475569]">
                  {job.benefits}
                </p>
              </div>
            )}
            {skillNames.length > 0 && (
              <div className="border-t border-[#F1F5F9] pt-6">
                <h3 className="text-sm font-bold text-[#0F172A]">Required Skills</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skillNames.map((name) => (
                    <span
                      key={name}
                      className="rounded-lg bg-[#EFF6FF] px-3 py-1 text-xs font-semibold text-[#1D4ED8]"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#0F172A]">Job Summary</h3>
            <dl className="mt-4 divide-y divide-[#F1F5F9] text-sm">
              <div className="flex justify-between py-3">
                <dt className="text-[#64748B]">Offered Salary</dt>
                <dd className="font-semibold text-[#0F172A]">{salaryText}</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-[#64748B]">Experience</dt>
                <dd className="font-semibold text-[#0F172A]">{job.experienceYears} years</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-[#64748B]">Job Category</dt>
                <dd className="font-semibold text-[#0F172A]">{categoryName}</dd>
              </div>
              <div className="flex justify-between py-3">
                <dt className="text-[#64748B]">Application Deadline</dt>
                <dd className="font-semibold text-[#0F172A]">
                  {new Date(job.deadline).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-[#0F172A]">About the Employer</h3>
            <div className="mt-4 flex items-center gap-3">
              {company?.companyLogo ? (
                <img
                  src={company.companyLogo}
                  alt={companyName}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#DBEAFE] font-bold text-[#1D4ED8]">
                  {companyName.charAt(0)}
                </span>
              )}
              <div>
                <p className="font-semibold text-[#0F172A]">{companyName}</p>
                {company?.companyLocation && (
                  <p className="text-xs text-[#64748B]">📍 {company.companyLocation}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
