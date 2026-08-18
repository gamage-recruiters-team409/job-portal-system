/**
 * @file AdminEmployerDetails.jsx
 * @description Dedicated, professional Company Details and Verification View for Admin management.
 * @module Admin/Employers
 */

import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Briefcase,
  FileText,
  Activity,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getAdminEmployerById,
  updateEmployerVerification,
} from '../../../../services/adminEmployer.service';
import { EMPLOYER_VERIFICATION_STATUSES } from '../../../../constants/statuses';
import ResetPasswordModal from '../../common/ResetPasswordModal';

/* ─── Helper Functions ─────────────────────────────────────────────────────── */

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const getInitials = (name) => {
  if (!name) return 'C';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

/* ─── AdminEmployerDetails Component ───────────────────────────────────────── */

const AdminEmployerDetails = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Action states
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'verified' | 'rejected' | null
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchCompanyDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAdminEmployerById(companyId);
        if (isMounted) {
          setCompany(data?.data?.company || data?.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch company details');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (companyId) {
      fetchCompanyDetails();
    }

    return () => {
      isMounted = false;
    };
  }, [companyId, refreshTrigger]);

  /* ─── Handlers ───────────────────────────────────────────────────────────── */

  const handleVerificationUpdate = async (status) => {
    try {
      setIsUpdating(true);
      await updateEmployerVerification(companyId, status);
      toast.success(
        status === 'verified'
          ? 'Employer profile successfully verified!'
          : 'Employer profile rejected.'
      );
      setConfirmAction(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update verification status');
    } finally {
      setIsUpdating(false);
    }
  };

  /* ─── Render Helpers ─────────────────────────────────────────────────────── */

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] border border-emerald-200 text-[#16A34A] text-xs font-semibold shadow-2xs">
            <CheckCircle2 size={13} className="text-[#16A34A]" />
            Verified Partner
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEF3C7] border border-amber-200 text-[#D97706] text-xs font-semibold shadow-2xs">
            <Clock size={13} className="text-[#D97706] animate-pulse" />
            Pending Review
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FEE2E2] border border-red-200 text-[#DC2626] text-xs font-semibold shadow-2xs">
            <XCircle size={13} className="text-[#DC2626]" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#F1F5F9] text-[#64748B] text-xs font-semibold">
            {status}
          </span>
        );
    }
  };

  /* ─── Main Render ────────────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500">Loading company profile details...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center max-w-md mx-auto">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Company Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'The requested company profile record does not exist.'}</p>
        <Link
          to="/admin/employers"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm"
        >
          <ArrowLeft size={16} /> Back to Employer List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
            <Link to="/admin" className="hover:text-blue-600 transition-colors">
              Admin
            </Link>
            <span>/</span>
            <Link to="/admin/employers" className="hover:text-blue-600 transition-colors">
              Employers
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{company.companyName}</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Company Details</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/employers"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors shadow-2xs"
          >
            <ArrowLeft size={16} />
            Back to list
          </Link>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Company Profile Summary & Verification Actions */}
        <div className="flex flex-col gap-6 md:col-span-5 lg:col-span-4">
          
          {/* Company Profile Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col items-center text-center relative overflow-hidden">
            <div className="relative mb-4 mt-2">
              {company.companyLogo ? (
                <img
                  src={company.companyLogo}
                  alt={company.companyName}
                  className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-2xs bg-white"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 font-bold text-2xl flex items-center justify-center shadow-2xs">
                  {getInitials(company.companyName)}
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-900 leading-tight">{company.companyName}</h2>
            <p className="text-sm text-slate-500 mt-1">{company.industry}</p>

            <div className="flex items-center gap-2 mt-4">
              {renderStatusBadge(company.verificationStatus)}
            </div>

            <div className="w-full border-t border-slate-100 mt-6 pt-4 flex flex-col gap-3 text-left text-sm">
              <div className="flex items-center justify-between whitespace-nowrap gap-2">
                <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
                  <Calendar size={14} className="text-slate-400" /> Joined Platform
                </span>
                <span className="text-slate-900 font-semibold truncate">{formatDate(company.createdAt)}</span>
              </div>

              {company.website && (
                <div className="flex items-center justify-between whitespace-nowrap gap-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5 shrink-0">
                    <Globe size={14} className="text-slate-400" /> Website
                  </span>
                  <a
                    href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1 truncate max-w-[140px]"
                  >
                    Visit <ExternalLink size={11} />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Associated Employer Account Card */}
          {company.employerUserId && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Account Owner</span>
                {company.employerUserId?._id && (
                  <Link
                    to={`/admin/users/${company.employerUserId._id}`}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                  >
                    View User <ArrowLeft size={12} className="rotate-180" />
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center border border-slate-200 shrink-0">
                  {getInitials(company.employerUserId?.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 leading-tight truncate">
                    {company.employerUserId?.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{company.employerUserId?.email}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Account Status</span>
                <span
                  className={`font-semibold px-2.5 py-0.5 rounded-full border ${
                    company.employerUserId?.accountStatus === 'active'
                      ? 'bg-[#DCFCE7] text-[#16A34A] border-emerald-200'
                      : 'bg-[#FEE2E2] text-[#DC2626] border-red-200'
                  }`}
                >
                  {company.employerUserId?.accountStatus}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setIsResetPasswordOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors mt-1 whitespace-nowrap"
              >
                <RotateCcw size={13} />
                Send Password Reset Link
              </button>
            </div>
          )}

          {/* Verification Actions Card (only shown when action is needed) */}
          {company.verificationStatus !== EMPLOYER_VERIFICATION_STATUSES.VERIFIED && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs flex flex-col gap-3.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Moderation</h3>

              <div className="flex flex-col gap-2.5">
                {company.verificationStatus === EMPLOYER_VERIFICATION_STATUSES.PENDING ? (
                  <>
                    <button
                      onClick={() => setConfirmAction(EMPLOYER_VERIFICATION_STATUSES.VERIFIED)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-sm font-semibold transition-colors shadow-2xs whitespace-nowrap"
                    >
                      <CheckCircle2 size={16} />
                      Verify Employer Partner
                    </button>
                    <button
                      onClick={() => setConfirmAction(EMPLOYER_VERIFICATION_STATUSES.REJECTED)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-xl text-sm font-semibold transition-colors shadow-2xs whitespace-nowrap"
                    >
                      <XCircle size={16} />
                      Reject Profile
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmAction(EMPLOYER_VERIFICATION_STATUSES.VERIFIED)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#16A34A] hover:bg-[#15803D] text-white rounded-xl text-sm font-semibold transition-colors shadow-2xs whitespace-nowrap"
                  >
                    <CheckCircle2 size={16} />
                    Approve & Verify Partner
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Structured Organization & Contact Cards */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col gap-6">
          
          {/* Organization Information Card */}
          <div className="bg-white rounded-2xl p-6 md:p-7 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Organization Info</h3>
                <p className="text-xs text-slate-500 mt-0.5">Company structure and registration attributes</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <Building2 size={16} />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tile 1: Company Size */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Users size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Size</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {company.companySize ? `${company.companySize} employees` : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Tile 2: Founded Year */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Founded Year</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{company.foundedYear || 'Not specified'}</p>
                </div>
              </div>

              {/* Tile 3: Industry */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Industry Sector</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{company.industry}</p>
                </div>
              </div>

              {/* Tile 4: Website */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Globe size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Official Website</p>
                  {company.website ? (
                    <a
                      href={company.website.startsWith('http') ? company.website : `https://${company.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-0.5 block truncate"
                    >
                      {company.website}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-slate-400 italic mt-0.5">Not provided</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact & Location Card */}
          <div className="bg-white rounded-2xl p-6 md:p-7 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Contact & Headquarters</h3>
                <p className="text-xs text-slate-500 mt-0.5">Official communication and address details</p>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                <MapPin size={16} />
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tile 1: Email */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Mail size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company Email</p>
                  <a
                    href={`mailto:${company.companyEmail}`}
                    className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors mt-0.5 block truncate"
                  >
                    {company.companyEmail}
                  </a>
                </div>
              </div>

              {/* Tile 2: Telephone */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Telephone</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{company.companyTelephone || 'Not provided'}</p>
                </div>
              </div>

              {/* Tile 3: Location */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-start gap-3.5 sm:col-span-2">
                <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={15} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location / Address</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{company.companyLocation}</p>
                  {company.companyAddress && (
                    <p className="text-xs text-slate-500 mt-0.5">{company.companyAddress}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description Card (if provided) */}
          {company.companyDescription && (
            <div className="bg-white rounded-2xl p-6 md:p-7 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-base font-bold text-slate-900">About Company</h3>
                <FileText size={16} className="text-slate-400" />
              </div>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {company.companyDescription}
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center text-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs ${
                  confirmAction === 'verified'
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {confirmAction === 'verified' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {confirmAction === 'verified' ? 'Verify Employer Partner?' : 'Reject Company Profile?'}
                </h3>
                <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                  {confirmAction === 'verified'
                    ? `Are you sure you want to verify ${company.companyName} as an authorized partner?`
                    : `Are you sure you want to reject the company profile for ${company.companyName}?`}
                </p>
              </div>

              <div className="flex w-full gap-2.5 mt-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerificationUpdate(confirmAction)}
                  disabled={isUpdating}
                  className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl flex items-center justify-center shadow-sm disabled:opacity-70 transition-all ${
                    confirmAction === 'verified'
                      ? 'bg-[#16A34A] hover:bg-[#15803D]'
                      : 'bg-[#DC2626] hover:bg-[#B91C1C]'
                  }`}
                >
                  {isUpdating ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Confirm'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {company.employerUserId && (
        <ResetPasswordModal
          isOpen={isResetPasswordOpen}
          onClose={() => setIsResetPasswordOpen(false)}
          userName={company.employerUserId.name || company.companyName}
          email={company.employerUserId.email || company.companyEmail}
          isVerified={company.employerUserId.accountStatus === 'active'}
          userType="Employer"
        />
      )}
    </div>
  );
};

export default AdminEmployerDetails;
