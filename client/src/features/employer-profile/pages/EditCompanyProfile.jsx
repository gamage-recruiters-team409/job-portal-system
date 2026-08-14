import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2, RefreshCw, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import CompanyProfileForm from '../components/CompanyProfileForm.jsx';
import ConfirmDeleteCompanyModal from '../components/ConfirmDeleteCompanyModal.jsx';
import {
  getMyCompany,
  updateCompany,
  uploadCompanyLogo,
  deleteCompany,
} from '../../../services/companyService.js';

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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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
          toast.error(
            'Profile updated, but the logo upload failed. You can try again from the profile page.'
          );
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

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    setDeleteError('');

    try {
      // Guarded server-side (409) if the company has ANY job records —
      // active, closed, or soft-deleted/archived — since Company is a shared
      // model referenced by Jobs and deletion is never allowed to orphan job
      // data. Job "deletion" is a soft-delete (see Job.isDeleted), so a
      // company that has ever had a job cannot currently be permanently
      // deleted through normal use — there is no action the employer can
      // take from this page to lift the block. See the NOTE in
      // company.service.js.
      await deleteCompany();
      toast.success('Company profile deleted.');
      setIsDeleteModalOpen(false);
      navigate('/employer/company/create');
    } catch (err) {
      const message =
        err.response?.data?.message || 'Failed to delete company profile. Please try again.';
      setDeleteError(message);
      if (err.response?.status !== 409) {
        toast.error(message);
      }
    } finally {
      setIsDeleting(false);
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

  const dangerZone = (
    <div className="rounded-xl border border-[#DC2626]/30 bg-white p-6 shadow-xs">
      <h2 className="text-lg font-bold text-[#DC2626]">Danger zone</h2>
      <div className="mt-4 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">Delete company profile</p>
          <p className="mt-1 text-sm text-[#64748B]">
            Permanently remove this company profile. This cannot be undone. Companies that have
            ever had a job post — including closed or removed ones — can&apos;t currently be
            deleted, since removing a job keeps its record on file rather than erasing it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setDeleteError('');
            setIsDeleteModalOpen(true);
          }}
          className="inline-flex h-11 flex-shrink-0 items-center gap-2 rounded-[10px] border border-[#DC2626] px-4 text-sm font-semibold text-[#DC2626] transition hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Delete company profile
        </button>
      </div>
    </div>
  );

  return (
    <>
      <CompanyProfileForm
        mode="edit"
        initialValues={company}
        currentLogoUrl={company.companyLogo}
        submitting={submitting}
        showReverifyWarning
        serverErrors={serverErrors}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/employer/company')}
        dangerZone={dangerZone}
      />

      <ConfirmDeleteCompanyModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        errorMessage={deleteError}
      />
    </>
  );
}
