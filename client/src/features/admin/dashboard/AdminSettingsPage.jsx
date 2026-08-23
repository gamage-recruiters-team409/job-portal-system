/**
 * @file AdminSettingsPage.jsx
 * @description Settings, administrative configuration, and security page for the Admin Console.
 * @module Admin/Dashboard
 */

import { useState } from 'react';
import {
  User,
  Shield,
  Server,
  CheckCircle,
  AlertTriangle,
  Lock,
  KeyRound,
  Mail,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext.jsx';
import { forgotPassword } from '../../../services/authService.js';

const AdminSettingsPage = () => {
  const { user } = useAuth();
  const [resettingPassword, setResettingPassword] = useState(false);

  const handleSendResetEmail = async () => {
    if (!user?.email) {
      toast.error('Unable to locate admin email address.');
      return;
    }

    try {
      setResettingPassword(true);
      await forgotPassword(user.email);
      toast.success(`Password reset instructions sent to ${user.email}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send password reset email.';
      toast.error(msg);
    } finally {
      setResettingPassword(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage administrator profile details, system environment status, and password security.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Profile & Security */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Profile Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Administrator Profile</h2>
                <p className="text-xs text-slate-500">Your account identity and role permissions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800">
                  {user?.name || user?.fullName || 'System Administrator'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-800">
                  {user?.email || 'admin@gamagerecruiters.com'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Role Authority
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-50/50 border border-blue-100 rounded-lg text-sm font-semibold text-blue-700">
                  <Shield className="w-4 h-4 text-blue-600" />
                  {user?.role || 'ADMIN'}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Session Status
                </label>
                <div className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-50/50 border border-emerald-100 rounded-lg text-sm font-semibold text-emerald-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Active & Authenticated
                </div>
              </div>
            </div>
          </div>

          {/* Password & Authentication Security Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Password & Security</h2>
                <p className="text-xs text-slate-500">Manage account credentials and password reset</p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">Change Admin Password</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Send an authenticated password reset link directly to your verified email (
                    <span className="font-medium text-slate-700">{user?.email}</span>).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSendResetEmail}
                  disabled={resettingPassword}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {resettingPassword ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-3.5 h-3.5" />
                      Send Reset Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: System Status & Security Policies */}
        <div className="space-y-6">
          {/* System Environment Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">System Environment</h2>
                <p className="text-xs text-slate-500">Platform deployment info</p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Platform Version</span>
                <span className="font-semibold text-slate-800">v1.0.0 (Release)</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">API Backend</span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Database Cluster</span>
                <span className="font-medium text-slate-800">MongoDB Atlas</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Client Framework</span>
                <span className="font-medium text-slate-800">React 19 / Vite</span>
              </div>
            </div>
          </div>

          {/* Security & Access Policies Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">Security Policies</h2>
                <p className="text-xs text-slate-500">Admin authentication baseline</p>
              </div>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>JWT tokens with 24-hour expiration cycle.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Password resets strictly enforce 30-minute token validity.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Superadmin accounts protected from unauthorized role modification.</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>All moderation and verification actions recorded in audit logs.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
