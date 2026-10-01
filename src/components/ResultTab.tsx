import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Copy,
  Table as TableIcon,
  Eye,
  Check,
} from 'lucide-react';
import { AppData } from '../types';
import { WeekInfo } from '../utils/dateUtils';
import {
  compileWeekData,
  copyHwpTableToClipboard,
  copyTextToClipboard,
  exportCsv,
  generatePlainText,
} from '../utils/exporter';

interface ResultTabProps {
  appData: AppData;
  curMondayKey: string;
  weekInfo: WeekInfo;
  onUpdateAppData: (data: AppData) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const ResultTab: React.FC<ResultTabProps> = ({
  appData,
  curMondayKey,
  weekInfo,
  onUpdateAppData,
  onShowToast,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'text'>('table');
  const [copiedHwp, setCopiedHwp] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const compiled = compileWeekData(appData, curMondayKey);
  const showName = Boolean(appData.opts.showName);

  const handleToggleShowName = (checked: boolean) => {
    onUpdateAppData({
      ...appData,
      opts: {
        ...appData.opts,
        showName: checked,
      },
    });
  };

  const handleCopyHwp = async () => {
    const ok = await copyHwpTableToClipboard(compiled, weekInfo, showName);
    if (ok) {
      setCopiedHwp(true);
      setTimeout(() => setCopiedHwp(false), 2000);
      onShowToast(
        '한글(HWP) 맞춤 서식 표가 복사되었습니다. 한글에서 Ctrl+V를 누르세요.',
        'success'
      );
    } else {
      onShowToast('표 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.', 'error');
    }
  };

  const handleCopyText = async () => {
    const text = generatePlainText(compiled, showName);
    const ok = await copyTextToClipboard(text);
    if (ok) {
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
      onShowToast('텍스트가 클립보드에 복사되었습니다.', 'success');
    } else {
      onShowToast('텍스트 복사에 실패했습니다.', 'error');
    }
  };

  const handleDownloadCsv = () => {
    try {
      exportCsv(compiled, weekInfo);
      onShowToast('엑셀(CSV) 파일이 다운로드되었습니다.', 'success');
    } catch {
      onShowToast('CSV 파일 다운로드 중 오류가 발생했습니다.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Options Bar */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Options & View Mode */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showName}
              onChange={(e) => handleToggleShowName(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span>담당자 이름 표시</span>
          </label>

          <span className="text-slate-300">|</span>

          {/* Segmented View Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1 px-2.5 py-1 font-medium rounded-md transition ${
                viewMode === 'table'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>취합 표 보기</span>
            </button>
            <button
              onClick={() => setViewMode('text')}
              className={`flex items-center gap-1 px-2.5 py-1 font-medium rounded-md transition ${
                viewMode === 'text'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>텍스트 보기</span>
            </button>
          </div>
        </div>

        {/* Right: Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyHwp}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition active:scale-98"
          >
            {copiedHwp ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>표 복사 (한글에 붙여넣기)</span>
          </button>

          <button
            onClick={handleCopyText}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-slate-500" />}
            <span>텍스트로 복사</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>엑셀(CSV) 저장</span>
          </button>
        </div>
      </div>

      {/* Main Content View */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left font-sans text-sm">
              <thead>
                <tr className="bg-slate-100/90 text-slate-800 border-b border-slate-300 text-xs font-bold">
                  <th className="py-3 px-4 border-r border-slate-300 w-[14%] text-center tracking-tight">
                    업무 분야
                  </th>
                  <th className="py-3 px-4 border-r border-slate-300 w-[43%] tracking-tight text-center">
                    지난 주 업무 처리 결과 ({weekInfo.prevPeriodStr})
                  </th>
                  <th className="py-3 px-4 w-[43%] tracking-tight text-center">
                    주간업무계획 ({weekInfo.periodStr})
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {compiled.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="py-12 px-4 text-center text-slate-400 text-sm italic bg-slate-50/50"
                    >
                      입력된 주간업무계획 내용이 없습니다. [① 입력] 탭에서 내용을 작성해 주세요.
                    </td>
                  </tr>
                ) : (
                  compiled.map((row) => (
                    <tr key={row.field} className="hover:bg-slate-50/60 transition-colors">
                      {/* Field Name */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 border-r border-slate-300 bg-slate-50/50 text-center align-middle text-sm whitespace-nowrap">
                        {row.field}
                      </td>

                      {/* Results Column */}
                      <td className="py-3.5 px-4 text-slate-800 border-r border-slate-300 align-top text-xs sm:text-sm leading-relaxed space-y-1.5">
                        {row.results.length === 0 ? (
                          <span className="text-slate-400">-</span>
                        ) : (
                          row.results.map((res, idx) => (
                            <div key={idx} className="flex items-start gap-1">
                              <span className="text-slate-700 font-bold">○</span>
                              <span className="text-slate-800">
                                {res.item.text}
                                {showName && res.memberName && (
                                  <span className="text-slate-500 font-medium ml-1">
                                    ({res.memberName})
                                  </span>
                                )}
                              </span>
                            </div>
                          ))
                        )}
                      </td>

                      {/* Plans Column */}
                      <td className="py-3.5 px-4 text-slate-800 align-top text-xs sm:text-sm leading-relaxed space-y-2">
                        {row.plans.length === 0 ? (
                          <span className="text-slate-400">-</span>
                        ) : (
                          row.plans.map((p, idx) => (
                            <div key={idx} className="space-y-0.5">
                              <div className="flex items-start gap-1">
                                <span className="text-slate-700 font-bold">○</span>
                                <span className="text-slate-900 font-semibold">
                                  {p.item.title}
                                  {showName && p.memberName && (
                                    <span className="text-slate-500 font-normal ml-1">
                                      ({p.memberName})
                                    </span>
                                  )}
                                </span>
                              </div>

                              {p.item.content?.trim() && (
                                <div className="pl-4 text-xs text-slate-600">
                                  - (주요내용) {p.item.content.trim()}
                                </div>
                              )}
                              {p.item.date?.trim() && (
                                <div className="pl-4 text-xs text-slate-600">
                                  - (일시) {p.item.date.trim()}
                                </div>
                              )}
                              {p.item.admin?.trim() && (
                                <div className="pl-4 text-xs text-slate-600">
                                  - (행정사항) {p.item.admin.trim()}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Text Format View */
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              텍스트 형식 미리보기
            </span>
            <span className="text-xs text-slate-400">
              [텍스트로 복사] 버튼을 누르면 이 형식으로 복사됩니다
            </span>
          </div>
          <pre className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm font-mono text-slate-800 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-[500px]">
            {generatePlainText(compiled, showName)}
          </pre>
        </div>
      )}
    </div>
  );
};
