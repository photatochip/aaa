import { AppData, PlanItem, ResultItem } from '../types';
import { WeekInfo } from './dateUtils';

export interface CompiledFieldData {
  field: string;
  results: { item: ResultItem; memberName: string }[];
  plans: { item: PlanItem; memberName: string }[];
}

/**
 * Gather and organize data by field in the specified fields order,
 * with items ordered by member order.
 */
export function compileWeekData(
  appData: AppData,
  mondayKey: string
): CompiledFieldData[] {
  const weekData = appData.weeks[mondayKey] || {};
  const compiled: CompiledFieldData[] = [];

  for (const field of appData.fields) {
    const fieldResults: { item: ResultItem; memberName: string }[] = [];
    const fieldPlans: { item: PlanItem; memberName: string }[] = [];

    for (const member of appData.members) {
      const mData = weekData[member.id];
      if (!mData) continue;

      if (Array.isArray(mData.results)) {
        for (const res of mData.results) {
          if (res.field === field && res.text?.trim()) {
            fieldResults.push({ item: res, memberName: member.name });
          }
        }
      }

      if (Array.isArray(mData.plans)) {
        for (const plan of mData.plans) {
          if (plan.field === field && plan.title?.trim()) {
            fieldPlans.push({ item: plan, memberName: member.name });
          }
        }
      }
    }

    // Only include rows that have at least one result or plan
    if (fieldResults.length > 0 || fieldPlans.length > 0) {
      compiled.push({
        field,
        results: fieldResults,
        plans: fieldPlans,
      });
    }
  }

  return compiled;
}

/**
 * Format plan item as text block
 */
export function formatPlanText(
  plan: PlanItem,
  memberName: string,
  showName: boolean,
  indent = '    '
): string {
  const lines: string[] = [];
  const nameSuffix = showName && memberName ? ` (${memberName})` : '';
  lines.push(`○ ${plan.title}${nameSuffix}`);

  if (plan.content?.trim()) {
    lines.push(`${indent}- (주요내용) ${plan.content.trim()}`);
  }
  if (plan.date?.trim()) {
    lines.push(`${indent}- (일시) ${plan.date.trim()}`);
  }
  if (plan.admin?.trim()) {
    lines.push(`${indent}- (행정사항) ${plan.admin.trim()}`);
  }

  return lines.join('\n');
}

/**
 * Format plan item as HTML string for HWP copy
 */
export function formatPlanHtml(
  plan: PlanItem,
  memberName: string,
  showName: boolean
): string {
  const nameSuffix = showName && memberName ? ` (${memberName})` : '';
  const sublines: string[] = [];

  if (plan.content?.trim()) {
    sublines.push(`<div style="margin-left: 14px; color: #333333;">- (주요내용) ${escapeHtml(plan.content.trim())}</div>`);
  }
  if (plan.date?.trim()) {
    sublines.push(`<div style="margin-left: 14px; color: #333333;">- (일시) ${escapeHtml(plan.date.trim())}</div>`);
  }
  if (plan.admin?.trim()) {
    sublines.push(`<div style="margin-left: 14px; color: #333333;">- (행정사항) ${escapeHtml(plan.admin.trim())}</div>`);
  }

  return `
    <div style="margin-bottom: 6px;">
      <div>○ ${escapeHtml(plan.title)}${nameSuffix}</div>
      ${sublines.join('')}
    </div>
  `.trim();
}

/**
 * Basic HTML escaping
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate full HTML table with strict inline styles for HWP (한글) paste compatibility
 */
export function generateHwpTableHtml(
  compiled: CompiledFieldData[],
  weekInfo: WeekInfo,
  showName: boolean
): string {
  let rowsHtml = '';

  if (compiled.length === 0) {
    rowsHtml = `
      <tr>
        <td colspan="3" style="border: 1px solid #000000; padding: 12px; text-align: center; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif;">
          등록된 주간업무계획 내용이 없습니다.
        </td>
      </tr>
    `;
  } else {
    for (const row of compiled) {
      // Results column
      let resHtml = '-';
      if (row.results.length > 0) {
        resHtml = row.results
          .map((r) => {
            const nameSuffix = showName && r.memberName ? ` (${r.memberName})` : '';
            return `<div style="margin-bottom: 4px;">○ ${escapeHtml(r.item.text)}${nameSuffix}</div>`;
          })
          .join('');
      }

      // Plans column
      let plansHtml = '-';
      if (row.plans.length > 0) {
        plansHtml = row.plans
          .map((p) => formatPlanHtml(p.item, p.memberName, showName))
          .join('');
      }

      rowsHtml += `
        <tr>
          <td style="border: 1px solid #000000; padding: 6px 8px; width: 14%; text-align: center; vertical-align: middle; font-weight: bold; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; background-color: #FAFAFA;">
            ${escapeHtml(row.field)}
          </td>
          <td style="border: 1px solid #000000; padding: 6px 8px; width: 43%; vertical-align: top; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; line-height: 1.5;">
            ${resHtml}
          </td>
          <td style="border: 1px solid #000000; padding: 6px 8px; width: 43%; vertical-align: top; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; line-height: 1.5;">
            ${plansHtml}
          </td>
        </tr>
      `;
    }
  }

  return `
    <table style="border-collapse: collapse; width: 100%; border: 1px solid #000000; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; font-size: 10pt; line-height: 1.5; color: #000000; margin: 0; padding: 0;">
      <thead>
        <tr style="background-color: #EFEFEF; border-bottom: 1px solid #000000;">
          <th style="border: 1px solid #000000; padding: 8px 6px; width: 14%; text-align: center; font-weight: bold; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; background-color: #EFEFEF;">
            업무 분야
          </th>
          <th style="border: 1px solid #000000; padding: 8px 6px; width: 43%; text-align: center; font-weight: bold; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; background-color: #EFEFEF;">
            지난 주 업무 처리 결과 (${weekInfo.prevPeriodStr})
          </th>
          <th style="border: 1px solid #000000; padding: 8px 6px; width: 43%; text-align: center; font-weight: bold; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; background-color: #EFEFEF;">
            주간업무계획 (${weekInfo.periodStr})
          </th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  `.trim();
}

