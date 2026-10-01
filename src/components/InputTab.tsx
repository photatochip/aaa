import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ClipboardPaste,
  Copy,
  RotateCcw,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { AppData, Member, PlanItem, ResultItem } from '../types';
import { WeekInfo, fromDateKey, toDateKey } from '../utils/dateUtils';
import { PasteModal } from './PasteModal';

interface InputTabProps {
  appData: AppData;
  curMondayKey: string;
  weekInfo: WeekInfo;
  onUpdateAppData: (data: AppData) => void;
  onShowToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const InputTab: React.FC<InputTabProps> = ({
  appData,
  curMondayKey,
  weekInfo,
  onUpdateAppData,
  onShowToast,
}) => {
  const [pasteModalMember, setPasteModalMember] = useState<Member | null>(null);

  const curWeekData = appData.weeks[curMondayKey] || {};

  // Check completion per member
  const memberStatuses = appData.members.map((m) => {
    const mData = curWeekData[m.id];
    const hasResults = mData?.results?.some((r) => r.text?.trim().length > 0);
    const hasPlans = mData?.plans?.some((p) => p.title?.trim().length > 0);
    const isDone = Boolean(hasResults || hasPlans);
    return { member: m, isDone };
  });

  const completedCount = memberStatuses.filter((s) => s.isDone).length;
  const unsubmittedMembers = memberStatuses.filter((s) => !s.isDone).map((s) => s.member.name);

  // Copy unsubmitted reminder text
  const handleCopyUnsubmitted = async () => {
    let text = '';
    if (unsubmittedMembers.length === 0) {
      text = `[${weekInfo.weekName} 주간업무계획] 모든 팀원이 입력을 완료하였습니다.`;
    } else {
      text = `[${weekInfo.weekName} 주간업무계획] 아직 제출하지 않으신 분: ${unsubmittedMembers.join(', ')}`;
    }

    try {
      await navigator.clipboard.writeText(text);
      onShowToast('미제출 명단 안내 문구가 복사되었습니다.', 'success');
    } catch {
      onShowToast('클립보드 복사에 실패했습니다.', 'error');
    }
  };

  // Helper to mutate member data safely
  const mutateMemberData = (
    memberId: string,
    updater: (mData: { results: ResultItem[]; plans: PlanItem[] }) => void
  ) => {
    const nextWeeks = { ...appData.weeks };
    const curW = { ...(nextWeeks[curMondayKey] || {}) };
    const curM = curW[memberId]
      ? {
          results: [...curW[memberId].results],
          plans: [...curW[memberId].plans],
        }
      : { results: [], plans: [] };

    updater(curM);
    curW[memberId] = curM;
    nextWeeks[curMondayKey] = curW;

    onUpdateAppData({
      ...appData,
      weeks: nextWeeks,
    });
  };

  // Add Result item
  const handleAddResult = (member: Member) => {
    mutateMemberData(member.id, (mData) => {
      mData.results.push({
        field: member.field || appData.fields[0] || '기타',
        text: '',
      });
    });
  };

  // Update Result item field
  const handleUpdateResultField = (memberId: string, index: number, field: string) => {
    mutateMemberData(memberId, (mData) => {
      if (mData.results[index]) {
        mData.results[index].field = field;
      }
    });
  };

  // Update Result item text
  const handleUpdateResultText = (memberId: string, index: number, text: string) => {
    mutateMemberData(memberId, (mData) => {
      if (mData.results[index]) {
        mData.results[index].text = text;
      }
    });
  };

  // Delete Result item
  const handleDeleteResult = (memberId: string, index: number) => {
    mutateMemberData(memberId, (mData) => {
      mData.results.splice(index, 1);
    });
  };

  // Add Plan item
  const handleAddPlan = (member: Member) => {
    mutateMemberData(member.id, (mData) => {
      mData.plans.push({
        field: member.field || appData.fields[0] || '기타',
        title: '',
        content: '',
        date: '',
        admin: '',
      });
    });
  };

  // Update Plan item field
  const handleUpdatePlanField = (memberId: string, index: number, field: string) => {
    mutateMemberData(memberId, (mData) => {
      if (mData.plans[index]) {
        mData.plans[index].field = field;
      }
    });
  };

  // Update Plan item title
  const handleUpdatePlanTitle = (memberId: string, index: number, title: string) => {
    mutateMemberData(memberId, (mData) => {
      if (mData.plans[index]) {
        mData.plans[index].title = title;
      }
    });
  };

  // Update Plan subline
  const handleUpdatePlanSubline = (
    memberId: string,
    index: number,
    key: 'content' | 'date' | 'admin',
    val: string
  ) => {
    mutateMemberData(memberId, (mData) => {
      if (mData.plans[index]) {
        mData.plans[index][key] = val;
      }
    });
  };

  // Delete Plan item
  const handleDeletePlan = (memberId: string, index: number) => {
    mutateMemberData(memberId, (mData) => {
      mData.plans.splice(index, 1);
    });
  };

  // Load last week's plans into this week's results
  const handleLoadLastWeekPlans = (member: Member) => {
    const curDate = fromDateKey(curMondayKey);
    curDate.setDate(curDate.getDate() - 7);
    const prevKey = toDateKey(curDate);

    const prevWeek = appData.weeks[prevKey];
    const prevPlans = prevWeek?.[member.id]?.plans;

    if (!prevPlans || prevPlans.length === 0) {
      onShowToast('불러올 지난주 계획이 없습니다.', 'info');
      return;
    }

    let addedCount = 0;
    mutateMemberData(member.id, (mData) => {
      const existingTexts = new Set(mData.results.map((r) => r.text.trim()));
      for (const p of prevPlans) {
        const title = (p.title || '').trim();
        if (title && !existingTexts.has(title)) {
          mData.results.push({
            field: p.field || member.field || appData.fields[0] || '기타',
            text: title,
          });
          existingTexts.add(title);
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      onShowToast(`지난주 계획 ${addedCount}건을 이번 주 결과로 불러왔습니다.`, 'success');
    } else {
      onShowToast('불러올 지난주 계획이 이미 모두 결과에 추가되어 있습니다.', 'info');
    }
  };

  // Handle paste modal apply
  const handlePasteApply = (
    results: ResultItem[],
    plans: PlanItem[],
    clearExisting: boolean,
    summaryMsg: string
  ) => {
    if (!pasteModalMember) return;
    const memberId = pasteModalMember.id;

    mutateMemberData(memberId, (mData) => {
      if (clearExisting) {
        mData.results = results;
        mData.plans = plans;
      } else {
        mData.results = [...mData.results, ...results];
        mData.plans = [...mData.plans, ...plans];
      }
    });

    onShowToast(summaryMsg, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Status & Reminder Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <span>제출 현황:</span>
            <span className="text-rose-600 font-bold">
              {completedCount}/{appData.members.length}명
            </span>
          </div>
          <span className="text-slate-300">·</span>
          <div className="text-sm text-slate-600">
            {unsubmittedMembers.length === 0 ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 inline" /> 전원 입력 완료
              </span>
            ) : (
              <span>
                미입력:{' '}
                <strong className="text-amber-700 font-semibold">
                  {unsubmittedMembers.join(', ')}
                </strong>
              </span>
            )}
          </div>
        </div>

        <button
          onClick={handleCopyUnsubmitted}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition"
        >
          <Copy className="w-3.5 h-3.5 text-slate-500" />
          <span>미제출 명단 복사</span>
        </button>
      </div>

      {/* Member Cards */}
      <div className="space-y-5">
        {appData.members.map((member) => {
          const mData = curWeekData[member.id] || { results: [], plans: [] };
          const isDone =
            (mData.results && mData.results.some((r) => r.text && r.text.trim())) ||
            (mData.plans && mData.plans.some((p) => p.title && p.title.trim()));

          return (
            <div
              key={member.id}
              className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-colors"
            >
              {/* Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="text-base font-bold text-slate-800 tracking-tight">
                    {member.name}
                  </span>
                  <span className="px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-100 rounded border border-slate-200">
                    {member.field}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded ${
                      isDone
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-200/60'
                        : 'text-amber-700 bg-amber-50 border border-amber-200/60'
                    }`}
                  >
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 입력완료
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-amber-600" /> 미입력
                      </>
                    )}
                  </span>
                </div>

                <button
                  onClick={() => setPasteModalMember(member)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                >
                  <ClipboardPaste className="w-3.5 h-3.5 text-rose-600" />
                  <span>붙여넣기로 채우기</span>
                </button>
              </div>

              {/* 1. Results Section */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <span>1. 지난 주 업무 처리 결과</span>
                    <span className="text-slate-400 font-normal">
                      ({weekInfo.prevPeriodStr})
                    </span>
                  </h4>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleLoadLastWeekPlans(member)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition"
                      title="지난주 계획의 제목을 결과 칸으로 가져옵니다"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>지난주 계획 불러오기</span>
                    </button>
                    <button
                      onClick={() => handleAddResult(member)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition"
                    >
                      <Plus className="w-3 h-3" />
                      <span>결과 추가</span>
                    </button>
                  </div>
                </div>

                {mData.results.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 italic">
                    등록된 지난 주 결과 항목이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {mData.results.map((res, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2">
                        {/* Field Selector */}
                        <select
                          value={res.field}
                          onChange={(e) =>
                            handleUpdateResultField(member.id, rIdx, e.target.value)
                          }
                          className="px-2 py-1.5 text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg text-slate-700 shrink-0 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                        >
                          {appData.fields.map((f) => (
                            <option key={f} value={f}>
                              {f}
                            </option>
                          ))}
                        </select>

                        {/* Summary Input */}
                        <input
                          type="text"
                          value={res.text}
                          onChange={(e) =>
                            handleUpdateResultText(member.id, rIdx, e.target.value)
                          }
                          placeholder="지난 주 처리 결과 한 줄 요약..."
                          className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />

                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteResult(member.id, rIdx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                          title="삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Plans Section */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <span>2. 주간업무계획</span>
                    <span className="text-slate-400 font-normal">
                      ({weekInfo.periodStr})
                    </span>
                  </h4>
                  <button
                    onClick={() => handleAddPlan(member)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition"
                  >
                    <Plus className="w-3 h-3" />
                    <span>계획 추가</span>
                  </button>
                </div>

                {mData.plans.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2 italic">
                    등록된 주간업무계획 항목이 없습니다.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {mData.plans.map((plan, pIdx) => (
                      <div
                        key={pIdx}
                        className="bg-slate-50/80 border border-slate-200 rounded-lg p-3 space-y-2.5"
                      >
                        {/* Title Row */}
                        <div className="flex items-center gap-2">
                          <select
                            value={plan.field}
                            onChange={(e) =>
                              handleUpdatePlanField(member.id, pIdx, e.target.value)
                            }
                            className="px-2 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-lg text-slate-700 shrink-0 focus:ring-1 focus:ring-rose-500 focus:outline-none"
                          >
                            {appData.fields.map((f) => (
                              <option key={f} value={f}>
                                {f}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            value={plan.title}
                            onChange={(e) =>
                              handleUpdatePlanTitle(member.id, pIdx, e.target.value)
                            }
                            placeholder="업무계획 한 줄 (제목)..."
                            className="flex-1 px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                          />

                          <button
                            onClick={() => handleDeletePlan(member.id, pIdx)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition"
                            title="삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Optional Sublines Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 border-t border-slate-200/60">
                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              (주요내용)
                            </label>
                            <input
                              type="text"
                              value={plan.content || ''}
                              onChange={(e) =>
                                handleUpdatePlanSubline(
                                  member.id,
                                  pIdx,
                                  'content',
                                  e.target.value
                                )
                              }
                              placeholder="세부 내용..."
                              className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              (일시)
                            </label>
                            <input
                              type="text"
                              value={plan.date || ''}
                              onChange={(e) =>
                                handleUpdatePlanSubline(
                                  member.id,
                                  pIdx,
                                  'date',
                                  e.target.value
                                )
                              }
                              placeholder="예: 10.7.(수) 14:00"
                              className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-medium text-slate-500 mb-1">
                              (행정사항)
                            </label>
                            <input
                              type="text"
                              value={plan.admin || ''}
                              onChange={(e) =>
                                handleUpdatePlanSubline(
                                  member.id,
                                  pIdx,
                                  'admin',
                                  e.target.value
                                )
                              }
                              placeholder="협조 요청 등..."
                              className="w-full px-2.5 py-1 text-xs border border-slate-200 rounded bg-white focus:ring-1 focus:ring-rose-500 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paste Modal */}
      {pasteModalMember && (
        <PasteModal
          isOpen={Boolean(pasteModalMember)}
          memberName={pasteModalMember.name}
          defaultField={pasteModalMember.field}
          onClose={() => setPasteModalMember(null)}
          onApply={handlePasteApply}
        />
      )}
    </div>
  );
};
