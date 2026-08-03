import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600">The requested page was not found.</p>
      <Link className="font-semibold text-indigo-600 hover:underline" to="/">
        Return to the foundation page
      </Link>
    </main>
  );
}

export default NotFoundPage;
