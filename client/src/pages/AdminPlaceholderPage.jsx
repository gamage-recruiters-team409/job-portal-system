import { Link } from 'react-router-dom';
import { Construction } from 'lucide-react';

/**
 * @file AdminPlaceholderPage.jsx
 * @description Landing route for Admin Console modules whose pages are not yet
 * merged (routing owned by Bimsara). Keeps the AdminSidebar navigation from
 * 404ing while each admin submodule (jobs, categories, verification,
 * moderation logs, notifications, statistics) is being built and merged.
 * @module Pages/Admin
 */
function AdminPlaceholderPage() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Construction className="h-7 w-7" />
      </span>
      <h1 className="text-xl font-bold text-slate-900">Module under development</h1>
      <p className="max-w-md text-sm leading-6 text-slate-500">
        This Admin section is part of the approved MVP roadmap and is being integrated by its module
        owner. It will be available here as soon as it is merged.
      </p>
      <Link
        to="/admin"
        className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-blue-700"
      >
        Back to Admin Dashboard
      </Link>
    </main>
  );
}

export default AdminPlaceholderPage;
