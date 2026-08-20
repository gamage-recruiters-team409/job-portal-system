import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function TopNavbar({
  userName = 'User',
  userRole = '',
  avatarUrl = '',
  notificationCount = 0,
  // Remove searchPlaceholder prop – we'll hardcode it
  profilePath = '/profile',
  profileDisabled = false,
  onMenuClick = () => {},
  onLogout = () => {},
  onNotificationsClick = () => {},
  onProfileClick = null,
  notificationButtonRef = null,
}) {
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Normalize role
  const normalizedRole = userRole?.toLowerCase().trim();

  // ─── Placeholder – hardcoded for both roles ──────────────
  const PLACEHOLDER = 'Search...';

  // ─── Close dropdown ──────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Keyword maps ────────────────────────────────────────
  const employerKeywords = [
    { keywords: ['dashboard', 'home', 'employer dashboard', 'overview', 'recent applications', 'active jobs', 'total applications', 'total job posts', 'closed jobs', 'quick actions'], route: '/employer/dashboard' },
    { keywords: ['jobs', 'manage jobs', 'my jobs', 'job status', 'deadline', 'preview', 'close job'], route: '/jobs/manage' },
    { keywords: ['create job', 'post a job', 'new job posting', 'post job'], route: '/jobs/create' },
    { keywords: ['edit job', 'update job', 'modify job'], route: '/jobs/manage' },
    { keywords: ['applicants', 'candidate', 'candidates', 'applicant list', 'search applicants', 'filters', 'skills', 'education', 'experience', 'status', 'applied date'], route: '/applicants' },
    { keywords: ['company', 'profile', 'company profile', 'create company', 'verify', 'verification', 'organization'], route: '/employer/company' },
    { keywords: ['notifications', 'alerts', 'updates', 'notification center', 'application', 'status'], route: '/notifications' },
  ];

  const jobSeekerKeywords = [
    { keywords: ['dashboard', 'home', 'job seeker dashboard', 'overview', 'welcome'], route: '/dashboard' },
    { keywords: ['profile', 'my profile', 'about me', 'edit profile', 'personal details'], route: '/profile' },
    { keywords: ['education', 'my education', 'qualification', 'degree'], route: '/profile/education' },
    { keywords: ['skills', 'my skills', 'technical skills', 'skill set'], route: '/profile/skills' },
    { keywords: ['experience', 'work experience', 'career', 'job history'], route: '/profile/experience' },
    { keywords: ['cv', 'resume', 'upload cv', 'my cv', 'view cv'], route: '/profile/cv' },
    { keywords: ['portfolio', 'links', 'projects', 'my portfolio'], route: '/profile/portfolio' },
    { keywords: ['profile completion', 'completion status', 'profile progress'], route: '/profile/completion' },
    { keywords: ['jobs', 'find jobs', 'search jobs', 'browse jobs', 'opportunities', 'vacancies'], route: '/jobs' },
    { keywords: ['saved jobs', 'bookmarks', 'favourites', 'saved', 'bookmarked jobs'], route: '/saved-jobs' },
    { keywords: ['applications', 'my applications', 'applied jobs', 'application history', 'status'], route: '/my-applications' },
    { keywords: ['reported jobs', 'reports', 'my reports', 'job reports'], route: '/my-reported-jobs' },
    { keywords: ['notifications', 'alerts', 'updates', 'notification center', 'bell'], route: '/notifications' },
  ];

  // ─── Search handler ──────────────────────────────────────
  function handleSearchSubmit(e) {
    e.preventDefault();
    const trimmedQuery = searchValue.trim().toLowerCase();
    if (!trimmedQuery) return;

    const words = trimmedQuery.split(/\s+/);

    const isContiguousMatch = (kwWords, queryWords) => {
      if (kwWords.length > queryWords.length) return false;
      for (let i = 0; i <= queryWords.length - kwWords.length; i++) {
        let match = true;
        for (let j = 0; j < kwWords.length; j++) {
          if (queryWords[i + j] !== kwWords[j]) {
            match = false;
            break;
          }
        }
        if (match) return true;
      }
      return false;
    };

    const findRoute = (keywordMap) => {
      // 1. Check multi‑word phrases first (e.g., "create job")
      for (const entry of keywordMap) {
        for (const keyword of entry.keywords) {
          if (keyword.includes(' ')) {
            const kwWords = keyword.split(/\s+/);
            if (isContiguousMatch(kwWords, words)) {
              return entry.route;
            }
          }
        }
      }
      // 2. Then check single‑word exact matches
      for (const entry of keywordMap) {
        for (const keyword of entry.keywords) {
          if (!keyword.includes(' ') && words.includes(keyword)) {
            return entry.route;
          }
        }
      }
      return null;
    };

    let route = null;
    if (normalizedRole === 'employer') {
      route = findRoute(employerKeywords);
    } else if (normalizedRole === 'job_seeker' || normalizedRole === 'job seeker') {
      route = findRoute(jobSeekerKeywords);
    }

    if (route) {
      navigate(route);
      return;
    }

    // ─── Fallback: real search ────────────────────────────
    if (normalizedRole === 'employer') {
      navigate(`/applicants?search=${encodeURIComponent(trimmedQuery)}`);
    } else if (normalizedRole === 'job_seeker' || normalizedRole === 'job seeker') {
      navigate(`/jobs?q=${encodeURIComponent(trimmedQuery)}`);
    }
    // If guest, do nothing
  }

  function clearSearch() {
    setSearchValue('');
    if (location.pathname === '/applicants') {
      navigate('/applicants', { replace: true });
    } else if (location.pathname === '/jobs') {
      navigate('/jobs', { replace: true });
    }
  }

  const initials = userName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="h-16 flex items-center justify-between px-4 md:px-6 gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="lg:hidden p-2 -ml-2 rounded-md text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <Link to="/jobs" className="flex items-center gap-2 transition-opacity hover:opacity-90">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </span>
            <span className="text-lg font-semibold text-gray-900 hidden sm:inline">
              Job <span className="text-blue-600">Portal</span>
            </span>
          </Link>
        </div>

        {/* Center: search bar – placeholder hardcoded to "Search..." */}
        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl hidden md:flex items-center bg-gray-100 rounded-full px-4 h-10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={PLACEHOLDER}
            className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-gray-700 placeholder-gray-400"
          />
          {searchValue && (
            <button type="button" onClick={clearSearch} aria-label="Clear search" className="text-gray-400 hover:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </form>

        <div className="flex items-center gap-3 md:gap-5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((open) => !open)}
            aria-label={mobileSearchOpen ? 'Close search' : 'Open search'}
            aria-expanded={mobileSearchOpen}
            className="md:hidden p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            {mobileSearchOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            )}
          </button>

          <button
            ref={notificationButtonRef}
            type="button"
            onClick={onNotificationsClick}
            aria-label="Notifications"
            className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {notificationCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-medium">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              className="flex items-center gap-2 focus:outline-none"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <span className="flex items-center justify-center w-9 h-9 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                  {initials}
                </span>
              )}
              <span className="hidden sm:flex flex-col items-start leading-tight">
                <span className="text-sm font-medium text-gray-900">{userName}</span>
                {userRole && <span className="text-xs text-gray-500">{userRole}</span>}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={`hidden sm:block text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                {profileDisabled ? (
                  <span aria-disabled="true" title="Coming soon" className="block px-4 py-2 text-sm text-[#CBD5E1] cursor-not-allowed font-medium">My Profile</span>
                ) : onProfileClick ? (
                  <button type="button" onClick={onProfileClick} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</button>
                ) : (
                  <Link to={profilePath} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">My Profile</Link>
                )}
                <button type="button" onClick={onLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileSearchOpen && (
        <form onSubmit={handleSearchSubmit} className="md:hidden flex items-center bg-gray-100 rounded-full px-4 h-10 mx-4 mb-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            autoFocus
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={PLACEHOLDER}
            className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-gray-700 placeholder-gray-400"
          />
          {searchValue && (
            <button type="button" onClick={clearSearch} aria-label="Clear search" className="text-gray-400 hover:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </form>
      )}
    </header>
  );
}