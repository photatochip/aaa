import { PlanItem, ResultItem } from '../types';

export type ParseMode = 'auto' | 'all_results' | 'all_plans';

export interface ParseResult {
  results: ResultItem[];
  plans: PlanItem[];
  skippedCount: number;
  error?: string;
  summaryMsg?: string;
}

/**
 * Clean bullet points, numbering, and whitespace from the beginning of a line.
 */
export function cleanLine(rawLine: string): string {
  // Replace tabs and non-breaking spaces
  let line = rawLine.replace(/[\t\u00A0]/g, ' ').trim();

  if (!line) return '';

  // Iteratively strip bullets and numbers from the start
  let prev = '';
  while (prev !== line) {
    prev = line;

    // Remove leading bullet characters: ○ ● • · - □ ■ ▶ ※ ㅇ * ✓ ◆ ◇ ✦ ✧ ▪ ▫ etc.
    line = line.replace(/^[○●•·\-\*□■▶※ㅇ✓◆◇✦✧▪▫\u2022\u25CB\u25CF\u25A0\u25A1\u25B6\u203B]+\s*/, '');

    // Remove leading numbering like 1., 2., 1), (1), [1], ①, ②
    line = line.replace(/^(\d+[\.\)]|\(\d+\)|\[\d+\]|[\u2460-\u2473])\s*/, '');

    // Remove leading Korean letters like 가., 나., 가), (가), [가], ㉮
    line = line.replace(/^([가-힣][\.\)]|\([가-힣]\)|\[[가-힣]\]|[\u3260-\u327F])\s*/, '');

    // Remove Roman numerals like I., II., (I), etc.
    line = line.replace(/^([IVXivx]+[\.\)]|\([IVXivx]+\))\s*/, '');

    line = line.trim();
  }

  return line;
}

/**
 * Check if the line is a section heading for "Last Week's Results"
 * e.g. "1. 지난 주 업무 처리 결과", "지난주 업무실적", "[지난 주 업무 처리 결과]"
 */
export function isResultHeading(rawLine: string): boolean {
  const line = cleanLine(rawLine);
  if (!line || line.length > 35) return false;

  const normalized = line.replace(/\s+/g, '');
  // Matches "지난주업무처리결과", "지난주업무실적", "전주업무결과", "지난주실적", "지난주결과"
  return (
    /(?:지난주|전주)(?:업무)?(?:처리)?(?:결과|실적)/.test(normalized) ||
    /^(?:업무)?(?:처리)?결과$/.test(normalized) ||
    /^(?:주요)?업무실적$/.test(normalized)
  );
}

/**
 * Check if the line is a section heading for "Weekly Work Plan"
 * Note: Must be the whole line! "주간업무계획 보고자료 작성" must NOT be a heading.
 */
export function isPlanHeading(rawLine: string): boolean {
  const line = cleanLine(rawLine);
  if (!line) return false;

  const normalized = line.replace(/\s+/g, '');
  // Strictly matches:
  // "주간업무계획", "주간업무추진계획", "금주주간업무계획", "이번주주간업무계획", "차주주간업무계획", "금주업무계획", "차주업무계획"
  return /^(?:이번주|금주|차주|다음주)?(?:주간)?업무(?:추진)?계획$/.test(normalized);
}

/**
 * Check if line is a subline of a plan: (주요내용), (일시), (행정사항)
 */
export function matchPlanSubline(rawLine: string): { type: 'content' | 'date' | 'admin'; text: string } | null {
  // Normalize whitespace and tabs
  let line = rawLine.replace(/[\t\u00A0]/g, ' ').trim();
  // Strip leading bullet like - or ·
  line = line.replace(/^[○●•·\-\*□■▶※ㅇ✓◆◇✦✧▪▫\u2022\u25CB\u25CF\u25A0\u25A1\u25B6\u203B]+\s*/, '').trim();

  // 1. Content: (주요내용), [주요내용], 주요내용:, (주요 내용)
  const contentMatch = line.match(/^[\(\[\{【]?(?:주요\s*내용|내용)[\)\]\}】]?\s*[:：\-]?\s*(.*)$/i);
  if (contentMatch && contentMatch[1].trim()) {
    return { type: 'content', text: contentMatch[1].trim() };
  }

  // 2. Date: (일시), [일시], 일시:, (일시 및 장소), (기간)
  const dateMatch = line.match(/^[\(\[\{【]?(?:일시\s*및\s*장소|일\s*시|일시|기간)[\)\]\}】]?\s*[:：\-]?\s*(.*)$/i);
  if (dateMatch && dateMatch[1].trim()) {
    return { type: 'date', text: dateMatch[1].trim() };
  }

  // 3. Admin: (행정사항), [행정사항], 행정사항:, (협조사항), (행정 사항)
  const adminMatch = line.match(/^[\(\[\{【]?(?:행정\s*사항|협조\s*사항|행정|협조)[\)\]\}】]?\s*[:：\-]?\s*(.*)$/i);
  if (adminMatch && adminMatch[1].trim()) {
    return { type: 'admin', text: adminMatch[1].trim() };
  }

  return null;
}

