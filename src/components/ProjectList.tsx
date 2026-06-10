/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, Check, Circle, Award, Flame, Calendar, Search, 
  Sparkles, SlidersHorizontal, ArrowUpDown, ChevronRight, CheckCircle2 
} from 'lucide-react';
import { Project, CheckInRecord } from '../types';
import { getTodayStr, calculateStreak } from '../utils';

interface ProjectListProps {
  projects: Project[];
  records: CheckInRecord[];
  onSelectProject: (project: Project) => void;
  onQuickCheckIn: (projectId: string) => void;
  onOpenAddModal: () => void;
}

type SortOption = 'created_desc' | 'created_asc' | 'streak_desc' | 'progress_desc' | 'name';

export default function ProjectList({
  projects,
  records,
  onSelectProject,
  onQuickCheckIn,
  onOpenAddModal,
}: ProjectListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');
  const [showFilters, setShowFilters] = useState(false);

  const todayStr = getTodayStr();

  // 整理每个项目的状态
  const projectStats = projects.map((p) => {
    // 找出该项目的所有打卡记录
    const pRecords = records.filter((r) => r.project_id === p.id);
    const todayRecord = pRecords.find((r) => r.date === todayStr);
    const isCheckedInToday = !!todayRecord;
    const totalCompletions = pRecords.length;
    const streak = calculateStreak(pRecords);
    const progressPercent = Math.min(100, Math.round((totalCompletions / p.target) * 100));

    return {
      project: p,
      recordsCount: totalCompletions,
      isCheckedInToday,
      streak,
      progressPercent,
      createdAt: new Date(p.created_at).getTime()
    };
  });

  // 今天已经打卡项目总数
  const totalProjects = projects.length;
  const completedToday = projectStats.filter(p => p.isCheckedInToday).length;
  const todayProgressPercent = totalProjects > 0 ? Math.round((completedToday / totalProjects) * 100) : 0;

  // 搜索和排序
  const filteredAndSortedStats = projectStats
    .filter(stat => stat.project.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'created_desc') return b.createdAt - a.createdAt;
      if (sortBy === 'created_asc') return a.createdAt - b.createdAt;
      if (sortBy === 'streak_desc') return b.streak - a.streak;
      if (sortBy === 'progress_desc') return b.progressPercent - a.progressPercent;
      return a.project.name.localeCompare(b.project.name, 'zh-CN');
    });

  // 获取今日金句/鼓励语
  const getEncouragement = () => {
    if (totalProjects === 0) return '创建你的第一个打卡项目，开启自律生活吧！';
    if (completedToday === 0) return '万事开头难，今天来签个到开启美好一天吧！';
    if (completedToday === totalProjects) return '太棒了！今天所有的打卡选项全部达成！🔥';
    return `加油！今天已达成 ${completedToday}/${totalProjects} 个项目，坚持就是胜利。`;
  };

  return (
    <div id="project-list-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-28">
      
      {/* Dynamic Summary/Dashboard Header */}
      <div id="dashboard-summary-widget" className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white p-6 shadow-md shadow-indigo-100">
        <div className="absolute right-4 top-4 opacity-10">
          <Award className="w-32 h-32" />
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200 bg-white/10 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 自律追踪大盘
              </span>
              <h2 className="text-xl md:text-2xl font-black tracking-tight mt-1">你好，打卡打字机</h2>
            </div>
            
            {/* Round completion rate */}
            <div className="hidden sm:flex items-center gap-2.5 bg-white/10 px-3.5 py-1.5 rounded-2xl border border-white/5">
              <span className="text-xs text-indigo-100 font-semibold font-sans">今日完成度</span>
              <span className="text-lg font-black font-mono">{todayProgressPercent}%</span>
            </div>
          </div>

          <p className="text-sm text-indigo-100/90 font-medium">
            {getEncouragement()}
          </p>

          <div id="today-bar-holder" className="space-y-1 pt-1">
            <div className="flex justify-between text-xs text-indigo-200">
              <span>今日打卡进度 ({completedToday}/{totalProjects})</span>
              <span>{todayProgressPercent}%</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${todayProgressPercent}%` }}
                transition={{ duration: 0.6 }}
                className="bg-white h-full rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div id="filters-search-section" className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-2.5 text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="search-input"
              type="text"
              placeholder="搜索打卡项目..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder-slate-400 font-sans"
            />
          </div>

          {/* Quick buttons */}
          <div className="flex gap-2">
            <button
              id="toggle-filters-btn"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 px-3 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                showFilters 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              排序与筛选
            </button>
          </div>
        </div>

        {/* Expanded Filters Drawer */}
        {showFilters && (
          <motion.div
            id="filters-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2"
          >
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3" />
              排序方式:
            </span>
            
            {[
              { label: '最新创建', val: 'created_desc' },
              { label: '最早创建', val: 'created_asc' },
              { label: '连续天数优先', val: 'streak_desc' },
              { label: '进度优先', val: 'progress_desc' },
              { label: '拼音首字母', val: 'name' },
            ].map((opt) => (
              <button
                id={`sort-btn-${opt.val}`}
                key={opt.val}
                onClick={() => setSortBy(opt.val as SortOption)}
                className={`px-3 py-1 text-xs rounded-full cursor-pointer transition-all ${
                  sortBy === opt.val
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Habit Items Grid */}
      <div id="habit-cards-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAndSortedStats.length === 0 ? (
          <div id="empty-state-box" className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-4">
            <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
              {searchTerm ? <Search className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {searchTerm ? '未找到符合条件的打卡项目' : '暂无打卡项目'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {searchTerm ? '请检查是否拼写有误，或尝试其他关键词' : '快去点击下方的按钮添加一个吧！'}
              </p>
            </div>
            {!searchTerm && (
              <button
                id="empty-add-project-btn"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-1 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" /> 新建第一个项目
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedStats.map((stat) => {
            const { project, recordsCount, isCheckedInToday, streak, progressPercent } = stat;
            return (
              <motion.div
                id={`project-card-${project.id}`}
                key={project.id}
                layout
                className="group relative bg-white rounded-2xl border border-slate-100 p-5 shadow-xs hover:shadow-md hover:border-slate-200/80 transition-all flex flex-col justify-between space-y-4 cursor-pointer"
                onClick={() => onSelectProject(project)}
              >
                {/* Visual Accent based on state */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl ${isCheckedInToday ? 'bg-emerald-500' : 'bg-slate-200 grup-hover:bg-indigo-400'}`} />

                {/* Card Top: title and check button */}
                <div className="flex items-start justify-between gap-3 pl-1.5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-base tracking-tight group-hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                      {project.name}
                      <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-4px] group-hover:translate-x-0" />
                    </h3>
                    <p className="text-[11px] text-slate-400 font-sans">
                      目标: {recordsCount}/{project.target} 天
                    </p>
                  </div>

                  {/* Today check-status check button */}
                  <button
                    id={`quick-check-btn-${project.id}`}
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止进入详情页
                      if (!isCheckedInToday) {
                        onQuickCheckIn(project.id);
                      }
                    }}
                    className={`flex items-center justify-center p-2 rounded-full cursor-pointer transition-all ${
                      isCheckedInToday
                        ? 'bg-emerald-50/80 border border-emerald-100 text-emerald-500 hover:bg-emerald-100'
                        : 'bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 border border-slate-100'
                    }`}
                    title={isCheckedInToday ? '今日已打卡' : '点击打卡'}
                  >
                    {isCheckedInToday ? (
                      <CheckCircle2 className="w-5 h-5 fill-emerald-50 text-emerald-500" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Streak highlights */}
                <div id="stats-ribbon" className="grid grid-cols-2 gap-4 pl-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1.5 rounded-lg ${streak > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800 leading-none">{streak} 天</div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">连续打卡</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800 leading-none">{recordsCount} 天</div>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">累计打卡</div>
                    </div>
                  </div>
                </div>

                {/* Progress bar info */}
                <div id="card-progress-section" className="space-y-1.5 pl-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-sans">进度条</span>
                    <span className="font-bold text-slate-700">{progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      id={`bar-fill-indicator-${project.id}`}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCheckedInToday
                          ? 'bg-emerald-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Floating Action Button on Desktop vs Mobile. Fits: "底部有“添加项目”按钮" */}
      <div id="footer-actions-tray" className="fixed bottom-0 left-0 right-0 py-5 bg-gradient-to-t from-slate-50/95 via-slate-50/90 to-transparent backdrop-blur-xs flex items-center justify-center px-4 z-40 pointer-events-none">
        <button
          id="trigger-add-modal-btn"
          onClick={onOpenAddModal}
          className="pointer-events-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-full shadow-lg hover:shadow-indigo-100 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> 添加打卡项目
        </button>
      </div>

    </div>
  );
}
