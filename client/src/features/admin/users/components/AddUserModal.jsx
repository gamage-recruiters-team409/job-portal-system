/**
 * @file AddUserModal.jsx
 * @description Modal component to add a new user from the admin dashboard.
 * @module Admin/Users/Components
 */

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createAdminUser } from '../../../../services/adminUser.service';
import { USER_ROLES } from '../../../../constants/statuses';
import { useAuth } from '../../../../context/AuthContext';

const getAddUserSchema = (isSuperAdmin) => z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72, 'Password cannot exceed 72 characters'),
  role: z.enum(isSuperAdmin ? [USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER, USER_ROLES.ADMIN] : [USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER], {
    required_error: 'Please select a role',
  }),
});

const AddUserModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === USER_ROLES.SUPERADMIN;

  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState(null);

  const schema = useMemo(() => getAddUserSchema(isSuperAdmin), [isSuperAdmin]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: USER_ROLES.JOB_SEEKER,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    try {
      setApiError(null);
      await createAdminUser(data);
      toast.success('User added successfully!');
      onSuccess();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to add user';
      setApiError(message);
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-slate-900">Add new user</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto">
          <form id="add-user-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-600">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{apiError}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
                Account Details
              </h3>
              
              <div className="flex flex-col gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="e.g. John Doe"
                    className={`w-full h-11 px-3 border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all ${
                      errors.name
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600'
                    }`}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="john@example.com"
                    className={`w-full h-11 px-3 border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="••••••••"
                      className={`w-full h-11 pl-3 pr-10 border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all ${
                        errors.password
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                          : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
                Role & Permissions
              </h3>
              <div className="flex flex-col gap-3">
                {/* Job Seeker Role */}
                <label
                  className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${
                    selectedRole === USER_ROLES.JOB_SEEKER
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      value={USER_ROLES.JOB_SEEKER}
                      {...register('role')}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                    />
                  </div>
                  <div className="ml-3 flex flex-col">
                    <span className={`text-sm font-medium ${selectedRole === USER_ROLES.JOB_SEEKER ? 'text-blue-900' : 'text-slate-900'}`}>
                      Job Seeker
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      Standard user account for searching and applying to jobs.
                    </span>
                  </div>
                </label>

                {/* Employer Role */}
                <label
                  className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${
                    selectedRole === USER_ROLES.EMPLOYER
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center h-5">
                    <input
                      type="radio"
                      value={USER_ROLES.EMPLOYER}
                      {...register('role')}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                    />
                  </div>
                  <div className="ml-3 flex flex-col">
                    <span className={`text-sm font-medium ${selectedRole === USER_ROLES.EMPLOYER ? 'text-blue-900' : 'text-slate-900'}`}>
                      Employer
                    </span>
                    <span className="text-xs text-slate-500 mt-0.5">
                      Company account for posting jobs and managing applicants.
                    </span>
                  </div>
                </label>

                {/* Admin Role (Superadmin Only) */}
                {isSuperAdmin && (
                  <label
                    className={`flex items-start p-4 border rounded-xl cursor-pointer transition-colors ${
                      selectedRole === USER_ROLES.ADMIN
                        ? 'border-blue-600 bg-blue-50/50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center h-5">
                      <input
                        type="radio"
                        value={USER_ROLES.ADMIN}
                        {...register('role')}
                        className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-600"
                      />
                    </div>
                    <div className="ml-3 flex flex-col">
                      <span className={`text-sm font-medium ${selectedRole === USER_ROLES.ADMIN ? 'text-blue-900' : 'text-slate-900'}`}>
                        Admin
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        Administrator account with full system access.
                      </span>
                    </div>
                  </label>
                )}
              </div>
              {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
            </div>

            {/* Note: Account Status is Active by default for new users, so we omit the dropdown here to simplify, matching the backend create route */}
            
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3 bg-slate-50 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="add-user-form"
            disabled={isSubmitting}
            className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding...
              </>
            ) : (
              'Add user'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
