import {
  JOB_TYPES,
  WORK_MODES,
  JOB_TYPE_LABELS,
  WORK_MODE_LABELS,
  SALARY_CURRENCIES,
} from '../../../constants/jobOptions.js';
import {
  labelClass,
  inputClass,
  selectClass,
  selectArrowStyle,
  errorClass,
} from '../utils/formStyles.js';
import SkillsMultiSelect from './SkillsMultiSelect.jsx';

export default function JobFormFields({
  register,
  errors,
  categories,
  skills,
  selectedSkillIds,
  onSkillsChange,
  showPlaceholders = false,
}) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div>
        <label className={labelClass}>
          Job Title <span className="text-[#DC2626]">*</span>
        </label>
        <input
          className={inputClass}
          placeholder={showPlaceholders ? 'e.g: Senior Software Engineer' : undefined}
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
        {errors.responsibilities && <p className={errorClass}>{errors.responsibilities.message}</p>}
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
        <select className={selectClass} style={selectArrowStyle} {...register('category')}>
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
          onChange={onSkillsChange}
          selectClass={selectClass}
          selectArrowStyle={selectArrowStyle}
        />
      </div>

      <div>
        <label className={labelClass}>
          Location <span className="text-[#DC2626]">*</span>
        </label>
        <input
          className={inputClass}
          placeholder={showPlaceholders ? 'e.g: Colombo, Sri Lanka' : undefined}
          {...register('location')}
        />
        {errors.location && <p className={errorClass}>{errors.location.message}</p>}
      </div>
      <div>
        <label className={labelClass}>
          Job type <span className="text-[#DC2626]">*</span>
        </label>
        <select className={selectClass} style={selectArrowStyle} {...register('jobType')}>
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
        <select className={selectClass} style={selectArrowStyle} {...register('workMode')}>
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
          placeholder={showPlaceholders ? 'e.g: 5+' : undefined}
          {...register('experienceYears')}
        />
        {errors.experienceYears && <p className={errorClass}>{errors.experienceYears.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Salary Currency</label>
        <select className={selectClass} style={selectArrowStyle} {...register('salaryCurrency')}>
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
  );
}
