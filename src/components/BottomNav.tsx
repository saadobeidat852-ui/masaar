import React from 'react';
import {
  LayoutDashboard,
  Users,
  PenTool,
  BarChart3,
  Code2,
} from 'lucide-react';

export type TabType = 'dashboard' | 'students' | 'grades' | 'reports' | 'expo';

interface BottomNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  studentsCount: number;
  gradesCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  studentsCount,
  gradesCount,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'الرئيسية',
      icon: LayoutDashboard,
    },
    {
      id: 'students' as TabType,
      label: 'الطلاب',
      icon: Users,
      badge: studentsCount > 0 ? studentsCount : undefined,
    },
    {
      id: 'grades' as TabType,
      label: 'رصد الدرجات',
      icon: PenTool,
      badge: gradesCount > 0 ? gradesCount : undefined,
    },
    {
      id: 'reports' as TabType,
      label: 'التقارير',
      icon: BarChart3,
    },
    {
      id: 'expo' as TabType,
      label: 'كود Expo',
      icon: Code2,
      highlight: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-emerald-100 text-emerald-700'
                    : tab.highlight
                    ? 'text-indigo-600 bg-indigo-50'
                    : 'text-slate-500'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <span className="text-[11px] mt-1 tracking-tight">{tab.label}</span>

              {tab.badge !== undefined && (
                <span className="absolute top-1 right-2 w-4 h-4 bg-emerald-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge > 99 ? '+99' : tab.badge}
                </span>
              )}

              {isActive && (
                <span className="absolute bottom-0 w-8 h-1 bg-emerald-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
