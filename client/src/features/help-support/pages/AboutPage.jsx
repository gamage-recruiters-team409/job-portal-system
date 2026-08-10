import { Briefcase, Users, Headphones, CheckCircle2 } from 'lucide-react';

// Reusable card component for Mission and Vision sections
function InfoCard({ title, description }) {
  return (
    <div
      className="
        bg-white
        border border-slate-200
        rounded-2xl
        p-6 sm:p-7
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        hover:border-blue-300
      "
    >
      <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">{title}</h3>

      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

// Reusable service card component
function ServiceCard({ icon: Icon, title, description }) {
  return (
    <div
      className="
        bg-white
        border border-slate-200
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
          w-11 h-11
          rounded-xl
          bg-blue-600
          text-white
          flex
          items-center
          justify-center
          mb-4
          transition-transform
          duration-300
          group-hover:scale-105
        "
      >
        <Icon size={20} strokeWidth={2} />
      </div>

      <h3 className="text-base font-semibold text-slate-900 mb-1.5">{title}</h3>

      <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

// Reusable benefit checklist item component
function BenefitItem({ text, isLast }) {
  return (
    <div
      className={`
        flex items-center gap-3
        py-3.5 px-1
        transition-colors
        duration-200
        hover:bg-slate-50
        ${!isLast ? 'border-b border-slate-200' : ''}
      `}
    >
      <CheckCircle2 size={18} className="text-green-600 shrink-0" />

      <span className="text-sm text-slate-600">{text}</span>
    </div>
  );
}

// Services displayed in About page
const SERVICES = [
  {
    icon: Briefcase,
    title: 'Job Matching',
    description: 'Search and filter job opportunities based on your requirements.',
  },
  {
    icon: Users,
    title: 'Employer Tools',
    description: 'Post jobs and manage applicants efficiently.',
  },
  {
    icon: Headphones,
    title: 'Career Support',
    description: 'Guidance and resources through the Help Center.',
  },
];

// Benefits displayed in About page
const BENEFITS = [
  'Verified employer listings for safer job searching',
  'Simple, guided application process',
  'Dedicated Help & Support for every user type',
];

function AboutPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        {/* Page heading */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            About{' '}
            <span className="underline decoration-blue-600 decoration-[3px] underline-offset-[6px]">
              the
            </span>{' '}
            Job Portal
          </h1>
        </div>

        {/* Company introduction */}
        <section
          className="
            bg-blue-50
            border border-blue-200
            rounded-2xl
            p-6 sm:p-8
            mb-6
            transition-all
            duration-300
            hover:shadow-md
          "
        >
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2">Who We Are</h2>

          <p className="text-sm sm:text-[15px] text-slate-600 leading-relaxed max-w-4xl">
            Gamage Recruiters&apos; Job Portal connects job seekers and employers through a simple
            and transparent hiring experience. We help candidates discover suitable opportunities
            and support companies in building strong teams.
          </p>
        </section>

        {/* Mission and Vision */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InfoCard
            title="Our Mission"
            description="To make job searching and hiring simple, fast, and accessible for everyone in the recruitment ecosystem."
          />

          <InfoCard
            title="Our Vision"
            description="To become the most trusted recruitment platform, connecting talent with opportunity at scale."
          />
        </section>

        {/* Services section */}
        <section
          className="
            bg-blue-50
            border border-blue-200
            rounded-2xl
            p-6 sm:p-8
            mb-6
          "
        >
          <h2 className="text-xs sm:text-sm font-semibold text-blue-600 uppercase tracking-wider mb-4">
            Services Provided
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </section>

        {/* Benefits section */}
        <section>
          <h2 className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Benefits of Using the Platform
          </h2>

          <div
            className="
              bg-white
              border border-slate-200
              rounded-2xl
              px-5 sm:px-6
              transition-shadow
              duration-300
              hover:shadow-md
            "
          >
            {BENEFITS.map((benefit, index) => (
              <BenefitItem key={benefit} text={benefit} isLast={index === BENEFITS.length - 1} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default AboutPage;
