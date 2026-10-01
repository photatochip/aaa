import { useState, useEffect, useRef, useCallback } from 'react';
import { AppData } from './types';
import {
  getDefaultTargetMonday,
  getWeekInfo,
  toDateKey,
  fromDateKey,
} from './utils/dateUtils';
import { loadAppData, saveAppData } from './utils/storage';
import { Header } from './components/Header';
import { InputTab } from './components/InputTab';
import { ResultTab } from './components/ResultTab';
import { SettingsTab } from './components/SettingsTab';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  // App Data & Storage state
  const [appData, setAppData] = useState<AppData>(() => {
    const { data } = loadAppData();
    return data;
  });
  const [storageError, setStorageError] = useState<string | null>(() => {
    const { error } = loadAppData();
    return error;
  });

  // Active Monday Key (defaults to upcoming Monday on Thu~Sun, current Monday on Mon~Wed)
  const [curMondayKey, setCurMondayKey] = useState<string>(() => {
    return toDateKey(getDefaultTargetMonday());
  });

  // Active Tab
  const [activeTab, setActiveTab] = useState<'input' | 'result' | 'settings'>('input');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (text: string, type: 'success' | 'error' | 'info' = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, text, type }]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 250ms Debounced Auto-Save to localStorage
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const { success, error } = saveAppData(appData);
      if (!success) {
        setStorageError(error);
      } else {
        setStorageError(null);
      }
    }, 250);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [appData]);

  // Week navigation
  const handlePrevWeek = () => {
    const d = fromDateKey(curMondayKey);
    d.setDate(d.getDate() - 7);
    setCurMondayKey(toDateKey(d));
  };

  const handleNextWeek = () => {
    const d = fromDateKey(curMondayKey);
    d.setDate(d.getDate() + 7);
    setCurMondayKey(toDateKey(d));
  };

  const handleResetWeek = () => {
    setCurMondayKey(toDateKey(getDefaultTargetMonday()));
    showToast('기준 주차로 이동했습니다.', 'info');
  };

  // Week Information
  const weekInfo = getWeekInfo(fromDateKey(curMondayKey));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-rose-200">
      {/* Top Header */}
      <Header
        teamName={appData.team}
        weekInfo={weekInfo}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onResetWeek={handleResetWeek}
        storageError={storageError}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'input' && (
          <InputTab
            appData={appData}
            curMondayKey={curMondayKey}
            weekInfo={weekInfo}
            onUpdateAppData={setAppData}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'result' && (
          <ResultTab
            appData={appData}
            curMondayKey={curMondayKey}
            weekInfo={weekInfo}
            onUpdateAppData={setAppData}
            onShowToast={showToast}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab
            appData={appData}
            curMondayKey={curMondayKey}
            weekInfo={weekInfo}
            onUpdateAppData={setAppData}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>
            {appData.team || '회계팀'} 주간업무계획 취합 도구 · 업무망 오프라인 전용
          </span>
          <span>모든 데이터는 브라우저 내부(localStorage)에 안전하게 자동 저장됩니다.</span>
        </div>
      </footer>

      {/* Toast Messages */}
      <Toast toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
