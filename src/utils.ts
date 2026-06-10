/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Project, CheckInRecord } from './types';

// 获取今天的 YYYY-MM-DD 格式字符串 (本地时区)
export function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${date}`;
}

// 格式化任意日期
export function formatDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 计算连续打卡天数 (Streak)
export function calculateStreak(recordsForProject: CheckInRecord[]): number {
  if (recordsForProject.length === 0) return 0;

  // 获取所有打卡日期字符串并去重
  const dateStrSet = new Set(recordsForProject.map(r => r.date));
  const todayStr = getTodayStr();

  // 计算昨天
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterday);

  // 决定起点
  let checkDateStr = todayStr;
  if (!dateStrSet.has(todayStr)) {
    if (dateStrSet.has(yesterdayStr)) {
      checkDateStr = yesterdayStr;
    } else {
      return 0; // 今天和昨天都没打卡，连续打卡中断
    }
  }

  // 从起点往前数
  let streak = 0;
  const current = new Date(checkDateStr);

  while (true) {
    const curStr = formatDateStr(current);
    if (dateStrSet.has(curStr)) {
      streak++;
      current.setDate(current.getDate() - 1); // 往前推一天
    } else {
      break;
    }
  }

  return streak;
}

// 计算最长连续打卡天数 (Longest Streak)
export function calculateLongestStreak(recordsForProject: CheckInRecord[]): number {
  if (recordsForProject.length === 0) return 0;

  // 1. 获取所有唯一的打卡日期并去重
  const uniqueDates = Array.from(new Set(recordsForProject.map(r => r.date)));
  if (uniqueDates.length === 0) return 0;

  // 2. 按时间升序排列
  uniqueDates.sort((a, b) => a.localeCompare(b));

  // 3. 计算本地时间零点的时间戳，防时区偏差
  const getMs = (dateStr: string) => {
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)).getTime();
  };

  let longestStreak = 1;
  let currentStreak = 1;
  const oneDayMs = 24 * 60 * 60 * 1000;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prevMs = getMs(uniqueDates[i - 1]);
    const currMs = getMs(uniqueDates[i]);
    const diffMs = currMs - prevMs;
    const diffDays = Math.round(diffMs / oneDayMs);

    if (diffDays === 1) {
      currentStreak++;
    } else if (diffDays > 1) {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);
  return longestStreak;
}

// 预设的初始数据 (如果本地存储为空)
export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: '每天早起阅读',
    target: 30,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p2',
    name: '完成 30 分钟运动',
    target: 60,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'p3',
    name: '保持充足水分补给',
    target: 21,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const DEFAULT_RECORDS: CheckInRecord[] = [
  // 阅读打卡历史：前几天都完成了，今天还没
  {
    id: 'r1',
    project_id: 'p1',
    date: formatDateStr(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)),
    note: '阅读了《自控力》第1章',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'r2',
    project_id: 'p1',
    date: formatDateStr(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    note: '完成第2章，感触颇深',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'r3',
    project_id: 'p1',
    date: formatDateStr(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    note: '早起静心读书 30分钟',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'r4',
    project_id: 'p1',
    date: formatDateStr(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    note: '昨晚通宵，今早依然坚持十分钟！',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },

  // 运动打卡：前天、昨天打卡，今天也未打卡
  {
    id: 'r5',
    project_id: 'p2',
    date: formatDateStr(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    note: '半小时燃脂操',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'r6',
    project_id: 'p2',
    date: formatDateStr(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
    note: '慢跑 5 公里，大汗淋漓',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },

  // 水分打卡：今天已经打卡
  {
    id: 'r7',
    project_id: 'p3',
    date: getTodayStr(),
    note: '完成第8杯水，目标达成！',
    created_at: new Date().toISOString()
  }
];

// 初始化本地数据
export function initializeLocalData() {
  if (!localStorage.getItem('habit_tracker_projects')) {
    localStorage.setItem('habit_tracker_projects', JSON.stringify(DEFAULT_PROJECTS));
  }
  if (!localStorage.getItem('habit_tracker_records')) {
    localStorage.setItem('habit_tracker_records', JSON.stringify(DEFAULT_RECORDS));
  }
}

// 读取数据
export function loadProjects(): Project[] {
  initializeLocalData();
  const raw = localStorage.getItem('habit_tracker_projects');
  return raw ? JSON.parse(raw) : [];
}

export function loadRecords(): CheckInRecord[] {
  initializeLocalData();
  const raw = localStorage.getItem('habit_tracker_records');
  return raw ? JSON.parse(raw) : [];
}

// 写入数据
export function saveProjects(projects: Project[]) {
  localStorage.setItem('habit_tracker_projects', JSON.stringify(projects));
}

export function saveRecords(records: CheckInRecord[]) {
  localStorage.setItem('habit_tracker_records', JSON.stringify(records));
}
