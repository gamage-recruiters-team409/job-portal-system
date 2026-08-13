import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CompanyProfileForm from '../components/CompanyProfileForm.jsx';
import { createCompany, uploadCompanyLogo } from '../../../services/companyService.js';

// Maps the backend's 409 duplicate-field messages to the form field they apply to.
function mapDuplicateError(message) {
  if (!message) return null;
  if (message.toLowerCase().includes('name')) return { companyName: message };
  if (message.toLowerCase().includes('email')) return { companyEmail: message };
  return null;
}

export default function CreateCompanyProfile() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serverErrors, setServerErrors] = useState({});

  const handleSubmit = async (payload, logoFile) => {
    setSubmitting(true);
    setServerErrors({});

    try {
      await createCompany(payload);

      if (logoFile) {
        try {
          await uploadCompanyLogo(logoFile);
        } catch {
          toast.error('Company created, but the logo upload failed. You can add it from the profile page.');
        }
      }

      toast.success('Company profile created successfully.');
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

      toast.error(message || 'Failed to create company profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CompanyProfileForm
      mode="create"
      initialValues={null}
      submitting={submitting}
      showReverifyWarning={false}
      serverErrors={serverErrors}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/employer/company')}
    />
  );
}
