/**
 * @file AdminCategorySkillsPage.jsx
 * @description Master page for managing categories and skills taxonomy in the Admin portal.
 * Implements accordion-based category view with inline skill management and stat placeholders.
 * @module Admin/Categories/Pages
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layers,
  Sparkles,
  Plus,
  PlusCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Edit2,
  AlertCircle,
  FolderTree,
  TrendingUp,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import {
  getAdminCategories,
  getAdminSkills,
} from '../../../../services/adminCategorySkill.service';
import CreateCategoryModal from '../components/CreateCategoryModal';
import EditCategoryModal from '../components/EditCategoryModal';
import CreateSkillModal from '../components/CreateSkillModal';
import EditSkillModal from '../components/EditSkillModal';

const AdminCategorySkillsPage = () => {
  // Data States
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'

  // Accordion Expand/Collapse State (Category IDs)
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Modal States
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreateSkillOpen, setIsCreateSkillOpen] = useState(false);
  const [createSkillDefaultCategoryId, setCreateSkillDefaultCategoryId] = useState('');
  const [editingSkill, setEditingSkill] = useState(null);

  // Trigger refresh
  const triggerRefresh = useCallback(() => {
    setLoading(true);
    setRefreshCount((c) => c + 1);
  }, []);

  // Fetch Categories & Skills
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [catRes, skillRes] = await Promise.all([
          getAdminCategories(),
          getAdminSkills(),
        ]);

        if (!isMounted) return;

        const fetchedCategories = catRes?.data?.categories || [];
        const fetchedSkills = skillRes?.data?.skills || [];

        setCategories(fetchedCategories);
        setSkills(fetchedSkills);
        setError(null);

        // Expand first 3 categories on initial load if none expanded yet
        setExpandedCategories((prev) => {
          if (prev.size > 0) return prev;
          return new Set(fetchedCategories.slice(0, 3).map((c) => c._id));
        });
      } catch (err) {
        if (!isMounted) return;
        setError(
          err.response?.data?.message ||
            err.message ||
            'Failed to load categories and skills.'
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [refreshCount]);

  // Toggle Category Accordion
  const toggleCategory = (catId) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCategories(new Set(categories.map((c) => c._id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  // Group skills by category ID
  const skillsByCategory = useMemo(() => {
    const map = {};
    const uncategorized = [];

    skills.forEach((skill) => {
      const catId =
        typeof skill.categoryId === 'object'
          ? skill.categoryId?._id
          : skill.categoryId;

      if (catId) {
        if (!map[catId]) map[catId] = [];
        map[catId].push(skill);
      } else {
        uncategorized.push(skill);
      }
    });

    return { map, uncategorized };
  }, [skills]);

  // Filter Categories and Skills
  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories.filter((cat) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && !cat.isActive) return false;
      if (statusFilter === 'INACTIVE' && cat.isActive) return false;

      // Search query filter (matches category name, description, or contained skills)
      if (!query) return true;

      const catMatches =
        cat.categoryName.toLowerCase().includes(query) ||
        (cat.description && cat.description.toLowerCase().includes(query));

      const catSkills = skillsByCategory.map[cat._id] || [];
      const skillMatches = catSkills.some((s) =>
        s.skillName.toLowerCase().includes(query)
      );

      return catMatches || skillMatches;
    });
  }, [categories, searchQuery, statusFilter, skillsByCategory]);

  // Filter Uncategorized Skills
  const filteredUncategorizedSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return skillsByCategory.uncategorized.filter((skill) => {
      // Status filter
      if (statusFilter === 'ACTIVE' && !skill.isActive) return false;
      if (statusFilter === 'INACTIVE' && skill.isActive) return false;

      // Search query filter
      if (!query) return true;
      return skill.skillName.toLowerCase().includes(query);
    });
  }, [skillsByCategory.uncategorized, searchQuery, statusFilter]);

  const hasResults =
    filteredCategories.length > 0 || filteredUncategorizedSkills.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full pb-16">
      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
            <span>Admin</span>
            <span className="text-slate-300">/</span>
            <span className="text-blue-600 font-medium">Categories & Skills</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Categories & Skills
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage platform taxonomy and specialized skill sets for job matching.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setCreateSkillDefaultCategoryId('');
              setIsCreateSkillOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span>Add Skill</span>
          </button>

          <button
            onClick={() => setIsCreateCategoryOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* ─── Top 4 KPI Statistics Cards (Empty Placeholders for Danaja's API) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-2xs border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs md:text-sm font-semibold text-slate-600">
              Total Categories
            </h3>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <Layers size={18} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
            —
          </span>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-2xs border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs md:text-sm font-semibold text-slate-600">
              Total Skills
            </h3>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
              <Sparkles size={18} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
            —
          </span>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-2xs border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs md:text-sm font-semibold text-slate-600">
              Uncategorized
            </h3>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs">
              <FolderTree size={18} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
            —
          </span>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-2xl shadow-2xs border border-slate-200 flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-xs md:text-sm font-semibold text-slate-600">
              Active Growth
            </h3>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-2xs">
              <TrendingUp size={18} />
            </div>
          </div>
          <span className="text-2xl md:text-3xl font-bold text-slate-900 mt-1">
            —
          </span>
        </div>
      </div>

      {/* ─── Search & Controls Bar ───────────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl shadow-2xs border border-slate-200 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories or skills..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        {/* Filter Tabs & Accordion Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'ACTIVE'
                  ? 'bg-white text-emerald-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('INACTIVE')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === 'INACTIVE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Inactive
            </button>
          </div>

          {/* Expand / Collapse All */}
          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
            <button
              onClick={expandAll}
              title="Expand All"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              title="Collapse All"
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* ─── Content: Error, Loading, or Accordion List ─────────────────────────── */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-600 mb-2" />
          <p className="text-sm font-semibold text-red-800">{error}</p>
          <button
            onClick={triggerRefresh}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-100" />
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded-md bg-slate-100" />
                    <div className="h-3 w-24 rounded-md bg-slate-100" />
                  </div>
                </div>
                <div className="h-6 w-6 rounded-md bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && !hasResults && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
            <Layers className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            No Categories or Skills Found
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery
              ? `No categories or skills matched "${searchQuery}". Try a different search keyword.`
              : 'Get started by creating your first platform job category or skill.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                <span>Clear Search</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCreateCategoryOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Add First Category</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && !error && hasResults && (
        <div className="space-y-4">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.has(category._id);
            const categorySkills = skillsByCategory.map[category._id] || [];
            const activeSkillsCount = categorySkills.filter((s) => s.isActive).length;

            return (
              <div
                key={category._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs transition-all duration-200"
              >
                {/* ── Category Accordion Header ── */}
                <div
                  className="flex items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
                  onClick={() => toggleCategory(category._id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Icon Box */}
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-2xs">
                      <Layers className="h-6 w-6" />
                    </div>

                    {/* Title and Meta */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-base font-bold text-slate-900 truncate">
                          {category.categoryName}
                        </h2>
                        {!category.isActive && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-2xs font-semibold text-slate-500 border border-slate-200">
                            <XCircle size={11} />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">
                        {activeSkillsCount} active {activeSkillsCount === 1 ? 'skill' : 'skills'}
                        {categorySkills.length > activeSkillsCount &&
                          ` • ${categorySkills.length - activeSkillsCount} inactive`}
                        {category.description && (
                          <span className="hidden md:inline text-slate-400">
                            {' '}
                            — {category.description}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategory(category);
                      }}
                      title="Edit Category"
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>

                    <div className="p-1 rounded-lg text-slate-400 hover:text-slate-700 transition-colors">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Category Accordion Body (Skills Grid) ── */}
                {isExpanded && (
                  <div className="border-t border-slate-100 bg-slate-50/40 p-5 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {categorySkills.map((skill) => (
                        <div
                          key={skill._id}
                          className="group relative flex items-center justify-between rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-blue-200 hover:shadow-xs transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 pr-2">
                            <span
                              className={`h-2 w-2 rounded-full shrink-0 ${
                                skill.isActive ? 'bg-blue-600' : 'bg-slate-300'
                              }`}
                            />
                            <span
                              className={`text-xs font-semibold truncate ${
                                skill.isActive ? 'text-slate-800' : 'text-slate-400 line-through'
                              }`}
                            >
                              {skill.skillName}
                            </span>
                          </div>

                          <button
                            onClick={() => setEditingSkill(skill)}
                            title="Edit Skill"
                            className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}

                      {/* Add Skill Button (Dashed card matching design) */}
                      <button
                        type="button"
                        onClick={() => {
                          setCreateSkillDefaultCategoryId(category._id);
                          setIsCreateSkillOpen(true);
                        }}
                        className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white/60 p-3.5 text-xs font-semibold text-slate-600 hover:border-blue-500 hover:bg-blue-50/40 hover:text-blue-600 transition-all cursor-pointer shadow-2xs"
                      >
                        <PlusCircle className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                        <span>Add Skill</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Uncategorized Skills Section (if any exist) ── */}
          {filteredUncategorizedSkills.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
              <div
                className="flex items-center justify-between p-5 md:p-6 cursor-pointer hover:bg-amber-50/50 transition-colors"
                onClick={() => toggleCategory('uncategorized')}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-2xs">
                    <FolderTree className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Uncategorized Skills
                    </h2>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {filteredUncategorizedSkills.length}{' '}
                      {filteredUncategorizedSkills.length === 1 ? 'skill' : 'skills'}{' '}
                      without an assigned category
                    </p>
                  </div>
                </div>

                <div className="p-1 rounded-lg text-slate-400">
                  {expandedCategories.has('uncategorized') ? (
                    <ChevronUp className="h-5 w-5 text-amber-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
              </div>

              {expandedCategories.has('uncategorized') && (
                <div className="border-t border-amber-100 bg-white/60 p-5 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {filteredUncategorizedSkills.map((skill) => (
                      <div
                        key={skill._id}
                        className="group relative flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs hover:border-amber-300 transition-all"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <span
                            className={`h-2 w-2 rounded-full shrink-0 ${
                              skill.isActive ? 'bg-amber-500' : 'bg-slate-300'
                            }`}
                          />
                          <span className="text-xs font-semibold text-slate-800 truncate">
                            {skill.skillName}
                          </span>
                        </div>
                        <button
                          onClick={() => setEditingSkill(skill)}
                          title="Assign Category"
                          className="opacity-0 group-hover:opacity-100 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── Modals ──────────────────────────────────────────────────────────── */}
      <CreateCategoryModal
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
        onSuccess={triggerRefresh}
      />

      <EditCategoryModal
        key={editingCategory?._id}
        isOpen={!!editingCategory}
        category={editingCategory}
        onClose={() => setEditingCategory(null)}
        onSuccess={triggerRefresh}
      />

      <CreateSkillModal
        key={`${isCreateSkillOpen}-${createSkillDefaultCategoryId}`}
        isOpen={isCreateSkillOpen}
        categories={categories}
        defaultCategoryId={createSkillDefaultCategoryId}
        onClose={() => {
          setIsCreateSkillOpen(false);
          setCreateSkillDefaultCategoryId('');
        }}
        onSuccess={triggerRefresh}
      />

      <EditSkillModal
        key={editingSkill?._id}
        isOpen={!!editingSkill}
        skill={editingSkill}
        categories={categories}
        onClose={() => setEditingSkill(null)}
        onSuccess={triggerRefresh}
      />
    </div>
  );
};

export default AdminCategorySkillsPage;
