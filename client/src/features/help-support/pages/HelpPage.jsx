import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, User, Briefcase, Info, AlertCircle, Search } from 'lucide-react';

const USER_GUIDES = [
  {
    icon: BookOpen,
    title: 'Getting started',
    description: 'Setting up your account and navigating the portal.',
  },
  {
    icon: User,
    title: 'For job seekers',
    description: 'Searching, applying, and tracking applications.',
  },
  {
    icon: Briefcase,
    title: 'For employers',
    description: 'Posting jobs and managing applicants.',
  },
];

const FEATURES = [
  {
    title: 'Application tracking',
    description: 'Monitor the status of your job applications in real time.',
  },
  {
    title: 'Saved jobs',
    description: 'Bookmark listings for easy access later.',
  },
  {
    title: 'Notifications',
    description: 'Receive updates on applications and messages.',
  },
];

const TROUBLESHOOTING = [
  {
    title: "Can't log in?",
    description: 'Check your email verification status.',
  },
  {
    title: 'Application not submitting?',
    description: 'Confirm all required fields are completed.',
  },
  {
    title: 'Not receiving emails?',
    description: 'Check your spam folder or email settings.',
  },
];

function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGuides = USER_GUIDES.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFeatures = FEATURES.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTroubleshooting = TROUBLESHOOTING.filter(
    (item) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <main className="px-6 py-12 max-w-6xl mx-auto">
        {/* Page Title */}

        <div className="text-center mb-10">
          <h1 className="text-[30px] font-bold mb-2">Help & Support</h1>

          <div className="w-14 h-1 bg-blue-600 rounded mx-auto mt-3"></div>
        </div>

        {/* Search Section */}

        <div className="flex gap-3 mb-8">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="
              absolute
              left-4
              top-3.5
              text-slate-400
              "
            />

            <input
              type="text"

              value={searchTerm}

              onChange={(e) => setSearchTerm(e.target.value)}

              placeholder="Search Help topics..."

              className="
              w-full
              h-12
              rounded-xl
              border
              border-slate-200
              bg-white
              pl-12
              pr-4
              text-sm
              outline-none
              focus:border-blue-600
              "
            />
          </div>

          <button
            onClick={() => setSearchTerm(searchTerm)}

            className="
            bg-blue-600
            text-white
            px-6
            rounded-xl
            font-semibold
            hover:bg-blue-700
            transition
            "
          >
            Search
          </button>
        </div>

        {/* User Guides */}

        <section className="mb-10">
          <h2
            className="
          text-sm
          font-semibold
          text-slate-500
          uppercase
          tracking-wider
          mb-5
          "
          >
            User Guides
          </h2>

          <div
            className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-5
          "
          >
            {filteredGuides.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}

                  className="
                bg-white
                border
                border-slate-200
                rounded-2xl
                p-6
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-lg
                hover:border-blue-300
                "
                >
                  <div
                    className="
                  w-11
                  h-11
                  rounded-xl
                  bg-blue-600
                  text-white
                  flex
                  items-center
                  justify-center
                  mb-4
                  "
                  >
                    <Icon size={20} />
                  </div>

                  <h3
                    className="
                  text-base
                  font-semibold
                  text-slate-900
                  mb-2
                  "
                  >
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              );
            })}
          </div>

          {filteredGuides.length === 0 && (
            <p className="text-sm text-slate-500 mt-4">No help topics found.</p>
          )}
        </section>

        {/* Feature Explanation */}

        <section className="mb-10">
          <h2
            className="
          text-sm
          font-semibold
          text-slate-500
          uppercase
          tracking-wider
          mb-5
          "
          >
            Feature Explanations
          </h2>

          <div
            className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          p-5
          "
          >
            {filteredFeatures.map((item) => (
              <div
                key={item.title}

                className="
                flex
                items-start
                gap-4
                py-4
                px-2
                border-b
                border-slate-200
                last:border-none
                "
              >
                <div
                  className="
                  w-9
                  h-9
                  rounded-full
                  bg-blue-50
                  text-blue-600
                  flex
                  items-center
                  justify-center
                  "
                >
                  <Info size={18} />
                </div>

                <div>
                  <h3
                    className="
                    text-sm
                    font-semibold
                    text-slate-900
                    "
                  >
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredFeatures.length === 0 && (
            <p className="text-sm text-slate-500 mt-4">No features found.</p>
          )}
        </section>

        {/* Troubleshooting */}

        <section className="mb-10">
          <h2
            className="
          text-sm
          font-semibold
          text-slate-500
          uppercase
          tracking-wider
          mb-5
          "
          >
            Troubleshooting
          </h2>

          <div
            className="
          bg-white
          border
          border-slate-200
          rounded-2xl
          p-5
          "
          >
            {filteredTroubleshooting.map((item) => (
              <div
                key={item.title}

                className="
                flex
                items-start
                gap-4
                py-4
                px-2
                border-b
                border-slate-200
                last:border-none
                "
              >
                <div
                  className="
                  w-9
                  h-9
                  rounded-full
                  bg-amber-100
                  text-amber-600
                  flex
                  items-center
                  justify-center
                  "
                >
                  <AlertCircle size={18} />
                </div>

                <div>
                  <h3
                    className="
                    text-sm
                    font-semibold
                    text-slate-900
                    "
                  >
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          {filteredTroubleshooting.length === 0 && (
            <p className="text-sm text-slate-500 mt-4">No troubleshooting topics found.</p>
          )}
        </section>

        {/* CTA */}

        <section
          className="
        bg-blue-100
        border
        border-blue-300
        rounded-2xl
        p-8
        text-center
        shadow-sm
        "
        >
          <p
            className="
          text-base
          font-semibold
          text-slate-900
          mb-4
          "
          >
            Still need help?
          </p>

          <Link
            to="/support"

            className="
          inline-flex
          items-center
          justify-center
          bg-blue-600
          text-white
          px-7
          py-3
          rounded-xl
          font-semibold
          hover:bg-blue-700
          transition
          "
          >
            Submit a Support Request →
          </Link>
        </section>
      </main>
    </div>
  );
}

export default HelpPage;
