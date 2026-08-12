import { Link } from 'react-router-dom';
import {
  formatSalaryCompact,
  timeAgo,
  formatExperience,
  titleCase,
} from '../../features/public-jobs/utils/format.js';

/**
 * @file JobCard.jsx
 * @description Card for a single published job. Links to the job detail page.
 * Owned by Bimsara (Public Job Discovery).
 *
 * @param {object} job — a public Job document (projected fields). companyId is
 *   populated with { companyName, companyLogo, companyLocation }; category and
 *   skills are raw ObjectIds.
 * @param {object} [skillsMap] — { [skillId]: { name } } to resolve skill names.
 * @param {object} [categoriesMap] — { [categoryId]: { name } } to resolve the category name.
 */
export default function JobCard({ job, skillsMap = {}, categoriesMap = {} }) {
  const company = job?.companyId ?? {};
  const companyName = company?.companyName ?? 'Company';
  const salary = formatSalaryCompact(job?.salaryMin, job?.salaryMax, job?.salaryCurrency);
  const skillNames = (job?.skills ?? []).slice(0, 4).map((id) => skillsMap[id]?.name).filter(Boolean);
  const categoryName = job?.category ? categoriesMap[job.category]?.name : '';

  return (
    <Link
      to={`/jobs/${job?._id}`}
      className="group block rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-4">
        {/* Company logo */}
        {company?.companyLogo ? (
          <img
            src={company.companyLogo}
            alt={companyName}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-base font-semibold text-blue-700">
            {companyName.charAt(0)}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-slate-900 group-hover:text-blue-700">
            {job?.title}
          </h3>
          <p className="truncate text-sm text-slate-500">{companyName}</p>

          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            {job?.location && (
              <span className="inline-flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
                {job.location}
              </span>
            )}
            {job?.jobType && (
              <span className="inline-flex items-center gap-1">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="7" width="18" height="13" rx="2" />
                  <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                {titleCase(job.jobType)}
              </span>
            )}
            {categoryName && <span>{categoryName}</span>}
            {job?.createdAt && <span>{timeAgo(job.createdAt)}</span>}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-sm font-semibold text-slate-900">{salary}</p>
          {job?.experienceYears != null && (
            <p className="mt-1 text-xs text-slate-400">{formatExperience(job.experienceYears)}</p>
          )}
        </div>
      </div>

      {skillNames.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {skillNames.map((name) => (
            <span
              key={name}
              className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700"
            >
              {name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
