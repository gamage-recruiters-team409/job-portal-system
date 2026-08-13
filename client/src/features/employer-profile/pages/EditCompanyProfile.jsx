import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import CompanyProfileForm from '../components/CompanyProfileForm.jsx';
import { getMyCompany, updateCompany, uploadCompanyLogo } from '../../../services/companyService.js';

// Maps the backend's 409 duplicate-field messages to the form field they apply to.
function mapDuplicateError(message) {
  if (!message) return null;
  if (message.toLowerCase().includes('name')) return { companyName: message };
  if (message.toLowerCase().includes('email')) return { companyEmail: message };
  return null;
}

export default function EditCompanyProfile() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  // Retry button re-runs this directly (an event handler, not an effect), so
  // it can freely call setState without tripping react-hooks/set-state-in-effect.
  const fetchCompany = (resetStates = false) => {
    if (resetStates) {
      setIsLoading(true);
      setLoadError(null);
    }

    getMyCompany()
      .then((response) => {
        const companyData = response?.data?.company || response?.company;
        if (!companyData) {
          setLoadError('Company profile not found. Please create one first.');
        } else {
          setCompany(companyData);
        }
      })
      .catch((err) => {
        setLoadError(
          err.response?.data?.message || 'Failed to load company profile. Please try again.'
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let isMounted = true;

    getMyCompany()
      .then((response) => {
        if (!isMounted) return;
        const companyData = response?.data?.company || response?.company;
        if (!companyData) {
          setLoadError('Company profile not found. Please create one first.');
        } else {
          setCompany(companyData);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setLoadError(
          err.response?.data?.message || 'Failed to load company profile. Please try again.'
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (payload, logoFile) => {
    setSubmitting(true);
    setServerErrors({});

    try {
      await updateCompany(payload);

      if (logoFile) {
        try {
          await uploadCompanyLogo(logoFile);
        } catch {
          toast.error('Profile updated, but the logo upload failed. You can try again from the profile page.');
        }
      }

      toast.success('Company profile updated successfully.');
      navigate('/employer/company');
    } catch (err) {
      const status = err.response?.status;
      const message = err.response?.data?.message;

      if (status === 409) {
        const fieldError = mapDuplicateError(message);
        if (fieldError) {
          setServerErrors(fieldError);
          toast.error(message);
          return;
        }
      }

      toast.error(message || 'Failed to update company profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
        <p className="mt-3 text-sm font-medium">Loading company profile...</p>
      </div>
    );
  }

  if (loadError || !company) {
    return (
      <div className="p-6 md:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-xs">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h2 className="mt-2 text-lg font-bold text-slate-900">Unable to load profile</h2>
          <p className="mt-1 text-sm text-slate-600">{loadError}</p>
          <button
            type="button"
            onClick={() => fetchCompany(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <CompanyProfileForm
      mode="edit"
      initialValues={company}
      currentLogoUrl={company.companyLogo}
      submitting={submitting}
      showReverifyWarning
      serverErrors={serverErrors}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/employer/company')}
    />
  );
}
