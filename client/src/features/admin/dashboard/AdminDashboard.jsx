/**
 * @file AdminDashboard.jsx
 * @description Central overview dashboard for the Admin Module.
 * Connects to the centralized statistics service and provides quick-action workflow shortcuts.
 * @module Admin/Dashboard
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  CheckCircle2,
  Briefcase,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Clock,
} from 'lucide-react';
import { getAdminStatistics } from '../../../services/statisticsService.js';

const AdminDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployers: 0,
    verifiedEmployers: 0,
    publishedJobs: 0,
    pendingReports: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const loadInitialStats = async () => {
      try {
        const data = await getAdminStatistics();
        if (isMounted && data) {
          setStats({
            totalUsers: data.totalUsers ?? 0,
            totalEmployers: data.totalEmployers ?? 0,
            verifiedEmployers: data.verifiedEmployers ?? 0,
            publishedJobs: data.publishedJobs ?? 0,
            pendingReports: data.pendingReports ?? 0,
          });
        }
      } catch (err) {
        console.error('Failed to load admin statistics:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleManualRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await getAdminStatistics();
      if (data) {
        setStats({
          totalUsers: data.totalUsers ?? 0,
          totalEmployers: data.totalEmployers ?? 0,
          verifiedEmployers: data.verifiedEmployers ?? 0,
          publishedJobs: data.publishedJobs ?? 0,
          pendingReports: data.pendingReports ?? 0,
        });
      }
    } catch (err) {
      console.error('Failed to refresh statistics:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
      link: '/admin/users',
    },
    {
      title: 'Total Employers',
      value: stats.totalEmployers,
      icon: Building2,
      iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
      link: '/admin/employers',
    },
    {
      title: 'Verified Partners',
      value: stats.verifiedEmployers,
      icon: CheckCircle2,
      iconBg: 'bg-[#DCFCE7] text-[#16A34A]',
      link: '/admin/employers',
    },
    {
      title: 'Published Jobs',
      value: stats.publishedJobs,
      icon: Briefcase,
      iconBg: 'bg-[#EFF6FF] text-[#2563EB]',
      link: '/admin/jobs',
    },
    {
      title: 'Pending Reports',
      value: stats.pendingReports,
      icon: AlertTriangle,
      iconBg: 'bg-[#FEF2F2] text-[#DC2626]',
      link: '/admin/reported-jobs',
    },
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Search, view details, edit roles, and moderate user accounts.',
      icon: Users,
      link: '/admin/users',
      badge: 'Manage',
      badgeColor: 'bg-blue-50 text-blue-700',
    },
    {
      title: 'Employer Verification',
      description: 'Review company verification requests and review business profiles.',
      icon: CheckCircle2,
      link: '/admin/employers?status=pending',
      badge: 'Verify',
      badgeColor: 'bg-amber-50 text-amber-700',
    },
    {
      title: 'Job Moderation Queue',
      description: 'Approve, suspend, or reject job postings submitted by employers.',
      icon: Briefcase,
      link: '/admin/jobs',
      badge: 'Moderate',
      badgeColor: 'bg-green-50 text-green-700',
    },
    {
      title: 'Reported Jobs Queue',
      description: 'Investigate user-reported job postings and enforce safety guidelines.',
      icon: AlertTriangle,
      link: '/admin/reported-jobs',
      badge: 'Review',
      badgeColor: 'bg-red-50 text-red-700',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#1E40AF] to-[#2563EB] rounded-2xl p-6 md:p-8 text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold backdrop-blur-xs border border-white/20">
            <ShieldCheck size={14} />
            <span>Administrative Command Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            System Administration Overview
          </h1>
          <p className="text-blue-100 text-sm max-w-xl">
            Real-time platform activity metrics, user verification pipelines, and job moderation
            controls.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="h-10 px-4 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl transition-all border border-white/20 flex items-center gap-2 backdrop-blur-xs cursor-pointer"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh Stats</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900">Platform Overview</h2>
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Clock size={13} /> Live synchronization
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                onClick={() => navigate(card.link)}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600 truncate">{card.title}</span>
                  <div
                    className={`w-9 h-9 rounded-full ${card.iconBg} flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    <Icon size={16} />
                  </div>
                </div>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">
                    {loading ? '—' : card.value}
                  </span>
                  <ArrowRight
                    size={14}
                    className="text-slate-300 group-hover:text-blue-600 transition-colors"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Workflows */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-4">Administrative Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                onClick={() => navigate(action.link)}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-50 transition-colors">
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {action.title}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${action.badgeColor}`}
                    >
                      {action.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{action.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* System Status Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
          <span>
            All core administration submodules are active and running in a secure session.
          </span>
        </div>
        <button
          onClick={() => navigate('/admin/settings')}
          className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors shrink-0"
        >
          View System Settings &rarr;
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
