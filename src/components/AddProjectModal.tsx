/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Sparkles, Calendar } from 'lucide-react';
import { Project } from '../types';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, target: number) => void;
}

export default function AddProjectModal({ isOpen, onClose, onAdd }: AddProjectModalProps) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState<number>(30);
  const [customTarget, setCustomTarget] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    const finalTarget = customTarget ? parseInt(customTarget, 10) : target;
    if (isNaN(finalTarget) || finalTarget <= 0) return;

    onAdd(name.trim(), finalTarget);
    setName('');
    setCustomTarget('');
    setTarget(30);
    onClose();
  };

  const selectPreset = (qty: number) => {
    setTarget(qty);
    setCustomTarget('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="add-project-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            id="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            id="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-xl border border-slate-100"
          >
            {/* Header */}
            <div id="modal-header" className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">新建打卡项目</h3>
                  <p className="text-xs text-slate-500">种一棵树最好的时间是十年前，其次是现在</p>
                </div>
              </div>
              <button
                id="close-modal-btn"
                onClick={onClose}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                aria-label="关闭"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form id="add-project-form" onSubmit={handleSubmit} className="space-y-5 pt-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 block">
                  项目名称 <span className="text-rose-500">*</span>
                </label>
                <input
                  id="project-name-input"
                  type="text"
                  required
                  placeholder="例如：每天早起阅读、背单词、健身..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm font-sans"
                />
              </div>

              {/* Targets */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 block">
                  目标连续打卡天数
                </label>
                
                {/* Presets */}
                <div id="target-presets" className="grid grid-cols-4 gap-2">
                  {[7, 21, 30, 100].map((num) => {
                    const isSelected = target === num && !customTarget;
                    return (
                      <button
                        id={`preset-btn-${num}`}
                        key={num}
                        type="button"
                        onClick={() => selectPreset(num)}
                        className={`py-2 text-center rounded-xl text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100'
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {num} 天
                        <span className="block text-[9px] opacity-75 font-normal">
                          {num === 7 ? '短期' : num === 21 ? '习惯' : num === 30 ? '中期' : '意志'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Target input */}
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <input
                    id="custom-target-input"
                    type="number"
                    min="1"
                    placeholder="或者：输入自定义目标天数..."
                    value={customTarget}
                    onChange={(e) => {
                      setCustomTarget(e.target.value);
                      setTarget(0); // Clear preset selection indicator
                    }}
                    className="w-full pl-9 pr-12 py-2.5 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                  />
                  <span className="absolute right-3.5 text-xs text-slate-400 font-medium">天</span>
                </div>
              </div>

              {/* Quick info / tip */}
              <div id="tip-box" className="p-3 bg-amber-50/50 rounded-xl flex items-start gap-2.5 border border-amber-100/50">
                <Trophy className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-600 leading-relaxed">
                  科学研究表明，21 天能养成一个简单的行为习惯。开启你的打卡，每一次坚持都是你成长的见证。
                </p>
              </div>

              {/* Submit / actions */}
              <div id="modal-actions" className="flex items-center gap-3 pt-2">
                <button
                  id="cancel-modal-btn"
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 font-medium text-sm text-slate-600 hover:bg-slate-100 transition-colors rounded-xl border border-transparent"
                >
                  取消
                </button>
                <button
                  id="submit-project-btn"
                  type="submit"
                  disabled={!name.trim()}
                  className="flex-1 py-2.5 font-medium text-sm bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-sm shadow-indigo-100 flex items-center justify-center gap-1.5 transition-colors"
                >
                  创建项目
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
