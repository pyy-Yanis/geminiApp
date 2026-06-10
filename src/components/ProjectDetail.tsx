/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Calendar as CalendarIcon, Edit, Trash2, 
  Check, Plus, Sparkles, MessageSquare, AlertCircle, RefreshCw 
} from 'lucide-react';
import { Project, CheckInRecord } from '../types';
import { getTodayStr, formatDateStr, calculateStreak, calculateLongestStreak } from '../utils';

interface ProjectDetailProps {
  project: Project;
  records: CheckInRecord[];
  onBack: () => void;
  onCheckIn: (projectId: string, date: string, note?: string) => void;
  onDeleteRecord: (recordId: string) => void;
  onUpdateProject: (projectId: string, name: string, target: number) => void;
  onDeleteProject: (projectId: string) => void;
}

export default function ProjectDetail({
  project,
  records,
  onBack,
  onCheckIn,
  onDeleteRecord,
  onUpdateProject,
  onDeleteProject,
}: ProjectDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editTarget, setEditTarget] = useState(project.target);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 打卡备注状态
  const [noteText, setNoteText] = useState('');

  // 确认删除状态
  const [deletingRecordId, setDeletingRecordId] = useState<string | null>(null);
  const [isConfirmingModalDelete, setIsConfirmingModalDelete] = useState(false);
  const [deletingTodayConfirm, setDeletingTodayConfirm] = useState(false);

  // 自定义日历弹窗状态
  const [selectedDayInfo, setSelectedDayInfo] = useState<{ date: string; record?: CheckInRecord } | null>(null);
  const [modalCheckInNote, setModalCheckInNote] = useState('');

  // 记录今日日期定义
  const todayStr = getTodayStr();

  // 日历显示月份状态
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const currentYear = calendarDate.getFullYear();
  const currentMonth = calendarDate.getMonth(); // 0-11

  const handlePrevMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // 生成日历日期数组 (星期日开始)
  const getCalendarDays = () => {
    const days = [];
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 当月第一天是星期几
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate(); // 当月总天数

    // 前置空白星期填充
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }

    // 填充当月实际日期
    for (let day = 1; day <= totalDaysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const calendarDays = getCalendarDays();
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  // 获取该项目的打卡记录，按时间倒序
  const projectRecords = records
    .filter(r => r.project_id === project.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalDays = projectRecords.length;
  const streak = calculateStreak(projectRecords);
  const longestStreak = calculateLongestStreak(projectRecords);
  const percent = Math.min(100, Math.round((totalDays / project.target) * 100));

  // 今天是否打卡了
  const todayRecord = projectRecords.find(r => r.date === todayStr);
  const isCheckedInToday = !!todayRecord;

  // 昨天是否打卡了
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterday);
  const isCheckedInYesterday = projectRecords.some(r => r.date === yesterdayStr);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || editTarget <= 0) return;
    onUpdateProject(project.id, editName.trim(), editTarget);
    setIsEditing(false);
  };

  const handleCreateCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCheckedInToday) return;
    onCheckIn(project.id, todayStr, noteText.trim() || undefined);
    setNoteText('');
  };

  const handleYesterdayCheckIn = () => {
    if (isCheckedInYesterday) return;
    onCheckIn(project.id, yesterdayStr, '补打卡：昨日完成');
  };

  return (
    <div id={`project-detail-${project.id}`} className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Top action bar */}
      <div id="detail-nav-bar" className="flex items-center justify-between">
        <button
          id="back-to-list-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors cursor-pointer py-1 px-2 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          返回列表
        </button>

        <div className="flex items-center gap-2">
          <button
            id="toggle-edit-mode-btn"
            onClick={() => {
              setIsEditing(!isEditing);
              setEditName(project.name);
              setEditTarget(project.target);
            }}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
            title="修改项目"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            id="open-delete-confirm-btn"
            onClick={() => setShowDeleteConfirm(true)}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="删除项目"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div id="delete-confirmation-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              id="delete-confirmation-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-lg border border-slate-100 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h4 className="text-lg font-bold">要删除该项目吗？</h4>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed">
                删除打卡项目“<strong className="text-slate-800">{project.name}</strong>”将会同时删除该项目关联的<strong>所有历史打卡记录 ({totalDays} 条)</strong>。此操作不可逆。
              </p>
              <div className="flex gap-2 justify-end pt-3">
                <button
                  id="cancel-delete-project-btn"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  id="confirm-delete-project-btn"
                  onClick={() => {
                    onDeleteProject(project.id);
                    onBack();
                  }}
                  className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors cursor-pointer"
                >
                  删除并清空
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Editing State or Title Banner */}
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.form
            id="edit-project-form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleUpdate}
            className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-sm space-y-4"
          >
            <h4 className="font-bold text-slate-800 text-sm">编辑项目属性</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">项目名称</label>
                <input
                  id="edit-project-name-input"
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">目标打卡天数</label>
                <input
                  id="edit-project-target-input"
                  type="number"
                  min="1"
                  required
                  value={editTarget}
                  onChange={(e) => setEditTarget(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                id="cancel-edit-project-btn"
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                取消
              </button>
              <button
                id="save-edit-project-btn"
                type="submit"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer"
              >
                保存修改
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            id="detail-main-header"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
          >
            <div className="space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wider text-indigo-700 bg-indigo-50/70 border border-indigo-100">
                习惯计划
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-500 text-xs font-sans">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  创建于 {new Date(project.created_at).toLocaleDateString()}
                </span>
                <span>•</span>
                <span>目标: {project.target} 天</span>
              </div>
            </div>

            {/* Overall Stats Grid */}
            <div id="header-stats-showcase" className="flex items-center gap-4 py-1">
              <div className="text-center px-4 py-2 bg-slate-50 rounded-xl min-w-[70px]">
                <div className="text-xl font-black text-slate-800">{streak}</div>
                <div className="text-[10px] text-slate-500">连续天数</div>
              </div>
              <div className="text-center px-4 py-2 bg-slate-50 rounded-xl min-w-[70px]">
                <div className="text-xl font-black text-emerald-600">{totalDays}</div>
                <div className="text-[10px] text-slate-500">打卡总天数</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statistics & Progress Dashboard */}
      <div id="stats-progress-bento-dashboard" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Progress Card (Large: Spans 1 column or merges nicely) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">打卡总进度</span>
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded-full font-mono">{percent}%</span>
          </div>
          <div className="space-y-1.5">
            <div id="progress-bar-rail" className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <motion.div
                id="progress-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-full rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-sans font-medium">
              <span>已达成 {totalDays} / {project.target} 天</span>
              <span>{percent >= 100 ? '🎉 目标达成' : `还差 ${Math.max(0, project.target - totalDays)} 天`}</span>
            </div>
          </div>
        </div>

        {/* Total Days */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center md:text-left">累计打卡 (总天数)</div>
          <div className="text-2xl font-black text-indigo-600 text-center md:text-left py-1">
            {totalDays} <span className="text-xs font-normal text-slate-400">天</span>
          </div>
          <div className="text-[10px] text-slate-400 text-center md:text-left font-sans truncate">
            历史打卡成功天数
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center md:text-left">连续打卡天数</div>
          <div className="text-2xl font-black text-amber-500 text-center md:text-left py-1">
            {streak} <span className="text-xs font-normal text-slate-400">天</span>
          </div>
          <div className="text-[10px] text-slate-400 text-center md:text-left font-sans truncate">
            至今天的持续打卡
          </div>
        </div>

        {/* Longest Streak */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider text-center md:text-left">最长连续打卡</div>
          <div className="text-2xl font-black text-emerald-500 text-center md:text-left py-1">
            {longestStreak} <span className="text-xs font-normal text-slate-400">天</span>
          </div>
          <div className="text-[10px] text-slate-400 text-center md:text-left font-sans truncate">
            曾保持最高连击纪录
          </div>
        </div>
      </div>

      {/* Today Check-In Input Form Banner */}
      <div id="today-interactive-pnl" className="bg-white rounded-2xl border border-indigo-50 border-t-2 border-t-indigo-500 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {isCheckedInToday ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shrink-0">
                <Check className="w-5 h-5 font-bold" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">今天已成功打卡！</p>
                <p className="text-xs text-slate-500">
                  备注: {todayRecord?.note || "打卡即胜利，未写备注"}
                </p>
              </div>
            </div>

            {/* Inline delete/undo option for today */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {deletingTodayConfirm ? (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-2xl p-1.5 shrink-0">
                  <span className="text-[10px] font-extrabold text-rose-700 px-2">确定撤销吗？</span>
                  <button
                    type="button"
                    onClick={() => {
                      if (todayRecord) {
                        onDeleteRecord(todayRecord.id);
                      }
                      setDeletingTodayConfirm(false);
                    }}
                    className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    确定
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingTodayConfirm(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  >
                    取消
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    id="undo-today-checkin-btn"
                    type="button"
                    onClick={() => setDeletingTodayConfirm(true)}
                    className="text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 px-3.5 py-2.5 bg-rose-50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    title="撤销今日份打卡记录"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> 撤销今日打卡
                  </button>

                  {!isCheckedInYesterday && (
                    <button
                      id="repair-yesterday-detail-btn"
                      onClick={handleYesterdayCheckIn}
                      className="text-xs font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 px-3.5 py-2.5 bg-indigo-50 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> 补签历史(昨天)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <RefreshCw className="w-4 h-4 animate-spin-slow text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">今天尚未打卡</p>
                <p className="text-xs text-slate-500">写点心得快速在日历上签署今天！</p>
              </div>
            </div>

            <form id="checkin-note-form" onSubmit={handleCreateCheckIn} className="flex flex-col sm:flex-row items-stretch gap-2 flex-1 max-w-xl">
              <input
                id="today-note-box-input"
                type="text"
                placeholder="今日感受 / 自省备注 (选填)..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="bg-slate-50 text-slate-700 text-xs px-4 py-2.5 rounded-xl border border-slate-100 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none flex-1 transition-all"
              />
              <button
                id="submit-today-checkin-btn"
                type="submit"
                className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
              >
                打卡签到
              </button>
            </form>

            {!isCheckedInYesterday && (
              <button
                id="repair-yesterday-detail-btn2"
                type="button"
                onClick={handleYesterdayCheckIn}
                className="text-xs font-bold text-indigo-600 hover:text-white hover:bg-indigo-600 px-3.5 py-2.5 bg-indigo-50 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-center cursor-pointer font-sans"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 补签昨天
              </button>
            )}
          </div>
        )}
      </div>

      {/* 中间显示日历 */}
      <div id="calendar-showcase-section" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
        {/* Month Switching & Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              <span>{currentYear}年 {currentMonth + 1}月 打卡日历</span>
            </h3>
            <p className="text-xs text-slate-400">
              点击下方日期格子可快捷完成对任意历史日期的补打卡
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 self-start sm:self-center">
            <button
              id="prev-month-btn"
              type="button"
              onClick={handlePrevMonth}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded-xl transition-all cursor-pointer"
            >
              &larr; 上个月
            </button>
            <button
              id="next-month-btn"
              type="button"
              onClick={handleNextMonth}
              className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-100 rounded-xl transition-all cursor-pointer"
            >
              下个月 &rarr;
            </button>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div id="month-calendar-grid" className="space-y-2">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 text-center text-xs font-extrabold text-slate-400 select-none pb-2">
            {weekdays.map((wd) => (
              <div key={wd}>{wd}</div>
            ))}
          </div>

          {/* Month grid days */}
          <div className="grid grid-cols-7 gap-1.5 md:gap-2">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return (
                  <div 
                    key={`blank-${idx}`} 
                    className="aspect-square bg-slate-50/20 border border-slate-50/10 rounded-xl" 
                  />
                );
              }

              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = dateStr === todayStr;
              const isFuture = dateStr > todayStr;
              
              const rec = projectRecords.find(r => r.date === dateStr);
              const isChecked = !!rec;

              // Today style: Blue border / otherwise default
              let borderClass = isToday 
                ? "ring-2 ring-blue-500 ring-offset-2" 
                : "border border-slate-100";

              let interactiveClass = "";
              if (isChecked) {
                interactiveClass = "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-100 cursor-pointer";
              } else if (isFuture) {
                interactiveClass = "bg-slate-50 text-slate-300 border border-dashed border-slate-200 cursor-not-allowed select-none opacity-40";
              } else {
                interactiveClass = "bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer";
              }

              return (
                <div
                  id={`calendar-day-cell-${dateStr}`}
                  key={`day-${day}`}
                  onClick={() => {
                    if (isFuture && !isChecked) return;
                    setSelectedDayInfo({ date: dateStr, record: rec });
                    setIsConfirmingModalDelete(false);
                    setModalCheckInNote('');
                  }}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-between p-1.5 md:p-2.5 transition-all ${interactiveClass} ${borderClass}`}
                  title={`${dateStr} ${isChecked ? '已打卡' : isFuture ? '未来时间' : '未打卡'}`}
                >
                  <span className="text-[10px] md:text-[11px] font-bold font-mono self-start">{day}</span>
                  
                  {isChecked ? (
                    <Check className="w-4 h-4 text-white font-extrabold" />
                  ) : (
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                  )}

                  {rec?.note && (
                    <span className="absolute bottom-1 right-1 text-[8px] opacity-75">
                      <MessageSquare className="w-2 h-2 text-current" />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend Indicator */}
        <div id="calendar-legends-box" className="flex flex-wrap items-center gap-5 pt-3 border-t border-slate-50 text-[11px] text-slate-400 font-sans font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-emerald-500 block animate-pulse" />
            <span>已打卡 (绿色)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-50 border border-slate-200 block" />
            <span>未打卡 (公历日期)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md border-2 border-blue-500 block" />
            <span>今天 (蓝色外框)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-slate-50 border border-dashed border-slate-200 opacity-40 block" />
            <span>未来日期 (禁止补签)</span>
          </div>
        </div>
      </div>

      {/* 底部显示打卡记录列表 */}
      <div id="history-logs-section" className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-indigo-600" />
            <span>打卡记录日志 (按日期倒序)</span>
          </h3>
          <span className="text-xs text-slate-400 font-semibold font-mono">
            累计: {totalDays} 次记录
          </span>
        </div>

        <div id="records-list-view" className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {projectRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-xs">暂无历史打卡记录，立即在上方提交您的第一笔习惯日志吧！</p>
            </div>
          ) : (
            <div className="flow-root">
              <ul className="divide-y divide-slate-100">
                {projectRecords.map((rec) => (
                  <li id={`record-item-${rec.id}`} key={rec.id} className="py-3 flex items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {rec.date}
                        </span>
                        {rec.date === todayStr && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-extrabold tracking-wide">
                            今天
                          </span>
                        )}
                        {rec.date === yesterdayStr && (
                          <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded text-[9px] font-bold">
                            昨天
                          </span>
                        )}
                      </div>
                      
                      {rec.note ? (
                        <div className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl flex items-start gap-1.5 border border-slate-100/50">
                          <MessageSquare className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                          <span className="break-all">{rec.note}</span>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic pl-1">未填写任何打卡备注...</p>
                      )}
                    </div>
                    
                    {deletingRecordId === rec.id ? (
                      <div className="flex items-center gap-1 bg-rose-50 border border-rose-150 rounded-xl p-1 shrink-0 animate-pulse">
                        <span className="text-[10px] font-extrabold text-rose-700 px-1">确认删除？</span>
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteRecord(rec.id);
                            setDeletingRecordId(null);
                          }}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors"
                        >
                          确定
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingRecordId(null)}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-colors"
                        >
                          取消
                        </button>
                      </div>
                    ) : (
                      <button
                        id={`delete-record-btn-${rec.id}`}
                        onClick={() => {
                          setDeletingRecordId(rec.id);
                        }}
                        className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-all shrink-0 cursor-pointer"
                        title="删除该条记录"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Calendar Day Cell Interactive Modal */}
      <AnimatePresence>
        {selectedDayInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDayInfo(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md overflow-hidden bg-white rounded-3xl border border-slate-100 shadow-xl p-6 space-y-4"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-800 text-sm md:text-base flex items-center gap-2">
                  <CalendarIcon className="w-4.5 h-4.5 text-indigo-600" />
                  <span>{selectedDayInfo.date} 日期详情</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setSelectedDayInfo(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2.5 py-1 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  关闭
                </button>
              </div>

              {selectedDayInfo.record ? (
                /* 已打卡状态 */
                isConfirmingModalDelete ? (
                  <div className="space-y-4">
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div>
                        <h5 className="text-xs font-extrabold text-rose-800">确定删除此天打卡吗？</h5>
                        <p className="text-[11px] text-rose-600 mt-0.5 font-medium leading-relaxed">
                          删除后，该项目本天的全部打卡记录、累计和习惯备注都会流失。
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setIsConfirmingModalDelete(false)}
                        className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer text-center"
                      >
                        我再想想
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteRecord(selectedDayInfo.record!.id);
                          setSelectedDayInfo(null);
                          setIsConfirmingModalDelete(false);
                        }}
                        className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-all cursor-pointer text-center"
                      >
                        坚决删除它
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Check className="w-5 h-5 font-bold" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 font-bold">打卡状态</div>
                        <div className="text-sm font-extrabold text-slate-800">当天已成功打卡</div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs text-slate-400 font-bold flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5" /> 心得/自省备注
                      </div>
                      <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl text-xs text-slate-700 leading-relaxed font-semibold break-all">
                        {selectedDayInfo.record.note || <span className="text-slate-400 italic font-normal">您没有为此日期填写任何备注...</span>}
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsConfirmingModalDelete(true);
                        }}
                        className="flex-1 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold rounded-2xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> 删除这天打卡
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDayInfo(null)}
                        className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer text-center"
                      >
                        返回
                      </button>
                    </div>
                  </div>
                )
              ) : (
                /* 未打卡状态 -> 补签 */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    onCheckIn(project.id, selectedDayInfo.date, modalCheckInNote.trim() || undefined);
                    setSelectedDayInfo(null);
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-bold">打卡状态</div>
                      <div className="text-sm font-extrabold text-slate-800">尚未打卡 (可在下方补签)</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="modal-note-box-input" className="text-xs text-slate-400 font-bold">
                      在这里写下当天的感受心得吧 (选填)...
                    </label>
                    <input
                      id="modal-note-box-input"
                      type="text"
                      placeholder="补签的心得感受备注..."
                      value={modalCheckInNote}
                      onChange={(e) => setModalCheckInNote(e.target.value)}
                      className="w-full bg-slate-50 text-slate-700 text-xs px-4 py-3 rounded-2xl border border-slate-100 placeholder-slate-400 focus:bg-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedDayInfo(null)}
                      className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-colors cursor-pointer text-center"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl shadow-xs transition-colors cursor-pointer text-center"
                    >
                      立即补打卡
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