/**
 * Parse pasted text according to selected mode and rules.
 */
export function parsePastedText(
  text: string,
  mode: ParseMode,
  defaultField: string
): ParseResult {
  const rawLines = text.split(/\r?\n/);
  const results: ResultItem[] = [];
  const plans: PlanItem[] = [];

  if (mode === 'all_results') {
    for (const raw of rawLines) {
      const line = cleanLine(raw);
      if (line) {
        results.push({ field: defaultField, text: line });
      }
    }
    return {
      results,
      plans,
      skippedCount: 0,
      summaryMsg: `결과 ${results.length}건이 추가되었습니다.`,
    };
  }

  if (mode === 'all_plans') {
    let currentPlan: PlanItem | null = null;
    for (const raw of rawLines) {
      const line = cleanLine(raw);
      if (!line) continue;

      const subline = matchPlanSubline(raw);
      if (subline && currentPlan) {
        if (subline.type === 'content') {
          currentPlan.content = currentPlan.content ? `${currentPlan.content}, ${subline.text}` : subline.text;
        } else if (subline.type === 'date') {
          currentPlan.date = currentPlan.date ? `${currentPlan.date}, ${subline.text}` : subline.text;
        } else if (subline.type === 'admin') {
          currentPlan.admin = currentPlan.admin ? `${currentPlan.admin}, ${subline.text}` : subline.text;
        }
      } else {
        currentPlan = {
          field: defaultField,
          title: line,
          content: '',
          date: '',
          admin: '',
        };
        plans.push(currentPlan);
      }
    }
    return {
      results,
      plans,
      skippedCount: 0,
      summaryMsg: `계획 ${plans.length}건이 추가되었습니다.`,
    };
  }

  // AUTO MODE: Look for section headers
  let currentSection: 'none' | 'results' | 'plans' = 'none';
  let skippedCount = 0;
  let currentPlan: PlanItem | null = null;
  let foundAnyHeading = false;

  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    // Check for result heading
    if (isResultHeading(trimmed)) {
      currentSection = 'results';
      foundAnyHeading = true;
      continue;
    }

    // Check for plan heading
    if (isPlanHeading(trimmed)) {
      currentSection = 'plans';
      foundAnyHeading = true;
      currentPlan = null;
      continue;
    }

    // If no heading reached yet, this is a skipped line (e.g. document title, author)
    if (currentSection === 'none') {
      skippedCount++;
      continue;
    }

    // We are inside 'results'
    if (currentSection === 'results') {
      const cleaned = cleanLine(raw);
      if (cleaned) {
        results.push({ field: defaultField, text: cleaned });
      }
      continue;
    }

    // We are inside 'plans'
    if (currentSection === 'plans') {
      const subline = matchPlanSubline(raw);
      if (subline && currentPlan) {
        if (subline.type === 'content') {
          currentPlan.content = currentPlan.content ? `${currentPlan.content}, ${subline.text}` : subline.text;
        } else if (subline.type === 'date') {
          currentPlan.date = currentPlan.date ? `${currentPlan.date}, ${subline.text}` : subline.text;
        } else if (subline.type === 'admin') {
          currentPlan.admin = currentPlan.admin ? `${currentPlan.admin}, ${subline.text}` : subline.text;
        }
      } else {
        const cleaned = cleanLine(raw);
        if (cleaned) {
          currentPlan = {
            field: defaultField,
            title: cleaned,
            content: '',
            date: '',
            admin: '',
          };
          plans.push(currentPlan);
        }
      }
    }
  }

  if (!foundAnyHeading) {
    return {
      results: [],
      plans: [],
      skippedCount: 0,
      error: "제목줄('지난 주 업무 처리 결과', '주간업무계획')을 찾지 못했습니다. 분류 방식을 '모두 지난주 결과로' 또는 '모두 이번주 계획으로'를 선택해 주세요.",
    };
  }

  const parts = [];
  if (skippedCount > 0) parts.push(`제목 등 ${skippedCount}줄 건너뜀`);
  parts.push(`결과 ${results.length}건, 계획 ${plans.length}건 분석 완료`);

  return {
    results,
    plans,
    skippedCount,
    summaryMsg: parts.join(' · '),
  };
}
