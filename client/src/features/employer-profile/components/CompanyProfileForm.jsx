import { useRef, useState } from 'react';
import { AlertTriangle, Building2, Loader2, Upload } from 'lucide-react';
import SearchableSelect from './SearchableSelect.jsx';

const INDUSTRY_OPTIONS = [
  'Software',
  'Finance & Banking',
  'Healthcare',
  'Retail & E-commerce',
  'Education',
  'Manufacturing',
  'Real Estate',
  'Construction',
  'Hospitality & Tourism',
  'Telecommunications',
  'Transportation & Logistics',
  'Media & Entertainment',
  'Agriculture',
  'Energy & Utilities',
  'Government & Public Sector',
  'Non-Profit',
  'Legal Services',
  'Marketing & Advertising',
  'Consulting',
  'Insurance',
  'Automotive',
  'Pharmaceuticals',
  'Food & Beverage',
  'Textile & Apparel',
  'Other',
].map((name) => ({ value: name, label: name }));

const COMPANY_SIZE_OPTIONS = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '200+', label: '200+ employees' },
];

const EMPTY_FORM = {
  companyName: '',
  industry: '',
  companySize: '',
  foundedYear: '',
  website: '',
  companyTelephone: '',
  companyEmail: '',
  companyAddress: '',
  companyLocation: '',
  companyDescription: '',
};

const currentYear = new Date().getFullYear();

function isValidUrl(value) {
  try {
    // Matches the backend's zod .url() check — requires a scheme (https://...).
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateField(name, value) {
  switch (name) {
    case 'companyName': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'Company name is required';
      if (trimmed.length < 3) return 'Company name must be at least 3 characters';
      if (trimmed.length > 100) return 'Company name cannot exceed 100 characters';
      return '';
    }
    case 'industry':
      return (value || '').trim() ? '' : 'Industry is required';
    case 'companySize':
      return value ? '' : 'Company size is required';
    case 'companyAddress': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'Company address is required';
      if (trimmed.length > 200) return 'Company address cannot exceed 200 characters';
      return '';
    }
    case 'companyLocation': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'Location is required';
      if (trimmed.length > 100) return 'Location cannot exceed 100 characters';
      return '';
    }
    case 'companyEmail': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'Work email is required';
      if (!isValidEmail(trimmed)) return 'Enter a valid email address';
      if (trimmed.length > 254) return 'Email cannot exceed 254 characters';
      return '';
    }
    case 'companyTelephone': {
      const trimmed = (value || '').trim();
      if (!trimmed) return 'Company phone is required';
      if (trimmed.length > 20) return 'Phone number cannot exceed 20 characters';
      return '';
    }
    case 'website': {
      const trimmed = (value || '').trim();
      if (!trimmed) return '';
      if (!isValidUrl(trimmed)) return 'Enter a valid URL, e.g. https://example.com';
      if (trimmed.length > 200) return 'Website URL cannot exceed 200 characters';
      return '';
    }
    case 'companyDescription': {
      if ((value || '').length > 500) return 'Description cannot exceed 500 characters';
      return '';
    }
    case 'foundedYear': {
      if (value === '' || value === null || value === undefined) return '';
      const year = Number(value);
      if (!Number.isInteger(year)) return 'Founded year must be a valid year';
      if (year < 1900) return 'Founded year must be 1900 or later';
      if (year > currentYear) return `Founded year cannot be later than ${currentYear}`;
      return '';
    }
    default:
      return '';
  }
}

function validateAll(values) {
  const errors = {};
  Object.keys(EMPTY_FORM).forEach((field) => {
    const message = validateField(field, values[field]);
    if (message) errors[field] = message;
  });
  return errors;
}

// Only pulls the fields this form owns out of a source object (e.g. the
// fetched company record), so unrelated fields like _id, verificationStatus,
// or employerUserId never end up in form state (and therefore never in the
// submit payload).
function pickFormFields(source) {
  if (!source) return {};
  const picked = {};
  Object.keys(EMPTY_FORM).forEach((field) => {
    if (source[field] === undefined || source[field] === null) return;
    picked[field] = field === 'foundedYear' ? String(source[field]) : source[field];
  });
  return picked;
}

const inputCls = (hasError) =>
  `h-11 w-full rounded-[10px] border bg-white px-3 text-sm text-[#0F172A] outline-none transition placeholder:text-[#64748B] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] ${
    hasError ? 'border-[#DC2626]' : 'border-[#E2E8F0]'
  }`;

const labelCls = 'mb-1.5 flex items-center gap-2 text-sm font-medium text-[#0F172A]';

