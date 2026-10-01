import { AppData } from '../types';

const STORAGE_KEY = 'hwp_weekly_work_plan_v1';

export const INITIAL_APP_DATA: AppData = {
  team: '회계팀',
  fields: ['계약', '물품', '지출', '박물관'],
  members: [
    { id: 'm1', name: '계약 담당', field: '계약' },
    { id: 'm2', name: '물품 담당', field: '물품' },
    { id: 'm3', name: '지출 담당', field: '지출' },
    { id: 'm4', name: '박물관 담당', field: '박물관' },
  ],
  weeks: {},
  opts: {
    showName: false,
  },
};

/**
 * Safely load AppData from localStorage
 */
export function loadAppData(): { data: AppData; error: string | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { data: INITIAL_APP_DATA, error: null };
    }
    const parsed = JSON.parse(raw);
    // Ensure all critical fields exist
    const merged: AppData = {
      team: typeof parsed.team === 'string' ? parsed.team : INITIAL_APP_DATA.team,
      fields: Array.isArray(parsed.fields) && parsed.fields.length > 0 ? parsed.fields : INITIAL_APP_DATA.fields,
      members: Array.isArray(parsed.members) && parsed.members.length > 0 ? parsed.members : INITIAL_APP_DATA.members,
      weeks: typeof parsed.weeks === 'object' && parsed.weeks !== null ? parsed.weeks : {},
      opts: {
        showName: Boolean(parsed.opts?.showName),
      },
    };
    return { data: merged, error: null };
  } catch (err) {
    console.error('Failed to load from localStorage:', err);
    return {
      data: INITIAL_APP_DATA,
      error: '브라우저 저장소(localStorage)에서 데이터를 불러오는 중 오류가 발생했습니다. 초기 설정으로 시작합니다.',
    };
  }
}

/**
 * Safely save AppData to localStorage
 */
export function saveAppData(data: AppData): { success: boolean; error: string | null } {
  try {
    const serialized = JSON.stringify(data);
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true, error: null };
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
    return {
      success: false,
      error: '브라우저 저장소(localStorage)에 접근할 수 없거나 용량이 초과되었습니다. 작업 내용이 저장되지 않을 수 있으니 [설정] > [백업 파일 저장]을 이용해 수시로 백업해 주세요.',
    };
  }
}

/**
 * Export AppData as a JSON file download
 */
export function exportBackupJson(data: AppData, fileName?: string): void {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const finalName = fileName || `주간업무계획_백업_${data.team || '회계팀'}_${dateStr}.json`;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