/**
 * Copy HTML table to clipboard with document.execCommand('copy') and Clipboard API
 */
export async function copyHwpTableToClipboard(
  compiled: CompiledFieldData[],
  weekInfo: WeekInfo,
  showName: boolean
): Promise<boolean> {
  const html = generateHwpTableHtml(compiled, weekInfo, showName);
  const plainText = generatePlainText(compiled, showName);

  let success = false;

  // 1. Try document.execCommand('copy') on DOM selection for native HWP copy support
  try {
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.opacity = '0';
    container.style.pointerEvents = 'none';
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNode(container);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      success = document.execCommand('copy');
      selection.removeAllRanges();
    }
    document.body.removeChild(container);
  } catch (e) {
    console.warn('execCommand failed, fallback to Clipboard API:', e);
  }

  // 2. Also try modern Clipboard API with rich HTML and plain text
  if (navigator.clipboard && window.ClipboardItem) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        }),
      ]);
      success = true;
    } catch (e) {
      // Ignored if execCommand succeeded or if restricted
    }
  }

  return success;
}

/**
 * Generate structured plain text for copying
 * Format:
 * □ 계약
 *  [지난 주 업무 처리 결과]
 *   ○ …
 *  [주간업무계획]
 *   ○ …
 *     - (일시) …
 */
export function generatePlainText(
  compiled: CompiledFieldData[],
  showName: boolean
): string {
  if (compiled.length === 0) {
    return '등록된 주간업무계획 내용이 없습니다.';
  }

  const sections: string[] = [];

  for (const row of compiled) {
    const lines: string[] = [];
    lines.push(`□ ${row.field}`);

    // Results
    lines.push(' [지난 주 업무 처리 결과]');
    if (row.results.length === 0) {
      lines.push('  -');
    } else {
      for (const r of row.results) {
        const nameSuffix = showName && r.memberName ? ` (${r.memberName})` : '';
        lines.push(`  ○ ${r.item.text}${nameSuffix}`);
      }
    }

    // Plans
    lines.push(' [주간업무계획]');
    if (row.plans.length === 0) {
      lines.push('  -');
    } else {
      for (const p of row.plans) {
        const planText = formatPlanText(p.item, p.memberName, showName, '    ');
        const indentedPlan = planText
          .split('\n')
          .map((l) => (l.startsWith('○') ? `  ${l}` : l))
          .join('\n');
        lines.push(indentedPlan);
      }
    }

    sections.push(lines.join('\n'));
  }

  return sections.join('\n\n');
}

/**
 * Copy text to clipboard
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    // fallback
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

/**
 * Export compiled data as Excel-compatible CSV file (UTF-8 with BOM)
 * Columns: 업무분야, 구분, 담당자, 내용, 주요내용, 일시, 행정사항
 */
export function exportCsv(
  compiled: CompiledFieldData[],
  weekInfo: WeekInfo
): void {
  const rows: string[] = [];

  // Header row
  rows.push('업무분야,구분,담당자,내용,주요내용,일시,행정사항');

  for (const row of compiled) {
    // Results
    for (const r of row.results) {
      rows.push(
        [
          escapeCsvCell(row.field),
          '지난 주 업무 처리 결과',
          escapeCsvCell(r.memberName),
          escapeCsvCell(r.item.text),
          '',
          '',
          '',
        ].join(',')
      );
    }

    // Plans
    for (const p of row.plans) {
      rows.push(
        [
          escapeCsvCell(row.field),
          '주간업무계획',
          escapeCsvCell(p.memberName),
          escapeCsvCell(p.item.title),
          escapeCsvCell(p.item.content || ''),
          escapeCsvCell(p.item.date || ''),
          escapeCsvCell(p.item.admin || ''),
        ].join(',')
      );
    }
  }

  const bom = '\uFEFF';
  const csvContent = bom + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `주간업무계획_${weekInfo.year}년_${weekInfo.month}월_${weekInfo.weekNum}주차.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(val: string): string {
  if (!val) return '""';
  const clean = val.replace(/"/g, '""');
  return `"${clean}"`;
}
