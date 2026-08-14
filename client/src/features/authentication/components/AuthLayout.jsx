/**
 * Shared shell for the auth pages: a centered card on the public slate
 * background, with the brand and a title/subtitle above the form.
 */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
            Gamage Recruiters
          </p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-6 text-slate-600">{subtitle}</p>}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">{children}</div>
      </section>
    </main>
  );
}