function ReverifyTag() {
  return (
    <span className="rounded-full bg-[#FEF3C7] px-2 py-0.5 text-xs font-semibold text-[#D97706]">
      Needs re-verification
    </span>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-[#DC2626]">{message}</p>;
}

/**
 * Shared controlled form for creating/editing an employer's company profile.
 *
 * @param {object} initialValues - Prefill values (edit mode).
 * @param {(values: object, logoFile: File|null) => void} onSubmit
 * @param {boolean} submitting
 * @param {boolean} showReverifyWarning
 * @param {'create'|'edit'} mode
 * @param {string} currentLogoUrl - Persisted logo URL (edit mode).
 * @param {() => void} onCancel
 * @param {object} serverErrors - Field-keyed error messages from the API (e.g. 409 duplicates).
 * @param {React.ReactNode} dangerZone - Optional content rendered below the form
 *   (outside the <form> element) — e.g. the Edit page's "Delete company profile" section.
 */
export default function CompanyProfileForm({
  initialValues,
  onSubmit,
  submitting = false,
  showReverifyWarning = false,
  mode = 'create',
  currentLogoUrl = null,
  onCancel,
  serverErrors = {},
  dangerZone = null,
}) {
  // `initialValues` is only ever set once (the parent page gates rendering
  // this form until fetched data is ready in edit mode), so a plain useState
  // initializer is enough — no effect needed to keep it in sync.
  const [values, setValues] = useState({ ...EMPTY_FORM, ...pickFormFields(initialValues) });
  const [errors, setErrors] = useState({});
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoError, setLogoError] = useState('');
  const fileInputRef = useRef(null);

  const displayedLogo = logoPreview || currentLogoUrl;
  // Server-side errors (e.g. 409 duplicate name/email) are merged in at
  // render time rather than copied into `errors` state via an effect.
  const fieldError = (name) => errors[name] || serverErrors[name];
  const title = mode === 'create' ? 'Create company profile' : 'Edit company profile';

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (name) => {
    setErrors((prev) => ({ ...prev, [name]: validateField(name, values[name]) }));
  };

  const handleLogoButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setLogoError('');
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setLogoError('Only PNG or JPG images are allowed.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError('File size must be 2MB or less.');
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setLogoError('');
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value.slice(0, 500);
    handleChange('companyDescription', value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateAll(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // Optional fields are sent as '' rather than omitted/undefined when empty:
    // the backend's zod schema preprocesses '' to undefined internally, but it
    // still needs the key present in the body to tell "explicitly cleared"
    // apart from "not touched" (relevant for PUT /companies/me re-verification
    // diffing). An `undefined`-valued key would be dropped by JSON.stringify
    // before the request ever leaves the browser.
    const payload = {
      companyName: values.companyName.trim(),
      industry: values.industry.trim(),
      companySize: values.companySize,
      foundedYear: values.foundedYear.trim(),
      website: values.website.trim(),
      companyTelephone: values.companyTelephone.trim(),
      companyEmail: values.companyEmail.trim(),
      companyAddress: values.companyAddress.trim(),
      companyLocation: values.companyLocation.trim(),
      companyDescription: values.companyDescription.trim(),
    };

    onSubmit(payload, logoFile);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 font-[Inter,sans-serif] md:p-8">
      <form onSubmit={handleSubmit}>
        {/* Header row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[#0F172A]">{title}</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="h-11 rounded-[10px] border border-[#E2E8F0] px-4 text-sm font-medium text-[#475569] transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <span>Save changes</span>
            </button>
          </div>
        </div>

        {/* Re-verification warning */}
        {showReverifyWarning && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-[#FDE68A] bg-[#FEF3C7] p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#D97706]" />
            <p className="text-sm font-medium text-[#D97706]">
              Changing your company name or work email will send your profile back for
              re-verification.
            </p>
          </div>
        )}

        {/* Company logo card */}
        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
          <h2 className="text-lg font-bold text-[#0F172A]">Company logo</h2>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#E2E8F0] bg-slate-100">
              {displayedLogo ? (
                <img
                  src={displayedLogo}
                  alt="Company logo preview"
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-9 w-9 text-slate-400" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleLogoButtonClick}
                  className="inline-flex items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#0F172A] transition hover:bg-slate-50"
                >
                  <Upload className="h-4 w-4" />
                  {mode === 'edit' || displayedLogo ? 'Replace logo' : 'Add logo'}
                </button>

                {(mode === 'edit' || logoFile) && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={!logoFile}
                    className="text-sm font-semibold text-[#DC2626] transition hover:underline disabled:cursor-not-allowed disabled:text-slate-300 disabled:hover:no-underline"
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleLogoFileChange}
                  className="hidden"
                />
              </div>
              <p className="mt-2 text-xs text-[#64748B]">PNG or JPG, max 2MB, min 200x200px</p>
              {logoError && <FieldError message={logoError} />}
            </div>
          </div>
        </div>

        {/* Company details card */}
        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
          <h2 className="text-lg font-bold text-[#0F172A]">Company details</h2>

          <div className="mt-4 grid grid-cols-1 gap-5">
            <div>
              <label className={labelCls}>
                Company name
                {showReverifyWarning && <ReverifyTag />}
              </label>
              <input
                type="text"
                value={values.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                onBlur={() => handleBlur('companyName')}
                className={inputCls(fieldError('companyName'))}
                placeholder="e.g. Acme Corporation"
              />
              <FieldError message={fieldError('companyName')} />
            </div>

            <SearchableSelect
              label="Industry"
              value={values.industry}
              onChange={(v) => handleChange('industry', v)}
              options={INDUSTRY_OPTIONS}
              placeholder="Select industry"
              searchPlaceholder="Search industry..."
              error={errors.industry}
              allowCustom
            />

            <SearchableSelect
              label="Number of employees"
              value={values.companySize}
              onChange={(v) => handleChange('companySize', v)}
              options={COMPANY_SIZE_OPTIONS}
              placeholder="Select company size"
              searchPlaceholder="Search number of employees..."
              error={errors.companySize}
            />

            <div>
              <label className={labelCls}>Founded year</label>
              <input
                type="number"
                value={values.foundedYear}
                onChange={(e) => handleChange('foundedYear', e.target.value)}
                onBlur={() => handleBlur('foundedYear')}
                className={inputCls(errors.foundedYear)}
                placeholder="e.g. 2018"
                min="1900"
                max={currentYear}
              />
              <FieldError message={errors.foundedYear} />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Website</label>
                <input
                  type="text"
                  value={values.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  onBlur={() => handleBlur('website')}
                  className={inputCls(errors.website)}
                  placeholder="https://example.com"
                />
                <FieldError message={errors.website} />
              </div>

              <div>
                <label className={labelCls}>Company phone</label>
                <input
                  type="text"
                  value={values.companyTelephone}
                  onChange={(e) => handleChange('companyTelephone', e.target.value)}
                  onBlur={() => handleBlur('companyTelephone')}
                  className={inputCls(errors.companyTelephone)}
                  placeholder="+94 11 234 5678"
                />
                <FieldError message={errors.companyTelephone} />
              </div>
            </div>

            <div>
              <label className={labelCls}>
                Work email
                {showReverifyWarning && <ReverifyTag />}
              </label>
              <input
                type="email"
                value={values.companyEmail}
                onChange={(e) => handleChange('companyEmail', e.target.value)}
                onBlur={() => handleBlur('companyEmail')}
                className={inputCls(fieldError('companyEmail'))}
                placeholder="hr@example.com"
              />
              <FieldError message={fieldError('companyEmail')} />
            </div>

            <div>
              <label className={labelCls}>Address</label>
              <input
                type="text"
                value={values.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                onBlur={() => handleBlur('companyAddress')}
                className={inputCls(errors.companyAddress)}
                placeholder="42 Galle Road, Colombo 03"
              />
              <FieldError message={errors.companyAddress} />
            </div>

            <div>
              <label className={labelCls}>Location</label>
              <input
                type="text"
                value={values.companyLocation}
                onChange={(e) => handleChange('companyLocation', e.target.value)}
                onBlur={() => handleBlur('companyLocation')}
                className={inputCls(errors.companyLocation)}
                placeholder="e.g. Colombo, Sri Lanka"
              />
              <FieldError message={errors.companyLocation} />
            </div>
          </div>
        </div>

        {/* About card */}
        <div className="mt-6 rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
          <h2 className="text-lg font-bold text-[#0F172A]">About</h2>
          <div className="mt-4">
            <label className={labelCls}>Company description</label>
            <textarea
              value={values.companyDescription}
              onChange={handleDescriptionChange}
              onBlur={() => handleBlur('companyDescription')}
              rows={6}
              maxLength={500}
              className={`${inputCls(errors.companyDescription)} h-auto resize-none py-2.5`}
              placeholder="Tell candidates about your company..."
            />
            <div className="mt-1 flex items-center justify-between">
              <FieldError message={errors.companyDescription} />
              <span className="ml-auto text-xs text-[#64748B]">
                {values.companyDescription.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* Bottom action row */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="h-11 rounded-[10px] border border-[#E2E8F0] px-4 text-sm font-medium text-[#475569] transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center gap-2 rounded-[10px] bg-[#2563EB] px-5 text-sm font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>Save changes</span>
          </button>
        </div>
      </form>

      {dangerZone && <div className="mt-6">{dangerZone}</div>}
    </div>
  );
}
