/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  loadProjects, loadRecords, saveProjects, saveRecords, 
  getTodayStr, initializeLocalData 
} from './utils';
import { Project, CheckInRecord } from './types';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import AddProjectModal from './components/AddProjectModal';
import { Calendar, Sparkles, CheckCircle, Smartphone, AlertCircle } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Custom styled Toast/Notification system
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Load initial data
  useEffect(() => {
    initializeLocalData();
    setProjects(loadProjects());
    setRecords(loadRecords());
  }, []);

  // Show Toast helper
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Find selected project
  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  // 1. 新建打卡项目
  const handleAddProject = (name: string, target: number) => {
    const newProject: Project = {
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name,
      target,
      created_at: new Date().toISOString()
    };
    
    const updated = [...projects, newProject];
    setProjects(updated);
    saveProjects(updated);
    showToast(`成功创建项目 “${name}”！`, 'success');
  };

  // 2. 快速打卡 (在首页卡片直接触发今日打卡)
  const handleQuickCheckIn = (projectId: string) => {
    const today = getTodayStr();
    
    // Check if check-in already recorded for today
    const exists = records.some(r => r.project_id === projectId && r.date === today);
    if (exists) {
      showToast('今日已打过卡了哦！', 'info');
      return;
    }

    const newRecord: CheckInRecord = {
      id: 'r-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      project_id: projectId,
      date: today,
      created_at: new Date().toISOString()
    };

    const updated = [...records, newRecord];
    setRecords(updated);
    saveRecords(updated);
    
    const proj = projects.find(p => p.id === projectId);
    showToast(`“${proj?.name || '习惯'}” 今日打卡成功！✨`, 'success');
  };

  // 3. 详情页普通打卡 (可附带备注)
  const handleCheckIn = (projectId: string, date: string, note?: string) => {
    const today = getTodayStr();
    if (date > today) {
      showToast('无法对未来的日期进行打卡哦！', 'error');
      return;
    }

    // 检查是否在同一天重复打卡
    const exists = records.some(r => r.project_id === projectId && r.date === date);
    if (exists) {
      showToast('该日期已录入打卡记录了', 'error');
      return;
    }

    const newRecord: CheckInRecord = {
      id: 'r-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      project_id: projectId,
      date,
      note,
      created_at: new Date().toISOString()
    };

    const updated = [...records, newRecord];
    setRecords(updated);
    saveRecords(updated);
    showToast('打卡成功，记录已安全保存在本地！☘️', 'success');
  };

  // 4. 删除某次打卡记录
  const handleDeleteRecord = (recordId: string) => {
    const updated = records.filter(r => r.id !== recordId);
    setRecords(updated);
    saveRecords(updated);
    showToast('打卡记录已删除', 'info');
  };

  // 5. 更新项目设置
  const handleUpdateProject = (projectId: string, name: string, target: number) => {
    const updated = projects.map(p => {
      if (p.id === projectId) {
        return { ...p, name, target };
      }
      return p;
    });
    setProjects(updated);
    saveProjects(updated);
    showToast('项目配置已更新！', 'success');
  };

  // 6. 删除打卡项目 (级联删除记录)
  const handleDeleteProject = (projectId: string) => {
    const nextProjects = projects.filter(p => p.id !== projectId);
    const nextRecords = records.filter(r => r.project_id !== projectId);
    
    setProjects(nextProjects);
    saveProjects(nextProjects);
    
    setRecords(nextRecords);
    saveRecords(nextRecords);
    
    setSelectedProjectId(null);
    showToast('项目及相关记录已全部删除', 'error');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none pb-12">
      
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            id="toast-notification"
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-4 left-1/2 z-[100] px-4 py-3 rounded-xl shadow-lg border text-xs font-bold leading-none flex items-center gap-2 ${
              toast.type === 'success' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-100 text-rose-800'
              : 'bg-indigo-50 border-indigo-100 text-indigo-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />}
            {toast.type === 'info' && <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Universal Navbar */}
      <nav id="app-navigation-bar" className="bg-white border-b border-slate-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-15 flex items-center justify-between">
          <div 
            id="app-branding-logo" 
            onClick={() => setSelectedProjectId(null)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="p-1.5 bg-indigo-600 text-white rounded-xl group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-black text-slate-900 leading-none tracking-tight text-sm">本地打卡</h1>
              <p className="text-[9px] text-slate-400 mt-1">100% 离线安全 • 浏览器存储</p>
            </div>
          </div>

          <div id="status-tag-offline" className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 rounded-full text-[10px] font-bold border border-slate-100/60 font-sans">
            <Smartphone className="w-3.5 h-3.5" />
            <span>无网可用</span>
          </div>
        </div>
      </nav>

      {/* Main Container with slide transitions */}
      <main id="app-main-content" className="flex-1">
        <AnimatePresence mode="wait">
          {selectedProject ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectDetail
                project={selectedProject}
                records={records}
                onBack={() => setSelectedProjectId(null)}
                onCheckIn={handleCheckIn}
                onDeleteRecord={handleDeleteRecord}
                onUpdateProject={handleUpdateProject}
                onDeleteProject={handleDeleteProject}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -25 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 25 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectList
                projects={projects}
                records={records}
                onSelectProject={(p) => setSelectedProjectId(p.id)}
                onQuickCheckIn={handleQuickCheckIn}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Project Modal Component */}
      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddProject}
      />
    </div>
  );
}
