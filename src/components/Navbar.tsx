import React from 'react';
import {
  GraduationCap,
  Smartphone,
  Monitor,
  LogOut,
  UserCheck,
  Sparkles,
  Wifi,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isMobileFrame,
  setIsMobileFrame,
  onOpenAuth,
}) => {
  const { currentUser, isDemoMode, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">مَسار</h1>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                للمعلمين
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              نظام إدارة الطلاب ورصد الدرجات والتقارير الأكاديمية
            </p>
          </div>
        </div>

        {/* Center / Controls */}
        <div className="flex items-center gap-2">
          {/* Frame switcher: Phone view vs Desktop view */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200 text-xs">
            <button
              onClick={() => setIsMobileFrame(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                isMobileFrame
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض كشاشة تطبيق هاتف"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">واجهة الجوال</span>
            </button>
            <button
              onClick={() => setIsMobileFrame(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                !isMobileFrame
                  ? 'bg-white text-emerald-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="عرض كامل الشاشة"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">شاشة كاملة</span>
            </button>
          </div>

          {/* Database indicator */}
          {currentUser && (
            isDemoMode ? (
              <div
                className="hidden md:flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1.5 rounded-lg"
                title="البيانات محفوظة محلياً في وضع المعلم التجريبي"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold">وضع تجريبي نشط</span>
              </div>
            ) : (
              <div
                className="hidden md:flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg"
                title="متصل بقاعدة بيانات Firebase Firestore السحابية"
              >
                <Wifi className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="font-semibold">Firebase نشط</span>
              </div>
            )
          )}

          {/* Teacher Profile / Auth */}
          {currentUser ? (
            <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 py-1 px-2.5 rounded-xl">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                  {currentUser.displayName ? currentUser.displayName[0] : 'م'}
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.displayName || 'أستاذ المادة'}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]">
                    {currentUser.email || 'معلم مسار'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => logout()}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm"
            >
              <UserCheck className="w-4 h-4" />
              <span>تسجيل دخول المعلم</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
