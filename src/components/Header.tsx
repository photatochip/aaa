import React from 'react';
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';
import { WeekInfo } from '../utils/dateUtils';

interface HeaderProps {
  teamName: string;
  weekInfo: WeekInfo;
  activeTab: 'input' | 'result' | 'settings';
  onTabChange: (tab: 'input' | 'result' | 'settings') => void;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetWeek: () => void;
  storageError: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  teamName,
  weekInfo,
  activeTab,
  onTabChange,
  onPrevWeek,
  onNextWeek,
  onResetWeek,
  storageError,
}) => {
  return (
    <header className="bg-[#180e12] text-white border-b border-[#2d1820]">
      {/* Top Banner if Storage Error */}
      {storageError && (
        <div className="bg-rose-700 text-white px-4 py-2.5 text-sm flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 max-w-5xl mx-auto">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-200" />
            <span>{storageError}</span>
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand / App Title */}
        <div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            {teamName || '회계팀'} 주간업무계획 취합 도구
          </h1>
          <p className="text-xs text-rose-200/60">
            공공기관 내부 업무망 맞춤 오프라인 취합 시스템
          </p>
        </div>

        {/* Week Navigator */}
        <div className="flex items-center gap-2 bg-[#25151b] border border-[#3b1f28] rounded-lg p-1.5 shadow-sm">
          <button
            onClick={onPrevWeek}
            className="p-1.5 hover:bg-[#341b24] text-rose-200 hover:text-white rounded transition"
            title="이전 주차"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-[#1a0e13] rounded border border-[#381e26]">
            <Calendar className="w-3.5 h-3.5 text-rose-400" />
            <span className="font-semibold text-sm text-rose-50 whitespace-nowrap">
              {weekInfo.fullTitle}
            </span>
          </div>

          <button
            onClick={onNextWeek}
            className="p-1.5 hover:bg-[#341b24] text-rose-200 hover:text-white rounded transition"
            title="다음 주차"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={onResetWeek}
            className="text-xs font-medium px-2.5 py-1 bg-[#3a1d26] hover:bg-[#4a2632] text-rose-100 rounded transition ml-1"
          >
            이번 주
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-[#201117] border-t border-[#2e1721]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-6">
          <button
            onClick={() => onTabChange('input')}
            className={`py-3 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'input'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-rose-300/60 hover:text-rose-100'
            }`}
          >
            <span>①</span> 입력
          </button>
          <button
            onClick={() => onTabChange('result')}
            className={`py-3 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'result'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-rose-300/60 hover:text-rose-100'
            }`}
          >
            <span>②</span> 취합 결과
          </button>
          <button
            onClick={() => onTabChange('settings')}
            className={`py-3 text-sm font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-rose-500 text-rose-400'
                : 'border-transparent text-rose-300/60 hover:text-rose-100'
            }`}
          >
            <span>③</span> 설정
          </button>
        </div>
      </div>
    </header>
  );
};
