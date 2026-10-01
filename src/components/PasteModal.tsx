import React, { useState } from 'react';
import { X, ClipboardPaste, AlertCircle } from 'lucide-react';
import { ParseMode, parsePastedText } from '../utils/parser';
import { PlanItem, ResultItem } from '../types';

interface PasteModalProps {
  isOpen: boolean;
  memberName: string;
  defaultField: string;
  onClose: () => void;
  onApply: (results: ResultItem[], plans: PlanItem[], clearExisting: boolean, summaryMsg: string) => void;
}

export const PasteModal: React.FC<PasteModalProps> = ({
  isOpen,
  memberName,
  defaultField,
  onClose,
  onApply,
}) => {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<ParseMode>('auto');
  const [clearExisting, setClearExisting] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApply = () => {
    if (!text.trim()) {
      setErrorMsg('붙여넣을 텍스트를 입력해 주세요.');
      return;
    }

    const parseRes = parsePastedText(text, mode, defaultField);

    if (parseRes.error) {
      setErrorMsg(parseRes.error);
      return;
    }

    onApply(parseRes.results, parseRes.plans, clearExisting, parseRes.summaryMsg || '입력이 완료되었습니다.');
    setText('');
    setErrorMsg(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ClipboardPaste className="w-5 h-5 text-rose-600" />
            <h3 className="font-bold text-slate-800">
              {memberName} - 한글 붙여넣기로 채우기
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          <p className="text-xs text-slate-500 leading-relaxed">
            한글(HWP) 파일에서 작성한 본문 전체를 복사하여 아래에 붙여넣으세요.
            문서 제목 및 작성자 줄은 자동으로 건너뛰고, 글머리 기호(○, -, 1., 가. 등)를 정리하여 칸을 채웁니다.
          </p>

          <div>
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              rows={8}
              placeholder="예시)&#10;2026년 10월 2주차 주간업무계획 (계약 담당)&#10;1. 지난 주 업무 처리 결과&#10; ○ 9월 관서운영경비 정산 완료&#10;2. 주간업무계획&#10; ○ 10월 계약심의위원회 개최&#10;   - (주요내용) 물품구매 계약 3건 심의&#10;   - (일시) 10.7.(수) 14:00"
              className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 font-mono"
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Selector */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-700 block">
              분류 방식 선택:
            </span>
            <div className="flex flex-wrap gap-4 text-xs text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="parseMode"
                  value="auto"
                  checked={mode === 'auto'}
                  onChange={() => {
                    setMode('auto');
                    setErrorMsg(null);
                  }}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>자동 (제목줄로 구분)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="parseMode"
                  value="all_results"
                  checked={mode === 'all_results'}
                  onChange={() => {
                    setMode('all_results');
                    setErrorMsg(null);
                  }}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>모두 지난주 결과로</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="parseMode"
                  value="all_plans"
                  checked={mode === 'all_plans'}
                  onChange={() => {
                    setMode('all_plans');
                    setErrorMsg(null);
                  }}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span>모두 이번주 계획으로</span>
              </label>
            </div>
          </div>

          {/* Options */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={clearExisting}
                onChange={(e) => setClearExisting(e.target.checked)}
                className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <span>기존 내용 지우고 채우기 (체크 해제 시 아래에 이어 붙입니다)</span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
          >
            취소
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-500 transition shadow-sm"
          >
            분석 및 입력
          </button>
        </div>
      </div>
    </div>
  );
};
