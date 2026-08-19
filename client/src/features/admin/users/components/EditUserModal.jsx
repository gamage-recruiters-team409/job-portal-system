/**
 * @file EditUserModal.jsx
 * @description Modal component to edit an existing user from the admin dashboard.
 * @module Admin/Users/Components
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateAdminUser, updateAdminUserStatus } from '../../../../services/adminUser.service';
import { USER_ROLES, ACCOUNT_STATUSES } from '../../../../constants/statuses';

// Validation Schema
const editUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().trim().min(1, 'Email is required').email('Please provide a valid email address'),
  role: z.enum([USER_ROLES.JOB_SEEKER, USER_ROLES.EMPLOYER], {
    required_error: 'Please select a role',
  }),
  accountStatus: z.enum([ACCOUNT_STATUSES.ACTIVE, ACCOUNT_STATUSES.SUSPENDED, ACCOUNT_STATUSES.INACTIVE]),
});

const EditUserModal = ({ user, onClose, onSuccess }) => {
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || USER_ROLES.JOB_SEEKER,
      accountStatus: user?.accountStatus || ACCOUNT_STATUSES.ACTIVE,
    },
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email,
        role: user.role,
        accountStatus: user.accountStatus,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      setApiError(null);
      
      // Update basic fields if they changed
      if (data.name !== user.name || data.email !== user.email || data.role !== user.role) {
        await updateAdminUser(user._id, {
          name: data.name,
          email: data.email,
          role: data.role,
        });
      }

      // Update status if it changed
      if (data.accountStatus !== user.accountStatus) {
        await updateAdminUserStatus(user._id, data.accountStatus);
      }

      toast.success('User updated successfully!');
      onSuccess();
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Failed to update user';
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
          <h2 className="text-xl font-bold text-slate-900">Edit user profile</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto">
          <form id="edit-user-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
            
            {apiError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-600">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p className="text-sm font-medium">{apiError}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider">
                  Account Details
                </h3>
              </div>
              
              <div className="flex flex-col gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Full name
                  </label>
                  <input
                    type="text"
                    {...register('name')}
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
                    className={`w-full h-11 px-3 border rounded-xl text-sm focus:outline-none focus:ring-1 transition-all ${
                      errors.email
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500 bg-red-50'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600'
                    }`}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
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
              </div>
              {errors.role && <p className="mt-1 text-xs text-red-600">{errors.role.message}</p>}
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
                Account Status
              </h3>
              <div>
                <select
                  {...register('accountStatus')}
                  className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all bg-white"
                >
                  <option value={ACCOUNT_STATUSES.ACTIVE}>Active</option>
                  <option value={ACCOUNT_STATUSES.SUSPENDED}>Suspended</option>
                  <option value={ACCOUNT_STATUSES.INACTIVE}>Inactive</option>
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  Suspended and inactive users will not be able to log in to the system.
                </p>
              </div>
            </div>

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
            form="edit-user-form"
            disabled={isSubmitting || !isDirty}
            className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
