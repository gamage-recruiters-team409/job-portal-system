import { Link } from 'react-router-dom';

function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-4xl font-bold text-slate-900">403</h1>
      <p className="text-slate-600">You do not have permission to access this page.</p>
      <Link className="font-semibold text-blue-600 hover:underline" to="/">
        Return to home
      </Link>
    </main>
  );
}

export default UnauthorizedPage;
