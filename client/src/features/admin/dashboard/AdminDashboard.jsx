/**
 * @file AdminDashboard.jsx
 * @description Landing page dashboard for the Admin Module.
 * Displays high-level system statistics cards per the MVP requirements.
 * @module Admin/Dashboard
 */

const AdminDashboard = () => {
  const stats = [
    { label: 'Total Users', value: '24,592' },
    { label: 'Total Employers', value: '1,240' },
    { label: 'Verified Employers', value: '980' },
    { label: 'Published Jobs', value: '8,410' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>
      
      {/* Basic Stats Grid - MVP Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-[160px]">
            <div>
              <span className="text-sm font-medium text-slate-500">{stat.label}</span>
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
