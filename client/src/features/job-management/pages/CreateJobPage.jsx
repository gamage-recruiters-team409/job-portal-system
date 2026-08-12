import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createJob, submitJobForReview } from '../../../services/jobService.js';
import { getCategories, getSkills } from '../../../services/lookupService.js';
import {
  JOB_TYPES,
  WORK_MODES,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  SALARY_CURRENCIES,
} from '../../../constants/jobOptions.js';
import Breadcrumb from '../components/Breadcrumb.jsx';

const createJobFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Job title is required.'),
    deadline: z.coerce
      .date({ error: 'Deadline is required.' })
      .refine((date) => date > new Date(), 'Deadline must be a future date.'),
    description: z.string().trim().min(1, 'Job description is required.'),
    responsibilities: z.string().trim().min(1, 'Responsibilities are required.'),
    requirements: z.string().trim().min(1, 'Requirements are required.'),
    benefits: z.string().trim().optional(),
    category: z.string().min(1, 'Category is required.'),
    skills: z.array(z.string()).optional(),
    location: z.string().trim().min(1, 'Location is required.'),
    jobType: z.enum(Object.values(JOB_TYPES), { error: 'Job type is required.' }),
    workMode: z.enum(Object.values(WORK_MODES), { error: 'Work mode is required.' }),
    experienceYears: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
      z.number({ error: 'Experience is required.' }).min(0, 'Experience must be 0 or more.')
    ),
    salaryCurrency: z.string().optional(),
    salaryMin: z.coerce.number().min(0).optional().or(z.literal('')),
    salaryMax: z.coerce.number().min(0).optional().or(z.literal('')),
  })
  .refine(
    (data) =>
      data.salaryMax === '' ||
      data.salaryMin === '' ||
      data.salaryMax == null ||
      data.salaryMin == null ||
      Number(data.salaryMax) >= Number(data.salaryMin),
    { message: 'Salary max cannot be lower than salary min.', path: ['salaryMax'] }
  );

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      salaryCurrency: 'LKR',
    },
  });

  useEffect(() => {
    async function loadLookups() {
      try {
        const [categoriesRes, skillsRes] = await Promise.all([getCategories(), getSkills()]);
        setCategories(categoriesRes.data.categories || []);
        setSkills(skillsRes.data.skills || []);
      } catch {
        setServerError('Could not load categories/skills. Please refresh and try again.');
      }
    }
    loadLookups();
  }, []);

  const buildPayload = (formValues) => ({
    ...formValues,
    skills: selectedSkillIds,
    salaryMin: formValues.salaryMin === '' ? undefined : Number(formValues.salaryMin),
    salaryMax: formValues.salaryMax === '' ? undefined : Number(formValues.salaryMax),
  });

  const onSaveAsDraft = async (formValues) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const payload = buildPayload(formValues);
      const { data } = await createJob(payload);
      navigate(`/jobs/manage`, { state: { createdJobId: data.job._id } });
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to save job as draft.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitForReview = async (formValues) => {
    setServerError('');
    setIsSubmitting(true);
    try {
      const payload = buildPayload(formValues);
      const { data } = await createJob(payload);
      await submitJobForReview(data.job._id);
      navigate(`/jobs/manage`, { state: { submittedJobId: data.job._id } });
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to submit job for review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = 'mb-2 block text-sm font-medium text-[#000000]';
  const inputClass =
    'w-full rounded-lg border border-[#94A3B8] px-3 py-2 text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]';
  const errorClass = 'mt-1 text-xs text-[#DC2626]';

  return (
    <div className="mx-0 max-w-7xl p-10">
      <Breadcrumb items={[{ label: 'Jobs', path: '/jobs' }, { label: 'Post a new job' }]} />
      <h1 className="mt-4 text-3xl md:text-4xl font-bold text-[#000000]">Post a new job</h1>
      <p className="mt-2 text-base font-normal text-[#000000]">
        Fill in the details below to publish a new opening
      </p>

      {serverError && (
        <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-4 py-3 text-sm text-[#DC2626]">
          {serverError}
        </div>
      )}

      <form className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-10 shadow-[0_0_3px_rgba(0,0,0,0.25)]">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className={labelClass}>
              Job Title <span className="text-[#DC2626]">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g: Senior Software Engineer"
              {...register('title')}
            />
            {errors.title && <p className={errorClass}>{errors.title.message}</p>}
          </div>
          <div>
            <label className={labelClass}>
              Deadline <span className="text-[#DC2626]">*</span>
            </label>
            <input type="date" className={inputClass} {...register('deadline')} />
            {errors.deadline && <p className={errorClass}>{errors.deadline.message}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Job Description <span className="text-[#DC2626]">*</span>
            </label>
            <textarea rows={4} className={inputClass} {...register('description')} />
            {errors.description && <p className={errorClass}>{errors.description.message}</p>}
          </div>
          <div>
            <label className={labelClass}>
              Responsibilities <span className="text-[#DC2626]">*</span>
            </label>
            <textarea rows={4} className={inputClass} {...register('responsibilities')} />
            {errors.responsibilities && (
              <p className={errorClass}>{errors.responsibilities.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>
              Requirements <span className="text-[#DC2626]">*</span>
            </label>
            <textarea rows={4} className={inputClass} {...register('requirements')} />
            {errors.requirements && <p className={errorClass}>{errors.requirements.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Benefits</label>
            <textarea rows={4} className={inputClass} {...register('benefits')} />
          </div>

          <div>
            <label className={labelClass}>
              Category <span className="text-[#DC2626]">*</span>
            </label>
            <select className={inputClass} {...register('category')}>
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.categoryName}
                </option>
              ))}
            </select>
            {errors.category && <p className={errorClass}>{errors.category.message}</p>}
          </div>
          <div>
            <label className={labelClass}>Skills required</label>
            <SkillsMultiSelect
              options={skills}
              selectedIds={selectedSkillIds}
              onChange={setSelectedSkillIds}
            />
          </div>

          <div>
            <label className={labelClass}>
              Location <span className="text-[#DC2626]">*</span>
            </label>
            <input
              className={inputClass}
              placeholder="e.g: Colombo, Sri Lanka"
              {...register('location')}
            />
            {errors.location && <p className={errorClass}>{errors.location.message}</p>}
          </div>
          <div>
            <label className={labelClass}>
              Job type <span className="text-[#DC2626]">*</span>
            </label>
            <select className={inputClass} {...register('jobType')}>
              <option value="">Select job type</option>
              {Object.values(JOB_TYPES).map((value) => (
                <option key={value} value={value}>
                  {JOB_TYPE_LABELS[value]}
                </option>
              ))}
            </select>
            {errors.jobType && <p className={errorClass}>{errors.jobType.message}</p>}
          </div>

          <div>
            <label className={labelClass}>
              Work mode <span className="text-[#DC2626]">*</span>
            </label>
            <select className={inputClass} {...register('workMode')}>
              <option value="">Select work mode</option>
              {Object.values(WORK_MODES).map((value) => (
                <option key={value} value={value}>
                  {WORK_MODE_LABELS[value]}
                </option>
              ))}
            </select>
            {errors.workMode && <p className={errorClass}>{errors.workMode.message}</p>}
          </div>
          <div>
            <label className={labelClass}>
              Experience (in years) <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="number"
              min="0"
              className={inputClass}
              placeholder="e.g: 5+"
              {...register('experienceYears')}
            />
            {errors.experienceYears && (
              <p className={errorClass}>{errors.experienceYears.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass}>Salary Currency</label>
            <select className={inputClass} {...register('salaryCurrency')}>
              {Object.values(SALARY_CURRENCIES).map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Salary min</label>
              <input type="number" min="0" className={inputClass} {...register('salaryMin')} />
            </div>
            <div>
              <label className={labelClass}>Salary max</label>
              <input type="number" min="0" className={inputClass} {...register('salaryMax')} />
              {errors.salaryMax && <p className={errorClass}>{errors.salaryMax.message}</p>}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-[#E2E8F0] pt-6">
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onSaveAsDraft)}
            className="rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-medium text-[#475569] hover:bg-[#F8FAFC] disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmit(onSubmitForReview)}
            className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-50"
          >
            Submit for review
          </button>
        </div>
      </form>
    </div>
  );
}

function SkillsMultiSelect({ options, selectedIds, onChange }) {
  const selectedSkills = options.filter((s) => selectedIds.includes(s._id));
  const availableOptions = options.filter((s) => !selectedIds.includes(s._id));

  const addSkill = (id) => {
    if (id) onChange([...selectedIds, id]);
  };

  const removeSkill = (id) => {
    onChange(selectedIds.filter((sid) => sid !== id));
  };

  return (
    <div>
      <select
        className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
        value=""
        onChange={(e) => addSkill(e.target.value)}
      >
        <option value="">Select skills</option>
        {availableOptions.map((s) => (
          <option key={s._id} value={s._id}>
            {s.skillName}
          </option>
        ))}
      </select>

      {selectedSkills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {selectedSkills.map((s) => (
            <span
              key={s._id}
              className="flex items-center gap-1 rounded-full bg-[#EFF6FF] px-3 py-1 text-xs font-medium text-[#2563EB]"
            >
              {s.skillName}
              <button
                type="button"
                onClick={() => removeSkill(s._id)}
                className="ml-1 text-[#2563EB] hover:text-[#1D4ED8]"
                aria-label={`Remove ${s.skillName}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
