import React, { useState } from 'react';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadCompanyLogo } from '../../../services/companyService.js';

export default function ChangeLogoModal({ isOpen, onClose, onSuccess, currentLogo }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setError('');

    if (!file) {
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Only PNG, JPG, and JPEG image files are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be 2MB or less.');
      return;
    }

    // Enforce minimum 200x200px dimensions (same rule as CompanyProfileForm)
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < 200 || img.naturalHeight < 200) {
        setError('Image must be at least 200x200px.');
        URL.revokeObjectURL(objectUrl);
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(objectUrl);
    };
    img.onerror = () => {
      setError('Could not read this image file. Please try another.');
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image file to upload.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await uploadCompanyLogo(selectedFile);
      const updatedCompany = response?.data?.company;
      if (onSuccess) {
        onSuccess(updatedCompany);
      }
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload company logo. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-bold text-slate-900">Change Company Logo</h3>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-blue-400 transition bg-slate-50">
            {previewUrl || currentLogo ? (
              <img
                src={previewUrl || currentLogo}
                alt="Logo preview"
                className="h-24 w-24 rounded-xl object-cover border border-slate-200 shadow-xs"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-slate-200 text-slate-400">
                <ImageIcon className="h-10 w-10" />
              </div>
            )}

            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-600 border border-slate-200 shadow-xs hover:bg-blue-50 transition">
              <Upload className="h-4 w-4" />
              <span>{selectedFile ? 'Choose another image' : 'Select image file'}</span>
              <input
                type="file"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="mt-2 text-xs text-slate-500">PNG or JPG, max 2MB, min 200x200px</p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Save Logo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
