import { User, Briefcase, Search } from 'lucide-react';

/**
 * FAQ category section card.
 * Used for grouping FAQs by user type.
 */
function CategoryCard({ icon: Icon, title, items }) {
  return (
    <div
      className="
        bg-blue-50 
        border border-blue-200 
        rounded-2xl 
        p-6
      "
    >
      {/* Category Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="
            w-10 h-10 
            rounded-xl 
            bg-blue-600 
            text-white 
            flex 
            items-center 
            justify-center
          "
        >
          <Icon size={20} />
        </div>

        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>

      {/* Category Questions */}
      <ul className="space-y-2 pl-2">
        {items.map((item) => (
          <li
            key={item}
            className="
              text-sm 
              text-slate-600
              hover:text-blue-600
              cursor-pointer
              transition
            "
          >
            {item}
          </li>
        ))}
      </ul>
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
        border border-slate-200
        rounded-2xl
        p-5
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        hover:border-blue-300
      "
    >
      {/* Question */}
      <div className="flex gap-3 items-start">
        <div
          className="
            w-8 h-8
            rounded-full
            bg-blue-50
            text-blue-600
            flex
            items-center
            justify-center
            font-semibold
            shrink-0
          "
        >
          ?
        </div>

        <h3
          className="
            text-sm
            sm:text-base
            font-semibold
            text-slate-900
          "
        >
          {question}
        </h3>
      </div>

      {/* Answer */}
      <p
        className="
          mt-3
          ml-11
          text-sm
          text-slate-600
          leading-relaxed
        "
      >
        {answer}
      </p>
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
  return (
    <div className="bg-slate-50 min-h-screen">
      <main
        className="
          max-w-[1280px]
          mx-auto
          px-4
          sm:px-6
          lg:px-10
          py-10
          sm:py-14
        "
      >
        {/* Page Title */}
        <div className="text-center mb-8">
          <h1
            className="
              text-3xl
              sm:text-4xl
              font-bold
              text-slate-900
            "
          >
            Frequently Asked Questions
          </h1>

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
        <div
          className="
            flex
            gap-3
            mb-8
          "
        >
          <div
            className="
              flex-1
              relative
            "
          >
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

          <button
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
            {FAQ_ITEMS.map((faq) => (
              <FAQCard key={faq.question} {...faq} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
