import React, { useState } from 'react';
import apiClient from '../../../services/apiClient';

function SupportFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
    role: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    // Frontend validation

    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    if (!formData.message.trim()) {
      setError('Message field is required');
      return;
    }

    if (!formData.role) {
      setError('Please select your role');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/support', formData);

      setSubmitted(true);

      setFormData({
        fullName: '',
        email: '',
        subject: '',
        message: '',
        role: '',
      });
    } catch (err) {
      console.error('Support submission failed:', err.response?.data || err.message);

      setError(err.response?.data?.message || 'Failed to submit message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <main className="flex justify-center px-6 py-12">
        <div className="w-full max-w-[600px] flex flex-col gap-6">
          {/* Title */}

          <div className="text-center">
            <h1 className="text-[30px] font-bold mb-2">Submit a support message</h1>

            <div className="w-14 h-[3px] bg-[#2563EB] rounded mx-auto"></div>
          </div>

          {/* Success */}

          {submitted && (
            <div
              className="
              flex items-center gap-4
              bg-[#DCFCE7]
              border border-[#86EFAC]
              rounded-xl
              p-5
              "
            >
              <div
                className="
                w-9 h-9 rounded-full
                bg-[#16A34A]
                text-white
                flex items-center
                justify-center
                font-bold
                "
              >
                ✓
              </div>

              <div className="text-sm text-[#166534]">
                <b className="block text-[#14532D]">Message sent successfully</b>
                Our team will get back to you within 24 hours.
              </div>
            </div>
          )}

          {!submitted && (
            <>
              {/* Error */}

              {error && (
                <div
                  className="
              bg-red-50
              border
              border-red-200
              text-red-600
              text-sm
              rounded-xl
              p-4
              "
                >
                  ⚠ {error}
                </div>
              )}

              {/* Intro */}

              <div
                className="
            flex items-center gap-4
            bg-[#EFF6FF]
            border border-[#BFDBFE]
            rounded-xl
            p-5
            "
              >
                <div
                  className="
              w-9 h-9
              rounded-lg
              bg-[#2563EB]
              text-white
              flex
              items-center
              justify-center
              font-bold
              "
                >
                  i
                </div>

                <p className="text-sm text-[#475569]">
                  Fill in the details below and our support team will respond within 24 hours.
                </p>
              </div>

              {/* Form */}

              <form
                onSubmit={handleSubmit}

                className="
            bg-white
            border border-[#E2E8F0]
            rounded-xl
            p-7
            shadow-sm
            "
              >
                {/* Full Name */}

                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-sm font-medium">Full name</label>

                  <input
                    name="fullName"

                    value={formData.fullName}

                    onChange={handleChange}

                    type="text"

                    placeholder="Enter your full name"

                    className="
                h-12
                border border-[#E2E8F0]
                rounded-lg
                px-4
                outline-none
                focus:border-[#2563EB]
                "
                  />
                </div>

                {/* Email */}

                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-sm font-medium">Email address</label>

                  <input
                    name="email"

                    value={formData.email}

                    onChange={handleChange}

                    type="email"

                    placeholder="you@example.com"

                    className="
                h-12
                border border-[#E2E8F0]
                rounded-lg
                px-4
                outline-none
                focus:border-[#2563EB]
                "
                  />
                </div>

                {/* Subject */}

                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-sm font-medium">Subject</label>

                  <input
                    name="subject"

                    value={formData.subject}

                    onChange={handleChange}

                    type="text"

                    placeholder="What's this about?"

                    className="
                h-12
                border border-[#E2E8F0]
                rounded-lg
                px-4
                outline-none
                "
                  />
                </div>

                {/* Message */}

                <div className="flex flex-col gap-2 mb-5">
                  <label className="text-sm font-medium">Message</label>

                  <textarea
                    name="message"

                    value={formData.message}

                    onChange={handleChange}

                    placeholder="Describe your issue or question..."

                    className="
                h-28
                resize-none
                border border-[#E2E8F0]
                rounded-lg
                p-4
                outline-none
                focus:border-[#2563EB]
                "
                  />
                </div>

                {/* Role */}

                <div className="flex gap-6 text-sm text-[#475569] mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"

                      name="role"

                      value="jobSeeker"

                      checked={formData.role === 'jobSeeker'}

                      onChange={handleChange}

                      className="accent-[#2563EB]"
                    />
                    I am a Job Seeker
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"

                      name="role"

                      value="employer"

                      checked={formData.role === 'employer'}

                      onChange={handleChange}

                      className="accent-[#2563EB]"
                    />
                    I am an Employer
                  </label>
                </div>

                {/* Submit Button */}

                <button
                  type="submit"

                  disabled={loading}

                  className="
              w-full
              h-12
              rounded-lg
              bg-[#2563EB]
              text-white
              font-semibold
              hover:bg-[#1E40AF]
              transition-all
              disabled:opacity-50
              disabled:cursor-not-allowed
              "
                >
                  {loading ? 'Submitting...' : 'Submit message'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default SupportFormPage;
