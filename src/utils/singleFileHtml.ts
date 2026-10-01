import { AppData } from '../types';

/**
 * Generate a 100% self-contained, standalone single HTML file that works
 * completely offline with ZERO external dependencies, CDN, or server.
 * Double-clickable in Chrome or Edge.
 */
export function generateSingleHtmlBundle(initialData: AppData): string {
  const serializedInitial = JSON.stringify(initialData);

  return `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>주간업무계획 취합 도구</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Malgun Gothic', '맑은 고딕', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: #f8fafc;
    color: #1e293b;
    line-height: 1.5;
    padding-bottom: 60px;
  }
  header {
    background-color: #180e12;
    color: #ffffff;
    padding: 16px 24px;
    border-bottom: 1px solid #2d1820;
  }
  .header-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  .brand-title {
    font-size: 1.15rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: #ffe4e6;
  }
  .week-nav {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #25151b;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid #3b1f28;
  }
  .week-nav button {
    background: #3a1d26;
    color: #ffe4e6;
    border: none;
    padding: 4px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.85rem;
  }
  .week-nav button:hover { background: #4a2632; }
  .week-label {
    font-weight: 600;
    font-size: 0.95rem;
    padding: 0 6px;
    white-space: nowrap;
    color: #fff1f2;
  }
  .tabs-bar {
    background: #ffffff;
    border-bottom: 1px solid #e2e8f0;
    position: sticky;
    top: 0;
    z-index: 40;
  }
  .tabs-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    padding: 0 24px;
    gap: 24px;
  }
  .tab-btn {
    background: none;
    border: none;
    padding: 14px 4px;
    font-size: 0.95rem;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }
  .tab-btn.active {
    color: #9f1239;
    border-bottom-color: #e11d48;
  }
  .container {
    max-width: 1200px;
    margin: 24px auto;
    padding: 0 24px;
  }
  .alert-warning {
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: #991b1b;
    padding: 12px 16px;
    border-radius: 6px;
    margin-bottom: 16px;
    font-size: 0.9rem;
  }
  .status-bar {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 14px 20px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }
  .status-text {
    font-size: 0.95rem;
    font-weight: 500;
    color: #334155;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #334155;
    padding: 7px 14px;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
  }
  .btn:hover { background: #f1f5f9; }
  .btn-primary {
    background: #e11d48;
    border-color: #e11d48;
    color: #ffffff;
  }
  .btn-primary:hover { background: #be123c; }
  .btn-danger {
    color: #dc2626;
    border-color: #fca5a5;
  }
  .btn-danger:hover { background: #fef2f2; }
  .btn-sm { padding: 4px 8px; font-size: 0.8rem; }
  .card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 14px;
    border-bottom: 1px solid #f1f5f9;
    margin-bottom: 16px;
  }
  .member-title {
    font-size: 1.05rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .tag {
    font-size: 0.75rem;
    font-weight: 500;
    color: #475569;
    background: #f1f5f9;
    padding: 2px 8px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }
  .badge-done {
    font-size: 0.75rem;
    font-weight: 600;
    color: #166534;
    background: #dcfce7;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .badge-pending {
    font-size: 0.75rem;
    font-weight: 600;
    color: #854d0e;
    background: #fef9c3;
    padding: 2px 8px;
    border-radius: 4px;
  }
  .section-title {
    font-size: 0.9rem;
    font-weight: 700;
    color: #334155;
    margin: 16px 0 8px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .item-row {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    align-items: flex-start;
  }
  .field-select {
    padding: 6px 8px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 0.85rem;
    background: #fff;
    min-width: 90px;
  }
  .text-input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 0.9rem;
  }
  .plan-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 10px 12px;
    margin-bottom: 10px;
  }
  .sublines-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    margin-top: 8px;
  }
  @media (max-width: 768px) {
    .sublines-grid { grid-template-columns: 1fr; }
  }
  .sub-input {
    padding: 5px 8px;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    font-size: 0.82rem;
  }
  .table-preview-wrap {
    overflow-x: auto;
    background: #fff;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    margin-top: 16px;
  }
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  .modal-content {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }
  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: #0f172a;
    color: #fff;
    padding: 10px 18px;
    border-radius: 6px;
    font-size: 0.9rem;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 999;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .toast.show { opacity: 1; }
</style>
</head>
<body>

<header>
  <div class="header-inner">
    <div class="brand-title" id="appHeaderTitle">회계팀 주간업무계획 취합 도구</div>
    <div class="week-nav">
      <button onclick="changeWeek(-7)">◀</button>
      <span class="week-label" id="curWeekLabel"></span>
      <button onclick="changeWeek(7)">▶</button>
      <button onclick="resetToDefaultWeek()" style="margin-left: 6px;">이번 주</button>
    </div>
  </div>
</header>

<div class="tabs-bar">
  <div class="tabs-inner">
    <button class="tab-btn active" id="tabBtn1" onclick="switchTab('input')">① 입력</button>
    <button class="tab-btn" id="tabBtn2" onclick="switchTab('result')">② 취합 결과</button>
    <button class="tab-btn" id="tabBtn3" onclick="switchTab('settings')">③ 설정</button>
  </div>
</div>

<div class="container">
  <div id="storageWarning" class="alert-warning" style="display: none;">
    ⚠️ 브라우저 저장소(localStorage)에 접근할 수 없거나 용량이 초과되었습니다. 작업 내용이 저장되지 않을 수 있으니 [설정] > [백업 파일 저장]을 이용해 수시로 백업해 주세요.
  </div>

  <!-- TAB 1: INPUT -->
  <div id="tabInput">
    <div class="status-bar">
      <div class="status-text" id="submissionStatus">현황 집계 중...</div>
      <div>
        <button class="btn btn-sm" onclick="copyUnsubmittedList()">📋 미제출 명단 복사</button>
      </div>
    </div>
    <div id="memberCardsList"></div>
  </div>

  <!-- TAB 2: RESULT -->
  <div id="tabResult" style="display: none;">
    <div class="status-bar">
      <div style="display: flex; align-items: center; gap: 8px;">
        <label style="font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <input type="checkbox" id="showNameCheck" onchange="toggleShowName(this.checked)">
          담당자 이름 표시
        </label>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-primary" onclick="copyHwpTable()">📄 표 복사 (한글에 붙여넣기)</button>
        <button class="btn" onclick="copyPlainText()">📝 텍스트로 복사</button>
        <button class="btn" onclick="downloadCsv()">📊 엑셀(CSV) 저장</button>
      </div>
    </div>
    <div class="table-preview-wrap" id="tablePreviewContainer"></div>
  </div>

  <!-- TAB 3: SETTINGS -->
  <div id="tabSettings" style="display: none;">
    <div class="card">
      <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 12px;">기본 정보 및 분야 순서</h3>
      <div style="margin-bottom: 16px;">
        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 6px;">부서/팀 이름</label>
        <input type="text" id="settingTeamName" class="text-input" style="max-width: 300px;" onchange="updateTeamName(this.value)">
      </div>
      <div>
        <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 6px;">업무 분야 목록 (한 줄에 하나, 위에서 아래 순서가 취합표 정렬 순서입니다)</label>
        <textarea id="settingFieldsText" class="text-input" rows="5" style="width: 100%; max-width: 400px; font-family: monospace;" onchange="updateFieldsFromText(this.value)"></textarea>
      </div>
    </div>

    <div class="card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="font-size: 1rem; font-weight: 700;">팀원 관리</h3>
        <button class="btn btn-sm btn-primary" onclick="addMember()">+ 팀원 추가</button>
      </div>
      <div id="settingsMemberList"></div>
    </div>

    <div class="card">
      <h3 style="font-size: 1rem; font-weight: 700; margin-bottom: 12px;">데이터 관리 및 백업</h3>
      <div style="display: flex; gap: 10px; flex-wrap: wrap;">
        <button class="btn" onclick="backupJson()">💾 백업 파일 저장 (JSON)</button>
        <label class="btn" style="cursor: pointer;">
          📂 백업 파일 불러오기
          <input type="file" accept=".json" style="display: none;" onchange="loadBackupJson(event)">
        </label>
        <button class="btn btn-danger" onclick="clearCurrentWeek()">🗑️ 현재 주차 내용 모두 지우기</button>
      </div>
    </div>
  </div>
</div>

<!-- PASTE MODAL -->
<div id="pasteModal" class="modal-overlay" style="display: none;">
  <div class="modal-content">
    <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 8px;" id="pasteModalTitle">한글 붙여넣기로 채우기</h3>
    <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 14px;">
      한글(HWP)에서 복사한 주간업무 텍스트를 붙여넣으면 결과와 계획을 자동으로 분석해 입력칸을 채웁니다.
    </p>
    <div style="margin-bottom: 12px;">
      <textarea id="pasteModalTextarea" class="text-input" rows="8" style="width: 100%;" placeholder="여기에 한글에서 복사한 텍스트를 붙여넣으세요..."></textarea>
    </div>
    <div style="margin-bottom: 12px; font-size: 0.9rem;">
      <span style="font-weight: 600; margin-right: 8px;">분류 방식:</span>
      <label style="margin-right: 12px; cursor: pointer;"><input type="radio" name="pasteMode" value="auto" checked> 자동 (제목줄로 구분)</label>
      <label style="margin-right: 12px; cursor: pointer;"><input type="radio" name="pasteMode" value="all_results"> 모두 지난주 결과로</label>
      <label style="cursor: pointer;"><input type="radio" name="pasteMode" value="all_plans"> 모두 이번주 계획으로</label>
    </div>
    <div style="margin-bottom: 16px; font-size: 0.9rem;">
      <label style="cursor: pointer;"><input type="checkbox" id="pasteClearExisting" checked> 기존 내용 지우고 채우기</label>
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 8px;">
      <button class="btn" onclick="closePasteModal()">취소</button>
      <button class="btn btn-primary" onclick="executePaste()">분석 및 입력</button>
    </div>
  </div>
</div>

<div id="toast" class="toast"></div>

<script>
  let state = ${serializedInitial};
  const STORAGE_KEY = 'hwp_weekly_work_plan_v1';
  let curMondayKey = '';
  let activeTab = 'input';
  let currentPasteMemberId = null;

  // Initial Load from LocalStorage if available
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = Object.assign({}, state, parsed);
    }
  } catch (e) {
    document.getElementById('storageWarning').style.display = 'block';
  }

  // Week calculation rules
  function getMondayOf(d) {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    return date;
  }

  function getDefaultTargetMonday(baseDate = new Date()) {
    const day = baseDate.getDay();
    const isNextWeek = day === 0 || day === 4 || day === 5 || day === 6;
    const curMon = getMondayOf(baseDate);
    if (isNextWeek) {
      const nextMon = new Date(curMon);
      nextMon.setDate(nextMon.getDate() + 7);
      return nextMon;
    }
    return curMon;
  }

  function toDateKey(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function fromDateKey(k) {
    const parts = k.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }

  function getWeekInfo(monday) {
    const mon = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
    const fri = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 4);
    const thu = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 3);

    const targetYear = thu.getFullYear();
    const targetMonth = thu.getMonth() + 1;

    const firstOfMonth = new Date(targetYear, thu.getMonth(), 1);
    const firstDow = firstOfMonth.getDay();
    const daysToFirstThu = firstDow <= 4 ? 4 - firstDow : 4 - firstDow + 7;
    const firstThuDate = 1 + daysToFirstThu;
    const weekNum = Math.floor((thu.getDate() - firstThuDate) / 7) + 1;

    const periodStr = (mon.getMonth() + 1) + '. ' + mon.getDate() + '.(월) ~ ' + (fri.getMonth() + 1) + '. ' + fri.getDate() + '.(금)';

    const prevMon = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() - 7);
    const prevFri = new Date(fri.getFullYear(), fri.getMonth(), fri.getDate() - 7);
    const prevPeriodStr = (prevMon.getMonth() + 1) + '. ' + prevMon.getDate() + '.(월) ~ ' + (prevFri.getMonth() + 1) + '. ' + prevFri.getDate() + '.(금)';

    const weekName = targetYear + '년 ' + targetMonth + '월 ' + weekNum + '주차';
    const fullTitle = weekName + ' (' + periodStr + ')';

    return {
      monday: mon,
      thursday: thu,
      friday: fri,
      year: targetYear,
      month: targetMonth,
      weekNum: weekNum,
      weekName: weekName,
      periodStr: periodStr,
      prevPeriodStr: prevPeriodStr,
      fullTitle: fullTitle
    };
  }

  // Toast feedback
  function showToast(msg) {
    const t = document.getElementById('toast');
    t.innerText = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  // Save state debounced
  let saveTimer = null;
  function saveState() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        document.getElementById('storageWarning').style.display = 'none';
      } catch (e) {
        document.getElementById('storageWarning').style.display = 'block';
      }
    }, 250);
  }

  function changeWeek(dayDelta) {
    const cur = fromDateKey(curMondayKey);
    cur.setDate(cur.getDate() + dayDelta);
    curMondayKey = toDateKey(cur);
    renderApp();
  }

  function resetToDefaultWeek() {
    curMondayKey = toDateKey(getDefaultTargetMonday());
    renderApp();
  }

  function switchTab(tab) {
    activeTab = tab;
    document.getElementById('tabBtn1').className = 'tab-btn' + (tab === 'input' ? ' active' : '');
    document.getElementById('tabBtn2').className = 'tab-btn' + (tab === 'result' ? ' active' : '');
    document.getElementById('tabBtn3').className = 'tab-btn' + (tab === 'settings' ? ' active' : '');

    document.getElementById('tabInput').style.display = tab === 'input' ? 'block' : 'none';
    document.getElementById('tabResult').style.display = tab === 'result' ? 'block' : 'none';
    document.getElementById('tabSettings').style.display = tab === 'settings' ? 'block' : 'none';

    if (tab === 'result') renderResultTab();
    if (tab === 'settings') renderSettingsTab();
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getCurWeekData() {
    if (!state.weeks[curMondayKey]) {
      state.weeks[curMondayKey] = {};
    }
    return state.weeks[curMondayKey];
  }

  function getMemberWeekData(memberId, defaultField) {
    const w = getCurWeekData();
    if (!w[memberId]) {
      w[memberId] = { results: [], plans: [] };
    }
    return w[memberId];
  }

  // --- RENDERING TAB 1: INPUT ---
  function renderInputTab() {
    const weekInfo = getWeekInfo(fromDateKey(curMondayKey));
    document.getElementById('curWeekLabel').innerText = weekInfo.fullTitle;
    document.getElementById('appHeaderTitle').innerText = (state.team || '회계팀') + ' 주간업무계획 취합 도구';

    const curW = getCurWeekData();
    let completedCount = 0;
    const unsubmitted = [];

    state.members.forEach(m => {
      const mData = curW[m.id];
      const hasContent = mData && (
        (mData.results && mData.results.some(r => r.text && r.text.trim())) ||
        (mData.plans && mData.plans.some(p => p.title && p.title.trim()))
      );
      if (hasContent) {
        completedCount++;
      } else {
        unsubmitted.push(m.name);
      }
    });

    const statusEl = document.getElementById('submissionStatus');
    if (unsubmitted.length === 0) {
      statusEl.innerHTML = '<strong>' + state.members.length + '/' + state.members.length + '명</strong> · 전원 입력 완료';
    } else {
      statusEl.innerHTML = '<strong>' + completedCount + '/' + state.members.length + '명</strong> · 미입력: ' + escapeHtml(unsubmitted.join(', '));
    }

    const cardsContainer = document.getElementById('memberCardsList');
    cardsContainer.innerHTML = '';

    state.members.forEach(member => {
      const mData = getMemberWeekData(member.id, member.field);
      const isDone = (mData.results && mData.results.some(r => r.text && r.text.trim())) ||
                     (mData.plans && mData.plans.some(p => p.title && p.title.trim()));

      const card = document.createElement('div');
      card.className = 'card';

      let resultsHtml = '';
      (mData.results || []).forEach((res, rIdx) => {
        let fieldOptions = state.fields.map(f =>
          '<option value="' + escapeHtml(f) + '"' + (f === res.field ? ' selected' : '') + '>' + escapeHtml(f) + '</option>'
        ).join('');

        resultsHtml += \`
          <div class="item-row">
            <select class="field-select" onchange="updateResultField('\${member.id}', \${rIdx}, this.value)">\${fieldOptions}</select>
            <input type="text" class="text-input" placeholder="한 줄 요약 입력..." value="\${escapeHtml(res.text)}" oninput="updateResultText('\${member.id}', \${rIdx}, this.value)">
            <button class="btn btn-sm btn-danger" onclick="deleteResult('\${member.id}', \${rIdx})">삭제</button>
          </div>
        \`;
      });

      let plansHtml = '';
      (mData.plans || []).forEach((plan, pIdx) => {
        let fieldOptions = state.fields.map(f =>
          '<option value="' + escapeHtml(f) + '"' + (f === plan.field ? ' selected' : '') + '>' + escapeHtml(f) + '</option>'
        ).join('');

        plansHtml += \`
          <div class="plan-box">
            <div class="item-row" style="margin-bottom: 6px;">
              <select class="field-select" onchange="updatePlanField('\${member.id}', \${pIdx}, this.value)">\${fieldOptions}</select>
              <input type="text" class="text-input" placeholder="계획 한 줄 (제목)..." value="\${escapeHtml(plan.title)}" oninput="updatePlanTitle('\${member.id}', \${pIdx}, this.value)">
              <button class="btn btn-sm btn-danger" onclick="deletePlan('\${member.id}', \${pIdx})">삭제</button>
            </div>
            <div class="sublines-grid">
              <input type="text" class="sub-input" placeholder="(주요내용) 선택 사항" value="\${escapeHtml(plan.content || '')}" oninput="updatePlanSub('\${member.id}', \${pIdx}, 'content', this.value)">
              <input type="text" class="sub-input" placeholder="(일시) 선택 사항" value="\${escapeHtml(plan.date || '')}" oninput="updatePlanSub('\${member.id}', \${pIdx}, 'date', this.value)">
              <input type="text" class="sub-input" placeholder="(행정사항) 선택 사항" value="\${escapeHtml(plan.admin || '')}" oninput="updatePlanSub('\${member.id}', \${pIdx}, 'admin', this.value)">
            </div>
          </div>
        \`;
      });

      card.innerHTML = \`
        <div class="card-header">
          <div class="member-title">
            <span>\${escapeHtml(member.name)}</span>
            <span class="tag">\${escapeHtml(member.field)}</span>
            <span class="\${isDone ? 'badge-done' : 'badge-pending'}">\${isDone ? '입력완료' : '미입력'}</span>
          </div>
          <button class="btn btn-sm" onclick="openPasteModal('\${member.id}', '\${escapeHtml(member.name)}')">📋 붙여넣기로 채우기</button>
        </div>

        <div class="section-title">
          <span>1. 지난 주 업무 처리 결과</span>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-sm" onclick="loadLastWeekPlans('\${member.id}')">🔄 지난주 계획 불러오기</button>
            <button class="btn btn-sm btn-primary" onclick="addResult('\${member.id}')">+ 결과 추가</button>
          </div>
        </div>
        <div>\${resultsHtml || '<p style="font-size: 0.85rem; color: #94a3b8; padding: 6px 0;">등록된 지난주 결과가 없습니다.</p>'}</div>

        <div class="section-title" style="margin-top: 20px;">
          <span>2. 주간업무계획</span>
          <button class="btn btn-sm btn-primary" onclick="addPlan('\${member.id}')">+ 계획 추가</button>
        </div>
        <div>\${plansHtml || '<p style="font-size: 0.85rem; color: #94a3b8; padding: 6px 0;">등록된 주간업무계획이 없습니다.</p>'}</div>
      \`;

      cardsContainer.appendChild(card);
    });
  }

  // Member data actions
  function addResult(memberId) {
    const mem = state.members.find(m => m.id === memberId);
    const mData = getMemberWeekData(memberId, mem ? mem.field : state.fields[0]);
    mData.results.push({ field: mem ? mem.field : state.fields[0], text: '' });
    saveState();
    renderInputTab();
  }

  function updateResultField(memberId, idx, val) {
    const mData = getMemberWeekData(memberId);
    if (mData.results[idx]) { mData.results[idx].field = val; saveState(); }
  }

  function updateResultText(memberId, idx, val) {
    const mData = getMemberWeekData(memberId);
    if (mData.results[idx]) { mData.results[idx].text = val; saveState(); }
  }

  function deleteResult(memberId, idx) {
    const mData = getMemberWeekData(memberId);
    mData.results.splice(idx, 1);
    saveState();
    renderInputTab();
  }

  function addPlan(memberId) {
    const mem = state.members.find(m => m.id === memberId);
    const mData = getMemberWeekData(memberId, mem ? mem.field : state.fields[0]);
    mData.plans.push({ field: mem ? mem.field : state.fields[0], title: '', content: '', date: '', admin: '' });
    saveState();
    renderInputTab();
  }

  function updatePlanField(memberId, idx, val) {
    const mData = getMemberWeekData(memberId);
    if (mData.plans[idx]) { mData.plans[idx].field = val; saveState(); }
  }

  function updatePlanTitle(memberId, idx, val) {
    const mData = getMemberWeekData(memberId);
    if (mData.plans[idx]) { mData.plans[idx].title = val; saveState(); }
  }

  function updatePlanSub(memberId, idx, key, val) {
    const mData = getMemberWeekData(memberId);
    if (mData.plans[idx]) { mData.plans[idx][key] = val; saveState(); }
  }

  function deletePlan(memberId, idx) {
    const mData = getMemberWeekData(memberId);
    mData.plans.splice(idx, 1);
    saveState();
    renderInputTab();
  }

  function loadLastWeekPlans(memberId) {
    const cur = fromDateKey(curMondayKey);
    cur.setDate(cur.getDate() - 7);
    const prevKey = toDateKey(cur);

    const prevWeek = state.weeks[prevKey];
    if (!prevWeek || !prevWeek[memberId] || !prevWeek[memberId].plans || prevWeek[memberId].plans.length === 0) {
      showToast('불러올 지난주 계획이 없습니다.');
      return;
    }

    const prevPlans = prevWeek[memberId].plans;
    const curData = getMemberWeekData(memberId);
    const existingTexts = new Set(curData.results.map(r => r.text.trim()));

    let addedCount = 0;
    prevPlans.forEach(p => {
      const title = (p.title || '').trim();
      if (title && !existingTexts.has(title)) {
        curData.results.push({
          field: p.field || state.fields[0],
          text: title
        });
        existingTexts.add(title);
        addedCount++;
      }
    });

    saveState();
    renderInputTab();
    if (addedCount > 0) {
      showToast('지난주 계획 ' + addedCount + '건을 결과 칸으로 불러왔습니다.');
    } else {
      showToast('불러올 계획이 이미 모두 추가되어 있습니다.');
    }
  }

  function copyUnsubmittedList() {
    const weekInfo = getWeekInfo(fromDateKey(curMondayKey));
    const curW = getCurWeekData();
    const unsubmitted = [];
    state.members.forEach(m => {
      const mData = curW[m.id];
      const hasContent = mData && (
        (mData.results && mData.results.some(r => r.text && r.text.trim())) ||
        (mData.plans && mData.plans.some(p => p.title && p.title.trim()))
      );
      if (!hasContent) unsubmitted.push(m.name);
    });

    let msg = '';
    if (unsubmitted.length === 0) {
      msg = '[' + weekInfo.weekName + ' 주간업무계획] 모든 팀원이 입력을 완료하였습니다.';
    } else {
      msg = '[' + weekInfo.weekName + ' 주간업무계획] 아직 제출하지 않으신 분: ' + unsubmitted.join(', ');
    }

    navigator.clipboard.writeText(msg).then(() => {
      showToast('미제출 명단 안내 문구가 복사되었습니다.');
    }).catch(() => {
      showToast('클립보드 복사 실패');
    });
  }

  // --- PASTE PARSER ---
  function cleanLine(rawLine) {
    let line = rawLine.replace(/[\\t\\u00A0]/g, ' ').trim();
    if (!line) return '';
    let prev = '';
    while (prev !== line) {
      prev = line;
      line = line.replace(/^[○●•·\\-\\*\u25A0\u25A1\u25B6\u203B□■▶※ㅇ✓◆◇✦✧▪▫\\u2022\\u25CB\\u25CF]+\\s*/, '');
      line = line.replace(/^(\\d+[\\.\\)]|\\(\\d+\\)|\\[\\d+\\]|[\\u2460-\\u2473])\\s*/, '');
      line = line.replace(/^([가-힣][\\.\\)]|\\([가-힣]\\)|\\[[가-힣]\\]|[\\u3260-\\u327F])\\s*/, '');
      line = line.replace(/^([IVXivx]+[\\.\\)]|\\([IVXivx]+\\))\\s*/, '');
      line = line.trim();
    }
    return line;
  }

  function isResultHeading(rawLine) {
    const line = cleanLine(rawLine);
    if (!line || line.length > 35) return false;
    const n = line.replace(/\\s+/g, '');
    return /(?:지난주|전주)(?:업무)?(?:처리)?(?:결과|실적)/.test(n) ||
           /^(?:업무)?(?:처리)?결과$/.test(n) ||
           /^(?:주요)?업무실적$/.test(n);
  }

  function isPlanHeading(rawLine) {
    const line = cleanLine(rawLine);
    if (!line) return false;
    const n = line.replace(/\\s+/g, '');
    return /^(?:이번주|금주|차주|다음주)?(?:주간)?업무(?:추진)?계획$/.test(n);
  }

  function matchPlanSubline(rawLine) {
    let line = rawLine.replace(/[\\t\\u00A0]/g, ' ').trim();
    line = line.replace(/^[○●•·\\-\\*\u25A0\u25A1\u25B6\u203B□■▶※ㅇ✓◆◇✦✧▪▫\\u2022\\u25CB\\u25CF]+\\s*/, '').trim();

    const cm = line.match(/^[\\(\\[\\{【]?(?:주요\\s*내용|내용)[\\)\\]\\}】]?\\s*[:：\\-]?\\s*(.*)$/i);
    if (cm && cm[1].trim()) return { type: 'content', text: cm[1].trim() };

    const dm = line.match(/^[\\(\\[\\{【]?(?:일시\\s*및\\s*장소|일\\s*시|일시|기간)[\\)\\]\\}】]?\\s*[:：\\-]?\\s*(.*)$/i);
    if (dm && dm[1].trim()) return { type: 'date', text: dm[1].trim() };

    const am = line.match(/^[\\(\\[\\{【]?(?:행정\\s*사항|협조\\s*사항|행정|협조)[\\)\\]\\}】]?\\s*[:：\\-]?\\s*(.*)$/i);
    if (am && am[1].trim()) return { type: 'admin', text: am[1].trim() };

    return null;
  }

  function openPasteModal(memberId, name) {
    currentPasteMemberId = memberId;
    document.getElementById('pasteModalTitle').innerText = name + ' - 한글 붙여넣기로 채우기';
    document.getElementById('pasteModalTextarea').value = '';
    document.getElementById('pasteClearExisting').checked = true;
    document.getElementById('pasteModal').style.display = 'flex';
  }

  function closePasteModal() {
    document.getElementById('pasteModal').style.display = 'none';
    currentPasteMemberId = null;
  }

  function executePaste() {
    const text = document.getElementById('pasteModalTextarea').value;
    if (!text.trim()) {
      showToast('붙여넣을 텍스트를 입력해 주세요.');
      return;
    }

    const radios = document.getElementsByName('pasteMode');
    let mode = 'auto';
    for (let r of radios) { if (r.checked) mode = r.value; }
    const clearExisting = document.getElementById('pasteClearExisting').checked;

    const mem = state.members.find(m => m.id === currentPasteMemberId);
    const defField = mem ? mem.field : state.fields[0];

    const lines = text.split(/\\r?\\n/);
    const parsedResults = [];
    const parsedPlans = [];
    let skippedCount = 0;

    if (mode === 'all_results') {
      lines.forEach(r => {
        const c = cleanLine(r);
        if (c) parsedResults.push({ field: defField, text: c });
      });
    } else if (mode === 'all_plans') {
      let curP = null;
      lines.forEach(r => {
        const c = cleanLine(r);
        if (!c) return;
        const sub = matchPlanSubline(r);
        if (sub && curP) {
          curP[sub.type] = curP[sub.type] ? curP[sub.type] + ', ' + sub.text : sub.text;
        } else {
          curP = { field: defField, title: c, content: '', date: '', admin: '' };
          parsedPlans.push(curP);
        }
      });
    } else {
      // AUTO MODE
      let section = 'none';
      let curP = null;
      let foundHeading = false;

      for (let raw of lines) {
        const t = raw.trim();
        if (!t) continue;

        if (isResultHeading(t)) {
          section = 'results';
          foundHeading = true;
          continue;
        }
        if (isPlanHeading(t)) {
          section = 'plans';
          foundHeading = true;
          curP = null;
          continue;
        }
        if (section === 'none') {
          skippedCount++;
          continue;
        }
        if (section === 'results') {
          const c = cleanLine(raw);
          if (c) parsedResults.push({ field: defField, text: c });
          continue;
        }
        if (section === 'plans') {
          const sub = matchPlanSubline(raw);
          if (sub && curP) {
            curP[sub.type] = curP[sub.type] ? curP[sub.type] + ', ' + sub.text : sub.text;
          } else {
            const c = cleanLine(raw);
            if (c) {
              curP = { field: defField, title: c, content: '', date: '', admin: '' };
              parsedPlans.push(curP);
            }
          }
        }
      }

      if (!foundHeading) {
        alert("제목줄('지난 주 업무 처리 결과', '주간업무계획')을 찾지 못했습니다. 분류 방식을 '모두 지난주 결과로' 또는 '모두 이번주 계획으로'를 선택해 주세요.");
        return;
      }
    }

    const mData = getMemberWeekData(currentPasteMemberId, defField);
    if (clearExisting) {
      mData.results = parsedResults;
      mData.plans = parsedPlans;
    } else {
      mData.results = mData.results.concat(parsedResults);
      mData.plans = mData.plans.concat(parsedPlans);
    }

    saveState();
    closePasteModal();
    renderInputTab();

    const parts = [];
    if (skippedCount > 0) parts.push('제목 등 ' + skippedCount + '줄 건너뜀');
    parts.push('결과 ' + parsedResults.length + '건, 계획 ' + parsedPlans.length + '건 분석 완료');
    showToast(parts.join(' · '));
  }

  // --- TAB 2: COMPILE RESULTS ---
  function compileWeekData() {
    const curW = getCurWeekData();
    const compiled = [];

    state.fields.forEach(field => {
      const fRes = [];
      const fPlans = [];

      state.members.forEach(m => {
        const mData = curW[m.id];
        if (!mData) return;
        (mData.results || []).forEach(r => {
          if (r.field === field && r.text && r.text.trim()) {
            fRes.push({ item: r, memberName: m.name });
          }
        });
        (mData.plans || []).forEach(p => {
          if (p.field === field && p.title && p.title.trim()) {
            fPlans.push({ item: p, memberName: m.name });
          }
        });
      });

      if (fRes.length > 0 || fPlans.length > 0) {
        compiled.push({ field: field, results: fRes, plans: fPlans });
      }
    });

    return compiled;
  }

  function toggleShowName(val) {
    state.opts.showName = val;
    saveState();
    renderResultTab();
  }

  function renderResultTab() {
    const checkEl = document.getElementById('showNameCheck');
    if (checkEl) checkEl.checked = Boolean(state.opts.showName);

    const weekInfo = getWeekInfo(fromDateKey(curMondayKey));
    const compiled = compileWeekData();
    const showName = Boolean(state.opts.showName);

    const container = document.getElementById('tablePreviewContainer');
    let rowsHtml = '';

    if (compiled.length === 0) {
      rowsHtml = '<tr><td colspan="3" style="border: 1px solid #000; padding: 24px; text-align: center; color: #64748b;">등록된 주간업무계획 내용이 없습니다. ① 입력 탭에서 내용을 작성해 주세요.</td></tr>';
    } else {
      compiled.forEach(row => {
        let resStr = '-';
        if (row.results.length > 0) {
          resStr = row.results.map(r => {
            const nameSuffix = showName ? ' (' + escapeHtml(r.memberName) + ')' : '';
            return '<div style="margin-bottom: 4px;">○ ' + escapeHtml(r.item.text) + nameSuffix + '</div>';
          }).join('');
        }

        let planStr = '-';
        if (row.plans.length > 0) {
          planStr = row.plans.map(p => {
            const nameSuffix = showName ? ' (' + escapeHtml(p.memberName) + ')' : '';
            let subs = '';
            if (p.item.content && p.item.content.trim()) {
              subs += '<div style="margin-left: 14px; color: #475569;">- (주요내용) ' + escapeHtml(p.item.content.trim()) + '</div>';
            }
            if (p.item.date && p.item.date.trim()) {
              subs += '<div style="margin-left: 14px; color: #475569;">- (일시) ' + escapeHtml(p.item.date.trim()) + '</div>';
            }
            if (p.item.admin && p.item.admin.trim()) {
              subs += '<div style="margin-left: 14px; color: #475569;">- (행정사항) ' + escapeHtml(p.item.admin.trim()) + '</div>';
            }
            return '<div style="margin-bottom: 6px;"><div>○ ' + escapeHtml(p.item.title) + nameSuffix + '</div>' + subs + '</div>';
          }).join('');
        }

        rowsHtml += \`
          <tr>
            <td style="border: 1px solid #000; padding: 8px 10px; width: 14%; text-align: center; vertical-align: middle; font-weight: bold; background-color: #fafafa;">
              \${escapeHtml(row.field)}
            </td>
            <td style="border: 1px solid #000; padding: 8px 10px; width: 43%; vertical-align: top; line-height: 1.5;">
              \${resStr}
            </td>
            <td style="border: 1px solid #000; padding: 8px 10px; width: 43%; vertical-align: top; line-height: 1.5;">
              \${planStr}
            </td>
          </tr>
        \`;
      });
    }

    container.innerHTML = \`
      <table style="border-collapse: collapse; width: 100%; border: 1px solid #000; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; font-size: 10pt; line-height: 1.5; color: #000;">
        <thead>
          <tr style="background-color: #EFEFEF; border-bottom: 1px solid #000;">
            <th style="border: 1px solid #000; padding: 8px; width: 14%; text-align: center; font-weight: bold;">업무 분야</th>
            <th style="border: 1px solid #000; padding: 8px; width: 43%; text-align: center; font-weight: bold;">지난 주 업무 처리 결과 (\${weekInfo.prevPeriodStr})</th>
            <th style="border: 1px solid #000; padding: 8px; width: 43%; text-align: center; font-weight: bold;">주간업무계획 (\${weekInfo.periodStr})</th>
          </tr>
        </thead>
        <tbody>\${rowsHtml}</tbody>
      </table>
    \`;
  }

  function copyHwpTable() {
    const weekInfo = getWeekInfo(fromDateKey(curMondayKey));
    const compiled = compileWeekData();
    const showName = Boolean(state.opts.showName);

    let rowsHtml = '';
    if (compiled.length === 0) {
      rowsHtml = '<tr><td colspan="3" style="border: 1px solid #000000; padding: 12px; text-align: center; font-size: 10pt;">등록된 주간업무계획 내용이 없습니다.</td></tr>';
    } else {
      compiled.forEach(row => {
        let resStr = '-';
        if (row.results.length > 0) {
          resStr = row.results.map(r => {
            const nameSuffix = showName ? ' (' + escapeHtml(r.memberName) + ')' : '';
            return '<div style="margin-bottom: 4px;">○ ' + escapeHtml(r.item.text) + nameSuffix + '</div>';
          }).join('');
        }

        let planStr = '-';
        if (row.plans.length > 0) {
          planStr = row.plans.map(p => {
            const nameSuffix = showName ? ' (' + escapeHtml(p.memberName) + ')' : '';
            let subs = '';
            if (p.item.content && p.item.content.trim()) {
              subs += '<div style="margin-left: 14px; color: #333333;">- (주요내용) ' + escapeHtml(p.item.content.trim()) + '</div>';
            }
            if (p.item.date && p.item.date.trim()) {
              subs += '<div style="margin-left: 14px; color: #333333;">- (일시) ' + escapeHtml(p.item.date.trim()) + '</div>';
            }
            if (p.item.admin && p.item.admin.trim()) {
              subs += '<div style="margin-left: 14px; color: #333333;">- (행정사항) ' + escapeHtml(p.item.admin.trim()) + '</div>';
            }
            return '<div style="margin-bottom: 6px;"><div>○ ' + escapeHtml(p.item.title) + nameSuffix + '</div>' + subs + '</div>';
          }).join('');
        }

        rowsHtml += \`
          <tr>
            <td style="border: 1px solid #000000; padding: 6px 8px; width: 14%; text-align: center; vertical-align: middle; font-weight: bold; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; background-color: #FAFAFA;">
              \${escapeHtml(row.field)}
            </td>
            <td style="border: 1px solid #000000; padding: 6px 8px; width: 43%; vertical-align: top; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; line-height: 1.5;">
              \${resStr}
            </td>
            <td style="border: 1px solid #000000; padding: 6px 8px; width: 43%; vertical-align: top; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; line-height: 1.5;">
              \${planStr}
            </td>
          </tr>
        \`;
      });
    }

    const tableHtml = \`
      <table style="border-collapse: collapse; width: 100%; border: 1px solid #000000; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; font-size: 10pt; line-height: 1.5; color: #000000;">
        <thead>
          <tr style="background-color: #EFEFEF; border-bottom: 1px solid #000000;">
            <th style="border: 1px solid #000000; padding: 8px 6px; width: 14%; text-align: center; font-weight: bold; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; background-color: #EFEFEF;">업무 분야</th>
            <th style="border: 1px solid #000000; padding: 8px 6px; width: 43%; text-align: center; font-weight: bold; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; background-color: #EFEFEF;">지난 주 업무 처리 결과 (\${weekInfo.prevPeriodStr})</th>
            <th style="border: 1px solid #000000; padding: 8px 6px; width: 43%; text-align: center; font-weight: bold; font-size: 10pt; font-family: 'Malgun Gothic', '맑은 고딕', sans-serif; background-color: #EFEFEF;">주간업무계획 (\${weekInfo.periodStr})</th>
          </tr>
        </thead>
        <tbody>\${rowsHtml}</tbody>
      </table>
    \`.trim();

    const div = document.createElement('div');
    div.innerHTML = tableHtml;
    div.style.position = 'fixed';
    div.style.left = '-9999px';
    div.style.top = '0';
    document.body.appendChild(div);

    const range = document.createRange();
    range.selectNode(div);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand('copy');
    sel.removeAllRanges();
    document.body.removeChild(div);

    showToast('한글(HWP) 맞춤 표 서식이 복사되었습니다. 한글에서 붙여넣기(Ctrl+V)하세요.');
  }

  function copyPlainText() {
    const compiled = compileWeekData();
    const showName = Boolean(state.opts.showName);

    if (compiled.length === 0) {
      showToast('복사할 내용이 없습니다.');
      return;
    }

    const sections = [];
    compiled.forEach(row => {
      const lines = [];
      lines.push('□ ' + row.field);
      lines.push(' [지난 주 업무 처리 결과]');
      if (row.results.length === 0) {
        lines.push('  -');
      } else {
        row.results.forEach(r => {
          const nameSuffix = showName ? ' (' + r.memberName + ')' : '';
          lines.push('  ○ ' + r.item.text + nameSuffix);
        });
      }
      lines.push(' [주간업무계획]');
      if (row.plans.length === 0) {
        lines.push('  -');
      } else {
        row.plans.forEach(p => {
          const nameSuffix = showName ? ' (' + p.memberName + ')' : '';
          lines.push('  ○ ' + p.item.title + nameSuffix);
          if (p.item.content && p.item.content.trim()) lines.push('    - (주요내용) ' + p.item.content.trim());
          if (p.item.date && p.item.date.trim()) lines.push('    - (일시) ' + p.item.date.trim());
          if (p.item.admin && p.item.admin.trim()) lines.push('    - (행정사항) ' + p.item.admin.trim());
        });
      }
      sections.push(lines.join('\\n'));
    });

    const fullText = sections.join('\\n\\n');
    navigator.clipboard.writeText(fullText).then(() => {
      showToast('텍스트가 클립보드에 복사되었습니다.');
    });
  }

  function downloadCsv() {
    const weekInfo = getWeekInfo(fromDateKey(curMondayKey));
    const compiled = compileWeekData();
    const rows = ['업무분야,구분,담당자,내용,주요내용,일시,행정사항'];

    function escapeCsv(str) {
      if (!str) return '""';
      return '"' + String(str).replace(/"/g, '""') + '"';
    }

    compiled.forEach(row => {
      row.results.forEach(r => {
        rows.push([
          escapeCsv(row.field),
          '지난 주 업무 처리 결과',
          escapeCsv(r.memberName),
          escapeCsv(r.item.text),
          '', '', ''
        ].join(','));
      });
      row.plans.forEach(p => {
        rows.push([
          escapeCsv(row.field),
          '주간업무계획',
          escapeCsv(p.memberName),
          escapeCsv(p.item.title),
          escapeCsv(p.item.content || ''),
          escapeCsv(p.item.date || ''),
          escapeCsv(p.item.admin || '')
        ].join(','));
      });
    });

    const bom = '\\uFEFF';
    const blob = new Blob([bom + rows.join('\\r\\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '주간업무계획_' + weekInfo.year + '년_' + weekInfo.month + '월_' + weekInfo.weekNum + '주차.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('엑셀(CSV) 파일이 다운로드되었습니다.');
  }

  // --- TAB 3: SETTINGS ---
  function renderSettingsTab() {
    document.getElementById('settingTeamName').value = state.team || '회계팀';
    document.getElementById('settingFieldsText').value = state.fields.join('\\n');

    const mList = document.getElementById('settingsMemberList');
    mList.innerHTML = '';

    state.members.forEach((m, idx) => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.style.alignItems = 'center';

      let fieldOptions = state.fields.map(f =>
        '<option value="' + escapeHtml(f) + '"' + (f === m.field ? ' selected' : '') + '>' + escapeHtml(f) + '</option>'
      ).join('');

      row.innerHTML = \`
        <span style="font-weight: bold; width: 24px;">\${idx + 1}.</span>
        <input type="text" class="text-input" style="max-width: 140px;" value="\${escapeHtml(m.name)}" onchange="updateMemberName('\${m.id}', this.value)">
        <select class="field-select" onchange="updateMemberField('\${m.id}', this.value)">\${fieldOptions}</select>
        <button class="btn btn-sm" onclick="moveMember(\${idx}, -1)" \${idx === 0 ? 'disabled' : ''}>▲</button>
        <button class="btn btn-sm" onclick="moveMember(\${idx}, 1)" \${idx === state.members.length - 1 ? 'disabled' : ''}>▼</button>
        <button class="btn btn-sm btn-danger" onclick="deleteMember('\${m.id}')">삭제</button>
      \`;
      mList.appendChild(row);
    });
  }

  function updateTeamName(val) {
    state.team = val.trim() || '회계팀';
    saveState();
    document.getElementById('appHeaderTitle').innerText = state.team + ' 주간업무계획 취합 도구';
    showToast('팀 이름이 변경되었습니다.');
  }

  function updateFieldsFromText(val) {
    const list = val.split(/\\r?\\n/).map(s => s.trim()).filter(Boolean);
    if (list.length === 0) {
      alert('적어도 하나 이상의 분야가 필요합니다.');
      renderSettingsTab();
      return;
    }
    state.fields = list;
    saveState();
    renderSettingsTab();
    showToast('업무 분야 목록이 저장되었습니다.');
  }

  function updateMemberName(id, val) {
    const mem = state.members.find(m => m.id === id);
    if (mem && val.trim()) {
      mem.name = val.trim();
      saveState();
      showToast('팀원 이름이 변경되었습니다.');
    }
  }

  function updateMemberField(id, val) {
    const mem = state.members.find(m => m.id === id);
    if (mem) {
      mem.field = val;
      saveState();
      showToast('기본 업무 분야가 변경되었습니다.');
    }
  }

  function moveMember(idx, dir) {
    const target = idx + dir;
    if (target < 0 || target >= state.members.length) return;
    const temp = state.members[idx];
    state.members[idx] = state.members[target];
    state.members[target] = temp;
    saveState();
    renderSettingsTab();
  }

  function addMember() {
    const newName = prompt('추가할 팀원 이름을 입력하세요:', '새 담당자');
    if (!newName || !newName.trim()) return;
    const newId = 'm_' + Date.now();
    state.members.push({
      id: newId,
      name: newName.trim(),
      field: state.fields[0] || '기타'
    });
    saveState();
    renderSettingsTab();
    showToast('팀원이 추가되었습니다.');
  }

  function deleteMember(id) {
    if (state.members.length <= 1) {
      alert('최소 1명의 팀원이 필요합니다.');
      return;
    }
    if (!confirm('정말 이 팀원을 목록에서 삭제하시겠습니까?')) return;
    state.members = state.members.filter(m => m.id !== id);
    saveState();
    renderSettingsTab();
    showToast('팀원이 삭제되었습니다.');
  }

  function backupJson() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '주간업무계획_백업_' + (state.team || '회계팀') + '_' + dateStr + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('백업 파일이 저장되었습니다.');
  }

  function loadBackupJson(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    if (!confirm('백업 파일을 불러오면 현재 데이터가 백업 내용으로 대체됩니다. 진행하시겠습니까?')) {
      evt.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const loaded = JSON.parse(e.target.result);
        if (loaded && loaded.members && loaded.fields) {
          state = loaded;
          saveState();
          renderApp();
          showToast('백업 데이터를 성공적으로 불러왔습니다.');
        } else {
          alert('올바른 백업 파일 형식이 아닙니다.');
        }
      } catch (err) {
        alert('백업 파일 읽기 실패: ' + err.message);
      }
      evt.target.value = '';
    };
    reader.readAsText(file);
  }

  function clearCurrentWeek() {
    const weekInfo = getWeekInfo(fromDateKey(curMondayKey));
    if (!confirm(weekInfo.fullTitle + '의 모든 입력 내용을 지우시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    delete state.weeks[curMondayKey];
    saveState();
    renderApp();
    showToast('현재 주차의 모든 내용이 초기화되었습니다.');
  }

  function renderApp() {
    renderInputTab();
    if (activeTab === 'result') renderResultTab();
    if (activeTab === 'settings') renderSettingsTab();
  }

  // Initialize
  curMondayKey = toDateKey(getDefaultTargetMonday());
  renderApp();
</script>
</body>
</html>`;
}
