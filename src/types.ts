/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  name: string;
  target: number; // 目标天数
  created_at: string; // ISO 8601 string
}

export interface CheckInRecord {
  id: string;
  project_id: string;
  date: string; // YYYY-MM-DD
  note?: string; // 打卡备注
  created_at: string; // ISO 8601 string
}
