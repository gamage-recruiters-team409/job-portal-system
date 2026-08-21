import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Briefcase,
  Building2,
  TrendingUp,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Clock,
  Zap,
  Star,
} from 'lucide-react';
import { listJobs } from '../services/jobService.js';
import { getCategories } from '../services/referenceService.js';

/**
 * @file FoundationPage.jsx
 * @description Public Home / Landing page for Gamage Recruiters Job Portal.
 * Inherits layout and section structure from the team's mock UI (JobPortal
 * prototype) and adapts it to the real API, shared components, and project
 * design system. Owned by Bimsara (Authentication + Public Job Discovery).
 * @module Pages/Public
 */

// ─── Inline SVG Illustration ────────────────────────────────────────────────
function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 520 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      {/* Background glow blobs */}
      <ellipse cx="340" cy="200" rx="160" ry="130" fill="#2563EB" fillOpacity="0.07" />
      <ellipse cx="420" cy="300" rx="100" ry="80" fill="#7C3AED" fillOpacity="0.06" />

      {/* Dot grid pattern */}
      {[...Array(8)].map((_, row) =>
        [...Array(10)].map((_, col) => (
          <circle
            key={`dot-${row}-${col}`}
            cx={160 + col * 36}
            cy={40 + row * 42}
            r="1.5"
            fill="#CBD5E1"
            fillOpacity="0.5"
          />
        ))
      )}

      {/* Person silhouette — standing figure */}
      {/* Body */}
      <rect x="238" y="210" width="44" height="70" rx="8" fill="#1E40AF" />
      {/* Head */}
      <circle cx="260" cy="193" r="22" fill="#DBEAFE" />
      <circle cx="260" cy="193" r="16" fill="#93C5FD" />
      {/* Face highlight */}
      <circle cx="255" cy="189" r="4" fill="white" fillOpacity="0.6" />
      {/* Left arm */}
      <rect
        x="215"
        y="218"
        width="28"
        height="10"
        rx="5"
        fill="#1E40AF"
        transform="rotate(-15 215 218)"
      />
      {/* Right arm */}
      <rect
        x="257"
        y="218"
        width="30"
        height="10"
        rx="5"
        fill="#1E40AF"
        transform="rotate(20 257 218)"
      />
      {/* Legs */}
      <rect x="243" y="276" width="14" height="50" rx="6" fill="#1D4ED8" />
      <rect x="263" y="276" width="14" height="50" rx="6" fill="#1D4ED8" />
      {/* Shoes */}
      <rect x="238" y="320" width="22" height="10" rx="5" fill="#1E3A8A" />
      <rect x="260" y="320" width="22" height="10" rx="5" fill="#1E3A8A" />

      {/* Shadow */}
      <ellipse cx="260" cy="338" rx="40" ry="6" fill="#94A3B8" fillOpacity="0.25" />

      {/* Floating job card — top left */}
      <g transform="translate(60, 80)">
        <rect width="150" height="72" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="0" y="0" width="150" height="72" rx="12" fill="white" />
        <rect x="12" y="14" width="30" height="30" rx="7" fill="#DBEAFE" />
        <rect x="15" y="20" width="24" height="3" rx="1.5" fill="#2563EB" />
        <rect x="15" y="26" width="16" height="2.5" rx="1.25" fill="#93C5FD" />
        <rect x="15" y="31" width="20" height="2.5" rx="1.25" fill="#BFDBFE" />
        <rect x="52" y="16" width="80" height="6" rx="3" fill="#1E293B" />
        <rect x="52" y="27" width="55" height="4" rx="2" fill="#94A3B8" />
        <rect x="52" y="36" width="40" height="4" rx="2" fill="#94A3B8" />
        <rect x="12" y="54" width="50" height="6" rx="3" fill="#DCFCE7" />
        <rect x="14" y="55.5" width="46" height="3" rx="1.5" fill="#16A34A" />
        <rect x="100" y="54" width="38" height="6" rx="3" fill="#EFF6FF" />
        <rect x="102" y="55.5" width="34" height="3" rx="1.5" fill="#2563EB" />
        {/* Animated ping dot */}
        <circle cx="140" cy="12" r="5" fill="#2563EB" fillOpacity="0.9" />
        <circle cx="140" cy="12" r="3" fill="white" />
      </g>

      {/* Floating job card — right side */}
      <g transform="translate(350, 60)">
        <rect width="145" height="66" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="11" y="12" width="28" height="28" rx="6" fill="#F3E8FF" />
        <rect x="14" y="17" width="22" height="3" rx="1.5" fill="#7C3AED" />
        <rect x="14" y="23" width="15" height="2.5" rx="1.25" fill="#C4B5FD" />
        <rect x="14" y="29" width="18" height="2.5" rx="1.25" fill="#DDD6FE" />
        <rect x="48" y="14" width="78" height="5.5" rx="2.75" fill="#1E293B" />
        <rect x="48" y="24" width="52" height="4" rx="2" fill="#94A3B8" />
        <rect x="48" y="33" width="38" height="4" rx="2" fill="#94A3B8" />
        <rect x="11" y="48" width="52" height="6" rx="3" fill="#FEF3C7" />
        <rect x="13" y="49.5" width="48" height="3" rx="1.5" fill="#D97706" />
        <circle cx="133" cy="11" r="5" fill="#7C3AED" fillOpacity="0.9" />
        <circle cx="133" cy="11" r="3" fill="white" />
      </g>

      {/* Floating card — bottom right */}
      <g transform="translate(355, 240)">
        <rect width="130" height="60" rx="11" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="10" y="11" width="26" height="26" rx="6" fill="#FEE2E2" />
        <rect x="13" y="17" width="20" height="3" rx="1.5" fill="#DC2626" />
        <rect x="13" y="23" width="13" height="2.5" rx="1.25" fill="#FCA5A5" />
        <rect x="13" y="28" width="17" height="2.5" rx="1.25" fill="#FECACA" />
        <rect x="44" y="13" width="74" height="5" rx="2.5" fill="#1E293B" />
        <rect x="44" y="23" width="50" height="4" rx="2" fill="#94A3B8" />
        <rect x="44" y="31" width="36" height="4" rx="2" fill="#94A3B8" />
        <rect x="10" y="44" width="48" height="6" rx="3" fill="#DCFCE7" />
        <rect x="12" y="45.5" width="44" height="3" rx="1.5" fill="#16A34A" />
      </g>

      {/* Floating badge — "New" */}
      <g transform="translate(165, 145)">
        <rect width="68" height="26" rx="13" fill="#2563EB" />
        <rect x="2" y="2" width="64" height="22" rx="11" fill="#3B82F6" />
        <text
          x="12"
          y="16"
          fontFamily="Inter, sans-serif"
          fontSize="10"
          fontWeight="700"
          fill="white"
        >
          ✦ NEW
        </text>
      </g>

      {/* Stars / sparkles */}
      <g fill="#FCD34D">
        <polygon
          points="90,55 93,63 101,63 95,68 97,76 90,71 83,76 85,68 79,63 87,63"
          transform="scale(0.6) translate(65,60)"
        />
        <polygon
          points="90,55 93,63 101,63 95,68 97,76 90,71 83,76 85,68 79,63 87,63"
          transform="scale(0.45) translate(820,100)"
        />
        <polygon
          points="90,55 93,63 101,63 95,68 97,76 90,71 83,76 85,68 79,63 87,63"
          transform="scale(0.4) translate(1100,530)"
        />
      </g>

      {/* Upward arrows */}
      <g stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="330,340 330,325 338,333" />
        <polyline points="330,325 322,333" />
      </g>
      <g stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <polyline points="170,350 170,335 178,343" />
        <polyline points="170,335 162,343" />
      </g>

      {/* Connecting dashed lines from cards to person */}
      <line
        x1="210"
        y1="116"
        x2="238"
        y2="200"
        stroke="#CBD5E1"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
      <line
        x1="350"
        y1="93"
        x2="282"
        y2="200"
        stroke="#CBD5E1"
        strokeWidth="1.5"
        strokeDasharray="4 4"
      />
    </svg>
  );
}

