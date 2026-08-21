import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createJob, submitJobForReview } from '../../../services/jobService.js';
import { getCategories, getSkills } from '../../../services/lookupService.js';
import { JOB_TYPES, WORK_MODES } from '../../../constants/jobOptions.js';
import Breadcrumb from '../components/Breadcrumb.jsx';
import JobFormFields from '../components/JobFormFields.jsx';

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
    salaryMin: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
    salaryMax: z.preprocess(
      (val) => (val === '' || val === undefined || val === null ? undefined : Number(val)),
      z.number().min(0).optional()
    ),
  })
  .refine(
    (data) => data.salaryMax == null || data.salaryMin == null || data.salaryMax >= data.salaryMin,
    { message: 'Salary max cannot be lower than salary min.', path: ['salaryMax'] }
  );

export default function CreateJobPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);
  const [createdJobId, setCreatedJobId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const topRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
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
  });

  const onSaveAsDraft = async (formValues) => {
    setServerError('');
    setSuccessMessage('');
    setIsSubmitting(true);
    try {
      const payload = buildPayload(formValues);
      await createJob(payload);
      setCreatedJobId(null);
      setSuccessMessage('Job saved as draft successfully.');
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      reset();
      setSelectedSkillIds([]);
    } catch (error) {
      setServerError(error.response?.data?.message || 'Failed to save job as draft.');
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitForReview = async (formValues) => {
    setServerError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    let jobId = createdJobId;

    try {
      if (!jobId) {
        const payload = buildPayload(formValues);
        const { data } = await createJob(payload);
        jobId = data.job._id;
        setCreatedJobId(jobId);
      }

      await submitJobForReview(jobId);
      setSuccessMessage('Job submitted for review successfully.');
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setCreatedJobId(null);
      reset();
      setSelectedSkillIds([]);
    } catch (error) {
      if (jobId) {
        setServerError(
          'The job was saved as a draft, but submitting it for review failed. Click "Submit for review" again to retry — this will not create a duplicate draft.'
        );
      } else {
        setServerError(error.response?.data?.message || 'Failed to submit job for review.');
      }
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAsDraftClick = () => handleSubmit(onSaveAsDraft)();
  const handleSubmitForReviewClick = () => handleSubmit(onSubmitForReview)();

  return (
    <div ref={topRef} className="mx-0 max-w-7xl p-4 sm:p-6 md:p-10">
      <Breadcrumb items={[{ label: 'Jobs', path: '/jobs/manage' }, { label: 'Post a new job' }]} />
      <button
        type="button"
        onClick={() => navigate('/jobs/manage')}
        className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#2563EB] hover:text-[#1E40AF]"
      >
        ← Back to Manage Jobs
      </button>
      <h1 className="mt-3 text-xl sm:text-2xl md:text-4xl font-bold text-[#000000]">
        Post a new job
      </h1>
      <p className="mt-1 text-sm md:text-base font-normal text-[#000000]">
        Fill in the details below to publish a new opening
      </p>

      {serverError && (
        <div className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3 py-2 sm:px-4 sm:py-3 text-sm text-[#DC2626]">
          {serverError}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 rounded-lg border border-[#86EFAC] bg-[#F0FDF4] px-3 py-2 sm:px-4 sm:py-3 text-sm text-[#15803D]">
          {successMessage}
        </div>
      )}

      <form className="mt-4 sm:mt-6 rounded-xl border border-[#E2E8F0] bg-white p-4 sm:p-6 md:p-10 shadow-[0_0_3px_rgba(0,0,0,0.25)]">
        <JobFormFields
          register={register}
          errors={errors}
          categories={categories}
          skills={skills}
          selectedSkillIds={selectedSkillIds}
          onSkillsChange={setSelectedSkillIds}
          showPlaceholders
        />

        <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row sm:flex-wrap justify-end gap-2 sm:gap-3 border-t border-[#E2E8F0] pt-4 sm:pt-6">
          <button
            type="button"
            onClick={() => navigate('/jobs/manage')}
            className="rounded-lg border border-[#94A3B8] w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-semibold text-[#000000] hover:bg-[#94A3B8]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSaveAsDraftClick}
            className="rounded-lg border border-[#94A3B8] w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-semibold text-[#000000] hover:bg-[#94A3B8] disabled:opacity-50"
          >
            Save as draft
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleSubmitForReviewClick}
            className="rounded-lg bg-[#2563EB] w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-semibold text-white hover:bg-[#1E40AF] disabled:opacity-50"
          >
            Submit for review
          </button>
        </div>
      </form>
    </div>
  );
}
