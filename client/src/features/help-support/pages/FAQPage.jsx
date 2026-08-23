import { User, Briefcase, Search } from 'lucide-react';
import React, { useState } from 'react';

/**
 * FAQ category section card.
 * Used for grouping FAQs by user type.
 */
function CategoryCard({ icon: Icon, title, items }) {
  return (
    <div
      className="
        bg-white
        border
        border-slate-200
        rounded-xl
        p-5
      "
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="
            w-10
            h-10
            rounded-lg
            bg-blue-100
            flex
            items-center
            justify-center
          "
        >
          <Icon size={20} className="text-blue-600" />
        </div>

        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <p key={item} className="text-sm text-slate-600">
            • {item}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Single FAQ question card.
 */
function FAQCard({ question, answer }) {
  return (
    <div
      className="
        bg-white
        border
        border-slate-200
        rounded-xl
        p-5
      "
    >
      {/* Question */}
      <h3
        className="
          text-sm
          sm:text-base
          font-semibold
          text-slate-900
          mb-2
        "
      >
        {question}
      </h3>

      {/* Answer */}
      <p className="text-sm text-slate-600">{answer}</p>
    </div>
  );
}

// FAQ category data
const CATEGORIES = [
  {
    icon: User,
    title: 'Job Seeker',
    items: ['Account creation', 'Resume upload', 'Job application'],
  },

  {
    icon: Briefcase,
    title: 'Employer',
    items: ['Company registration', 'Job posting', 'Application management'],
  },
];

// FAQ question data
const FAQ_ITEMS = [
  {
    question: 'How do I create a job seeker account?',
    answer: 'Click Sign Up, choose Job Seeker, and complete the registration form.',
  },

  {
    question: 'How do I reset my password?',
    answer: 'Use the Forgot Password option available on the login page.',
  },

  {
    question: 'How do I upload my resume?',
    answer: 'Go to your Profile section and select the Upload Resume option.',
  },

  {
    question: 'How do I post a job as an employer?',
    answer: 'Go to your Employer Dashboard and select Post Job to publish a new listing.',
  },
];

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFAQs = FAQ_ITEMS.filter((faq) =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Page Title */}

        <div className="text-center mb-8">
          <h1 className="text-[30px] font-bold">Frequently Asked Questions</h1>

          {/* Blue underline */}

          <div
            className="
              w-14
              h-1
              bg-blue-600
              rounded-full
              mx-auto
              mt-3
            "
          />
        </div>

        {/* Search Section */}

        <div className="mb-8">
          <div className="relative">
            <Search size={20} className="absolute left-4 top-3.5 text-slate-400" />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search FAQs..."
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
        </div>

        {/* FAQ Layout */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[300px_1fr]
            gap-6
            items-start
          "
        >
          {/* Category Sidebar */}

          <div className="space-y-5">
            {CATEGORIES.map((category) => (
              <CategoryCard key={category.title} {...category} />
            ))}
          </div>

          {/* FAQ Cards */}

          <div className="space-y-5">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => <FAQCard key={faq.question} {...faq} />)
            ) : (
              <div
                className="
                  bg-white
                  border
                  border-slate-200
                  rounded-xl
                  p-5
                  text-sm
                  text-slate-500
                "
              >
                No FAQs found matching your search.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