// ─── Stats counter hook ──────────────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const step = target / (duration / 16);
    let current = 0;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

// ─── How It Works steps ─────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Users,
    title: 'Create your profile',
    desc: 'Sign up in minutes. Add your skills, experience, and upload your CV to stand out.',
    color: 'bg-blue-50 text-blue-600',
    border: 'border-blue-100',
  },
  {
    step: '02',
    icon: Search,
    title: 'Discover opportunities',
    desc: 'Browse hundreds of verified jobs filtered by role, location, salary, and type.',
    color: 'bg-violet-50 text-violet-600',
    border: 'border-violet-100',
  },
  {
    step: '03',
    icon: Zap,
    title: 'Apply in one click',
    desc: 'Send your application instantly. Track every status update in your dashboard.',
    color: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
  },
];

// ─── Testimonials ────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: 'Amara Perera',
    role: 'Frontend Developer',
    avatar: 'AP',
    color: 'bg-blue-600',
    text: 'Found my dream role within two weeks of signing up. The search filters made it so easy to find exactly what I was looking for.',
    stars: 5,
  },
  {
    name: 'Kasun Silva',
    role: 'HR Manager',
    avatar: 'KS',
    color: 'bg-violet-600',
    text: 'As an employer, the quality of applicants has been excellent. The platform makes managing job posts and reviewing CVs effortless.',
    stars: 5,
  },
  {
    name: 'Nimasha Fernando',
    role: 'Data Analyst',
    avatar: 'NF',
    color: 'bg-emerald-600',
    text: 'The job alerts and application tracking are brilliant. I always knew exactly where my applications stood.',
    stars: 5,
  },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FoundationPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [recentJobs, setRecentJobs] = useState([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const animatedTotal = useCountUp(totalJobs);

  // Load live stats + featured jobs from API
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [jobsRes, catsRes] = await Promise.all([
          listJobs({ limit: 4, page: 1 }),
          getCategories(),
        ]);
        if (!active) return;
        setRecentJobs(jobsRes?.data?.jobs ?? []);
        setTotalJobs(jobsRes?.data?.pagination?.total ?? 0);
        setCategories((catsRes ?? []).slice(0, 6));
      } catch {
        // Non-critical — page still renders without live data
      } finally {
        if (active) setLoadingJobs(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    navigate(`/jobs?${params.toString()}`);
  }, [q, navigate]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter') handleSearch();
    },
    [handleSearch]
  );

  return (
    <div className="animate-fade-in">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700">
        {/* Dot grid background */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Glow blobs */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-400 opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-blue-300 opacity-20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:flex lg:items-center lg:gap-12 lg:py-24">
          {/* Left: Copy */}
          <div className="flex-1">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              <Sparkles size={12} />
              {animatedTotal > 0
                ? `${animatedTotal}+ jobs live right now`
                : 'Opportunities waiting for you'}
            </span>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              Find the job that{' '}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10 text-blue-200">fits your life</span>
                <svg
                  className="absolute -bottom-1 left-0 z-0 w-full"
                  viewBox="0 0 220 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6C50 2 120 2 218 6"
                    stroke="#93C5FD"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-blue-100">
              Search thousands of verified roles from top Sri Lankan and international companies.
              Build your profile, apply in minutes, and land your next opportunity.
            </p>

            {/* Search bar */}
            <div className="mt-8 max-w-lg">
              <div className="flex w-full flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2 px-3 py-2">
                  <Search size={18} className="shrink-0 text-slate-400" />
                  <input
                    id="hero-search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Job title, skill or keyword…"
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
                >
                  Search
                </button>
              </div>

              {/* Quick category chips */}
              {categories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => navigate(`/jobs?category=${cat._id}`)}
                      className="rounded-full border border-white/25 px-3 py-1 text-xs font-medium text-white transition-colors duration-150 hover:bg-white/15"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Trust signals */}
            <div className="mt-8 flex flex-wrap items-center gap-5 text-sm text-blue-200">
              {[
                { icon: CheckCircle, text: 'Verified employers' },
                { icon: Clock, text: 'Updated daily' },
                { icon: Star, text: 'Free for job seekers' },
              ].map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-1.5">
                  <Icon size={15} className="text-blue-300" />
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Illustration */}
          <div className="mt-12 hidden flex-shrink-0 lg:mt-0 lg:block lg:w-[480px]">
            <div className="relative">
              {/* Glow ring behind illustration */}
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-10 blur-2xl" />
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              {
                icon: Briefcase,
                value: animatedTotal > 0 ? `${animatedTotal}+` : '—',
                label: 'Active listings',
              },
              { icon: Building2, value: '50+', label: 'Hiring companies' },
              { icon: TrendingUp, value: '3×', label: 'Faster applications' },
              { icon: Users, value: '1,000+', label: 'Registered candidates' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-xl font-bold text-slate-900">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Jobs ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Latest Opportunities
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Featured Jobs</h2>
            <p className="mt-1 text-sm text-slate-500">
              Hand-picked opportunities from top employers
            </p>
          </div>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors duration-150 hover:text-blue-800"
          >
            View all jobs <ArrowRight size={15} />
          </Link>
        </div>

        {loadingJobs ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : recentJobs.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {recentJobs.map((job) => {
              const company = job?.companyId ?? {};
              const companyName = company?.companyName ?? 'Company';
              const initial = companyName.charAt(0).toUpperCase();
              return (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {company?.companyLogo ? (
                    <img
                      src={company.companyLogo}
                      alt={companyName}
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-lg font-bold text-blue-700">
                      {initial}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                      {job.title}
                    </h3>
                    <p className="truncate text-sm text-slate-500">{companyName}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {job.location && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                          <MapPin size={10} />
                          {job.location}
                        </span>
                      )}
                      {job.jobType && (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                          {job.jobType}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    size={16}
                    className="mt-1 shrink-0 text-slate-300 transition-colors duration-150 group-hover:text-blue-500"
                  />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50 py-16 text-center">
            <Briefcase size={32} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">
              No jobs available right now — check back soon!
            </p>
            <Link
              to="/jobs"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Browse all listings <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="border-y border-slate-200 bg-slate-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Simple Process
            </p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">How it works</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              Get from sign-up to hired in three straightforward steps.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color, border }) => (
              <div key={step} className="relative">
                {/* Connector line */}
                <div className="absolute left-full top-8 hidden h-px w-full -translate-x-4 bg-slate-200 md:block last:hidden" />
                <div
                  className={`relative rounded-2xl border ${border} bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <span className="absolute right-4 top-4 text-xs font-bold text-slate-300">
                    {step}
                  </span>
                  <span
                    className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
                  >
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            What people say
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            Trusted by job seekers & employers
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ name, role, avatar, color, text, stars }) => (
            <div
              key={name}
              className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex gap-0.5">
                {[...Array(stars)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed text-slate-600">"{text}"</p>
              <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} text-xs font-bold text-white`}
                >
                  {avatar}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-500">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-14 text-center">
          {/* Background glows */}
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-blue-600/30 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-violet-600/30 blur-3xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              <Sparkles size={12} />
              It's free for job seekers
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white">
              Ready to make your next move?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">
              Create your free account and start applying to hundreds of verified roles in minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-500"
              >
                Get started free <ArrowRight size={15} />
              </Link>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-white/20"
              >
                Browse jobs
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
