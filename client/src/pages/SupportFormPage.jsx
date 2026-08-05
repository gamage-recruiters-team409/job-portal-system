import React, { useState } from 'react';

function SupportFormPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const form = e.target;
    const email = form.email.value;
    const message = form.message.value;

    if (!email.includes('@') || !message.trim()) {
      setError(true);
      return;
    }

    setError(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      {/* Main Content */}
      <main className="flex justify-center px-6 py-12">
        <div className="w-full max-w-[600px] flex flex-col gap-6">
          {/* Title */}
          <div className="text-center">
            <h1 className="text-[30px] font-bold mb-2">Submit a support message</h1>

            <div className="w-14 h-[3px] bg-[#2563EB] rounded mx-auto"></div>
          </div>

          {/* Success Message */}
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
                flex items-center justify-center
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

          {/* Intro Card */}
          {!submitted && (
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
                flex items-center justify-center
                font-bold
              "
              >
                i
              </div>

              <p
                className="
                text-sm
                text-[#475569]
              "
              >
                Fill in the details below and our support team will respond within 24 hours.
              </p>
            </div>
          )}

          {/* Form Card */}
          <form
            onSubmit={handleSubmit}
            className={`
              bg-white
              border border-[#E2E8F0]
              rounded-xl
              p-7
              shadow-sm
              transition-all
              duration-300
              ${
                submitted
                  ? 'opacity-50 pointer-events-none'
                  : 'hover:-translate-y-1 hover:border-[#2563EB] hover:shadow-lg'
              }
            `}
          >
            {/* Name */}
            <div className="flex flex-col gap-2 mb-5">
              <label className="text-sm font-medium">Full name</label>

              <input
                type="text"
                placeholder="Enter your full name"
                className="
                  h-12
                  border border-[#E2E8F0]
                  rounded-lg
                  px-4
                  outline-none
                  focus:border-[#2563EB]
                  focus:ring-4
                  focus:ring-[#EFF6FF]
                "
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2 mb-5">
              <label className="text-sm font-medium">Email address</label>

              <input
                name="email"
                type="email"
                placeholder="you@example.com"
                className={`
                  h-12
                  border
                  rounded-lg
                  px-4
                  outline-none
                  ${error ? 'border-red-500 bg-red-50' : 'border-[#E2E8F0]'}
                  focus:border-[#2563EB]
                  focus:ring-4
                  focus:ring-[#EFF6FF]
                `}
              />

              {error && (
                <span className="text-xs text-red-600">⚠ Please enter a valid email address</span>
              )}
            </div>

            {/* Subject */}
            <div className="flex flex-col gap-2 mb-5">
              <label className="text-sm font-medium">Subject</label>

              <input
                type="text"
                placeholder="What's this about?"
                className="
                  h-12
                  border border-[#E2E8F0]
                  rounded-lg
                  px-4
                  outline-none
                  focus:border-[#2563EB]
                  focus:ring-4
                  focus:ring-[#EFF6FF]
                "
              />
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2 mb-5">
              <label className="text-sm font-medium">Message</label>

              <textarea
                name="message"
                placeholder="Describe your issue or question..."
                className={`
                  h-28
                  resize-none
                  border
                  rounded-lg
                  p-4
                  outline-none
                  ${error ? 'border-red-500 bg-red-50' : 'border-[#E2E8F0]'}
                  focus:border-[#2563EB]
                  focus:ring-4
                  focus:ring-[#EFF6FF]
                `}
              />

              {error && <span className="text-xs text-red-600">⚠ Message field is required</span>}
            </div>

            {/* Role */}
            <div
              className="
              flex
              gap-6
              text-sm
              text-[#475569]
              mb-6
            "
            >
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="role" className="accent-[#2563EB]" />I am a Job Seeker
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="role" className="accent-[#2563EB]" />I am an Employer
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="
                w-full
                h-12
                rounded-lg
                bg-[#2563EB]
                text-white
                font-semibold
                transition-all
                duration-300
                hover:bg-[#1E40AF]
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              Submit message
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default SupportFormPage;
