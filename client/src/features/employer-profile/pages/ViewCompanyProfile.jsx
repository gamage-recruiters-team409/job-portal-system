import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Globe,
  Mail,
  Phone,
  Pencil,
  Plus,
  RefreshCw,
  Loader2,
  Briefcase,
  ImageUp,
} from 'lucide-react';
import { getMyCompany } from '../../../services/companyService.js';
import ChangeLogoModal from '../components/ChangeLogoModal.jsx';

// Verification status badge sub-component
function VerificationBadge({ status }) {
  const normalizedStatus = (status || 'pending').toLowerCase();

  if (normalizedStatus === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-xs font-semibold text-[#16A34A]">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }

  if (normalizedStatus === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2.5 py-1 text-xs font-semibold text-[#DC2626]">
        <AlertCircle className="h-3.5 w-3.5" />
        Rejected
      </span>
    );
  }

  // Default: pending
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-2.5 py-1 text-xs font-semibold text-[#D97706]">
      <Clock className="h-3.5 w-3.5" />
      Pending
    </span>
  );
}

export default function ViewCompanyProfile() {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [is404, setIs404] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  const fetchCompanyProfile = async (resetStates = false) => {
    if (resetStates) {
      setIsLoading(true);
      setError(null);
      setIs404(false);
    }

    try {
      const response = await getMyCompany();
      // Handle res.data.company format from company.controller.js
      const companyData = response?.data?.company || response?.company;
      if (!companyData) {
        setIs404(true);
      } else {
        setCompany(companyData);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setIs404(true);
      } else {
        setError(
          err.response?.data?.message || 'Failed to load company profile. Please try again.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getMyCompany()
      .then((response) => {
        if (!isMounted) return;
        const companyData = response?.data?.company || response?.company;
        if (!companyData) {
          setIs404(true);
        } else {
          setCompany(companyData);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.response?.status === 404) {
          setIs404(true);
        } else {
          setError(
            err.response?.data?.message || 'Failed to load company profile. Please try again.'
          );
        }
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

  const handleEditProfile = () => {
    navigate('/employer/company/edit');
  };

  const handleCreateCompany = () => {
    navigate('/employer/company/create');
  };

  const handleLogoUpdated = (updatedCompany) => {
    if (updatedCompany) {
      setCompany(updatedCompany);
    } else {
      fetchCompanyProfile();
    }
  };

  // Helper to format meta info list with dots
  const formatMetaRow = () => {
    if (!company) return '';
    const parts = [];
    if (company.industry) parts.push(company.industry);
    if (company.companySize) {
      const sizeText = company.companySize.toLowerCase().includes('employee')
        ? company.companySize
        : `${company.companySize} employees`;
      parts.push(sizeText);
    }
    if (company.companyLocation) parts.push(company.companyLocation);
    return parts.join(' · ');
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
        <p className="mt-3 text-sm font-medium">Loading company profile...</p>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center shadow-xs">
          <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
          <h2 className="mt-2 text-lg font-bold text-slate-900">Unable to load profile</h2>
          <p className="mt-1 text-sm text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => fetchCompanyProfile(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Empty State (404 / No profile created yet)
  if (is404 || !company) {
    return (
      <div className="p-6 md:p-8">
        <div className="mx-auto max-w-xl rounded-xl border border-[#E2E8F0] bg-white p-8 text-center shadow-xs">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#2563EB]">
            <Building2 className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-[#0F172A]">No Company Profile Found</h2>
          <p className="mt-2 text-sm text-[#475569]">
            You haven't created a company profile yet. Create a profile to showcase your organization,
            post job openings, and manage job applications.
          </p>
          <button
            type="button"
            onClick={handleCreateCompany}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create company profile</span>
          </button>
        </div>
      </div>
    );
  }

  // Split description into paragraphs if present
  const descriptionParagraphs = company.companyDescription
    ? company.companyDescription.split('\n').filter((p) => p.trim() !== '')
    : [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-8 font-[Inter,sans-serif]">
      {/* HERO CARD (top, full width) */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Left section: Logo + Details */}
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {/* Logo */}
            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-center shadow-xs">
              {company.companyLogo ? (
                <img
                  src={company.companyLogo}
                  alt={company.companyName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-10 w-10 text-slate-400" />
              )}
            </div>

            {/* Name, Badge, Meta & Contact chips */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
                  {company.companyName}
                </h1>
                <VerificationBadge status={company.verificationStatus} />
              </div>

              {/* Meta row */}
              {formatMetaRow() && (
                <p className="text-sm font-normal text-[#64748B]">{formatMetaRow()}</p>
              )}

              {/* Contact chips row */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {company.website && (
                  <a
                    href={
                      company.website.startsWith('http')
                        ? company.website
                        : `https://${company.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
                  >
                    <Globe className="h-3.5 w-3.5 text-slate-500" />
                    <span>{company.website.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}

                {company.companyEmail && (
                  <a
                    href={`mailto:${company.companyEmail}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
                  >
                    <Mail className="h-3.5 w-3.5 text-slate-500" />
                    <span>{company.companyEmail}</span>
                  </a>
                )}

                {company.companyTelephone && (
                  <a
                    href={`tel:${company.companyTelephone}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition"
                  >
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    <span>{company.companyTelephone}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Top-Right Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsLogoModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2563EB] border border-blue-100 hover:bg-blue-100 transition"
            >
              <ImageUp className="h-4 w-4" />
              <span>Change logo</span>
            </button>
            <button
              type="button"
              onClick={handleEditProfile}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <Pencil className="h-4 w-4" />
              <span>Edit profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN BODY (2fr / 1fr, 24px gap) */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN (2fr) */}
        <div className="space-y-6 lg:col-span-2">
          {/* About Card */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-[#0F172A]">About</h2>
            {descriptionParagraphs.length > 0 ? (
              <div className="mt-4 space-y-3 text-sm text-[#475569] leading-relaxed">
                {descriptionParagraphs.map((para, index) => (
                  <p key={index}>{para}</p>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm italic text-[#64748B]">
                No company description provided yet.
              </p>
            )}
          </div>

          {/* Open positions Card */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F172A]">Open positions</h2>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
                Coming soon
              </span>
            </div>

            {/* Coming Soon state for Job Management module */}
            <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <Briefcase className="mx-auto h-8 w-8 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-700">
                Job management integration coming soon
              </p>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                Your posted job openings and applicant counts will be displayed here once the Employer Job Management module is integrated.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1fr) */}
        <div className="space-y-6 lg:col-span-1">
          {/* Company details Card */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-[#0F172A]">Company details</h2>
            <div className="mt-4 divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#64748B]">Industry</span>
                <span className="font-medium text-[#0F172A]">
                  {company.industry || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#64748B]">Company size</span>
                <span className="font-medium text-[#0F172A]">
                  {company.companySize ? (
                    company.companySize.toLowerCase().includes('employee') ? (
                      company.companySize
                    ) : (
                      `${company.companySize} employees`
                    )
                  ) : (
                    '—'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#64748B]">Founded</span>
                <span className="font-medium text-[#0F172A]">
                  {company.foundedYear || '—'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#64748B]">Website</span>
                <span className="font-medium text-[#0F172A] truncate max-w-[180px]">
                  {company.website ? (
                    <a
                      href={
                        company.website.startsWith('http')
                          ? company.website
                          : `https://${company.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#2563EB] hover:underline"
                    >
                      {company.website.replace(/^https?:\/\//, '')}
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#64748B]">Email</span>
                <span className="font-medium text-[#0F172A] truncate max-w-[180px]">
                  {company.companyEmail ? (
                    <a
                      href={`mailto:${company.companyEmail}`}
                      className="hover:text-[#2563EB] hover:underline"
                    >
                      {company.companyEmail}
                    </a>
                  ) : (
                    '—'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between py-2.5">
                <span className="text-[#64748B]">Phone</span>
                <span className="font-medium text-[#0F172A]">
                  {company.companyTelephone || '—'}
                </span>
              </div>
              <div className="flex items-start justify-between py-2.5">
                <span className="text-[#64748B]">Address</span>
                <span className="font-medium text-[#0F172A] text-right max-w-[180px]">
                  {company.companyAddress || '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Card */}
          <div className="rounded-xl border border-[#E2E8F0] bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#0F172A]">Verification</h2>
              <VerificationBadge status={company.verificationStatus} />
            </div>

            {/* Show date/admin only if dedicated verification metadata is provided */}
            {company.verificationStatus === 'verified' &&
              (company.verifiedAt || company.verifiedOn || company.verifiedBy || company.verifiedByName) && (
                <div className="mt-4 space-y-3 border-t border-slate-100 pt-3 text-sm">
                  {(company.verifiedAt || company.verifiedOn) && (
                    <div>
                      <span className="block text-xs text-[#64748B]">Verified on</span>
                      <span className="font-medium text-[#0F172A]">
                        {new Date(company.verifiedAt || company.verifiedOn).toLocaleDateString(
                          'en-GB',
                          {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }
                        )}
                      </span>
                    </div>
                  )}

                  {(company.verifiedBy || company.verifiedByName) && (
                    <div>
                      <span className="block text-xs text-[#64748B]">Verified by</span>
                      <span className="font-medium text-[#0F172A]">
                        {company.verifiedBy || company.verifiedByName}
                      </span>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Change Logo Modal */}
      <ChangeLogoModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
        onSuccess={handleLogoUpdated}
        currentLogo={company.companyLogo}
      />
    </div>
  );
}
