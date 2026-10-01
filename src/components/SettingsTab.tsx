import React, { useRef, useState } from 'react';
import {
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  AlertOctagon,
  FileCode,
} from 'lucide-react';
import { AppData, Member } from '../types';
import { WeekInfo } from '../utils/dateUtils';
import { exportBackupJson } from '../utils/storage';
import { generateSingleHtmlBundle } from '../utils/singleFileHtml';

interface SettingsTabProps {
  appData: AppData;
  curMondayKey: string;
  weekInfo: WeekInfo;
  onUpdateAppData: (data: AppData) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  appData,
  curMondayKey,
  weekInfo,
  onUpdateAppData,
  onShowToast,
}) => {
  const [fieldsInput, setFieldsInput] = useState(appData.fields.join('\n'));
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update team name
  const handleTeamNameChange = (val: string) => {
    onUpdateAppData({
      ...appData,
      team: val.trim() || '회계팀',
    });
    onShowToast('부서/팀 이름이 저장되었습니다.', 'success');
  };

  // Update fields list
  const handleFieldsBlur = () => {
    const lines = fieldsInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      alert('적어도 하나 이상의 업무 분야가 필요합니다.');
      setFieldsInput(appData.fields.join('\n'));
      return;
    }

    onUpdateAppData({
      ...appData,
      fields: lines,
    });
    onShowToast('업무 분야 목록 및 정렬 순서가 저장되었습니다.', 'success');
  };

  // Add Member
  const handleAddMember = () => {
    const name = window.prompt('추가할 팀원 이름을 입력하세요:', '새 담당자');
    if (!name || !name.trim()) return;

    const newMember: Member = {
      id: `m_${Date.now()}`,
      name: name.trim(),
      field: appData.fields[0] || '기타',
    };

    onUpdateAppData({
      ...appData,
      members: [...appData.members, newMember],
    });
    onShowToast('팀원이 추가되었습니다.', 'success');
  };

  // Update Member Name
  const handleUpdateMemberName = (id: string, name: string) => {
    if (!name.trim()) return;
    onUpdateAppData({
      ...appData,
      members: appData.members.map((m) => (m.id === id ? { ...m, name: name.trim() } : m)),
    });
  };

  // Update Member Default Field
  const handleUpdateMemberField = (id: string, field: string) => {
    onUpdateAppData({
      ...appData,
      members: appData.members.map((m) => (m.id === id ? { ...m, field } : m)),
    });
    onShowToast('기본 업무 분야가 변경되었습니다.', 'info');
  };

  // Move Member Up/Down
  const handleMoveMember = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= appData.members.length) return;

    const newMembers = [...appData.members];
    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIndex];
    newMembers[targetIndex] = temp;

    onUpdateAppData({
      ...appData,
      members: newMembers,
    });
  };

  // Delete Member
  const handleDeleteMember = (id: string) => {
    if (appData.members.length <= 1) {
      alert('최소 1명의 팀원이 필요합니다.');
      return;
    }
    const mem = appData.members.find((m) => m.id === id);
    if (!window.confirm(`'${mem?.name || '팀원'}'을(를) 삭제하시겠습니까?`)) {
      return;
    }

    onUpdateAppData({
      ...appData,
      members: appData.members.filter((m) => m.id !== id),
    });
    onShowToast('팀원이 삭제되었습니다.', 'info');
  };

  // Backup Export
  const handleExportBackup = () => {
    exportBackupJson(appData);
    onShowToast('백업 파일이 저장되었습니다.', 'success');
  };

  // Backup Import
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      !window.confirm(
        '백업 파일을 불러오면 현재 작성된 모든 주차의 데이터와 설정이 백업 내용으로 대체됩니다. 계속 진행하시겠습니까?'
      )
    ) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.members) && Array.isArray(parsed.fields)) {
          onUpdateAppData(parsed);
          setFieldsInput(parsed.fields.join('\n'));
          onShowToast('백업 데이터를 성공적으로 불러왔습니다.', 'success');
        } else {
          alert('올바른 백업 파일 형식이 아닙니다.');
        }
      } catch (err) {
        alert('백업 파일 읽기 실패: 올바른 JSON 형식이 아닙니다.');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // Clear current week
  const handleClearCurrentWeek = () => {
    if (
      !window.confirm(
        `[${weekInfo.fullTitle}]의 모든 팀원 입력 내용을 지우시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
      )
    ) {
      return;
    }

    const nextWeeks = { ...appData.weeks };
    delete nextWeeks[curMondayKey];

    onUpdateAppData({
      ...appData,
      weeks: nextWeeks,
    });
    onShowToast('현재 주차의 모든 입력 내용이 초기화되었습니다.', 'info');
  };

  // Download standalone single HTML file
  const handleDownloadStandaloneHtml = () => {
    const html = generateSingleHtmlBundle(appData);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `주간업무계획_취합도구_${appData.team || '회계팀'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast('인터넷 없이 실행 가능한 단일 HTML 파일이 다운로드되었습니다.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Basic Info & Fields */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          부서 정보 및 취합 정렬 순서
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              부서/팀 이름
            </label>
            <input
              type="text"
              defaultValue={appData.team || '회계팀'}
              onBlur={(e) => handleTeamNameChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              placeholder="예: 회계팀"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              상단 타이틀과 백업 파일 이름에 반영됩니다.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              업무 분야 목록 (위에서 아래 순서가 취합표의 정렬 순서)
            </label>
            <textarea
              value={fieldsInput}
              onChange={(e) => setFieldsInput(e.target.value)}
              onBlur={handleFieldsBlur}
              rows={4}
              className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
              placeholder="계약&#10;물품&#10;지출&#10;박물관"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              한 줄에 하나씩 입력하세요. 포커스를 벗어나면 자동 저장됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Team Member Management */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">팀원 관리</h3>
            <p className="text-xs text-slate-500">
              팀원 이름, 기본 업무 분야를 설정하고 순서를 변경할 수 있습니다.
            </p>
          </div>
          <button
            onClick={handleAddMember}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>팀원 추가</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {appData.members.map((member, idx) => (
            <div
              key={member.id}
              className="py-2.5 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 flex-1">
                <span className="font-bold text-slate-400 w-5 text-center">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  defaultValue={member.name}
                  onBlur={(e) => handleUpdateMemberName(member.id, e.target.value)}
                  className="px-2.5 py-1.5 font-semibold text-slate-800 border border-slate-300 rounded-md focus:ring-1 focus:ring-rose-500 w-36"
                />
                <select
                  value={member.field}
                  onChange={(e) => handleUpdateMemberField(member.id, e.target.value)}
                  className="px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-md text-slate-700 font-medium"
                >
                  {appData.fields.map((f) => (
                    <option key={f} value={f}>
                      기본분야: {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveMember(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-slate-100"
                  title="위로 이동"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveMember(idx, 'down')}
                  disabled={idx === appData.members.length - 1}
                  className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none rounded hover:bg-slate-100"
                  title="아래로 이동"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteMember(member.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                  title="팀원 삭제"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Offline Intranet Deployment & Standalone Export */}
      <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-rose-600" />
          <h3 className="text-sm font-bold text-rose-950">
            인터넷 차단 업무망 배포용 단일 HTML 파일
          </h3>
        </div>
        <p className="text-xs text-rose-800 leading-relaxed">
          인터넷이 연결되지 않은 업무망 PC에서도 더블클릭만으로 즉시 작동하도록, 외부 라이브러리와 CDN 없이 HTML, CSS, JavaScript를 1개의 파일로 묶어 제공합니다.
        </p>
        <button
          onClick={handleDownloadStandaloneHtml}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition"
        >
          <Download className="w-4 h-4" />
          <span>오프라인 단일 HTML 파일 내려받기 (.html)</span>
        </button>
      </div>

      {/* 4. Data Backup & Reset */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
          데이터 백업 및 초기화
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportBackup}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>백업 파일 저장 (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>백업 파일 불러오기</span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>

          <button
            onClick={handleClearCurrentWeek}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg shadow-2xs transition ml-auto"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>현재 주차 내용 모두 지우기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
