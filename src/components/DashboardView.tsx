import React, { useState } from 'react';
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  FileSpreadsheet,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  BellRing,
  HelpCircle,
  BookOpen,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { StudentStats, DashboardStats, Grade } from '../types';
import { getStatusBadgeColor } from '../services/masarService';

interface DashboardViewProps {
  stats: DashboardStats;
  studentStats: StudentStats[];
  onNavigate: (tab: 'students' | 'grades' | 'reports' | 'expo') => void;
  onOpenAddStudent: () => void;
  onOpenAddGrade: () => void;
  onOpenAddGradeForStudent?: (studentId: string) => void;
  teacherName?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  studentStats,
  onNavigate,
  onOpenAddStudent,
  onOpenAddGrade,
  onOpenAddGradeForStudent,
  teacherName,
}) => {
  // Alert Threshold state (defaults to 60 as requested)
  const [alertThreshold, setAlertThreshold] = useState<number>(60);
  const [filterMode, setFilterMode] = useState<'any-subject' | 'overall-avg'>('any-subject');

  // Sort students by average descending for top achievers
  const topAchievers = [...studentStats]
    .filter((s) => s.gradesCount > 0)
    .sort((a, b) => b.average - a.average)
    .slice(0, 3);

  // Calculate students needing intervention based on threshold
  const studentsNeedingIntervention = studentStats
    .filter((item) => item.gradesCount > 0)
    .map((item) => {
      // Find specific grades below threshold
      const lowGrades = item.grades.filter((g) => {
        const max = g.maxGrade > 0 ? g.maxGrade : 100;
        const pct = (g.grade / max) * 100;
        return pct < alertThreshold;
      });

      const isLowOverall = item.average < alertThreshold;
      const isTarget = filterMode === 'any-subject' ? lowGrades.length > 0 : isLowOverall;

      return {
        ...item,
        lowGrades,
        isLowOverall,
        isTarget,
      };
    })
    .filter((item) => item.isTarget)
    .sort((a, b) => a.average - b.average); // Lowest average first

  return (
    <div className="space-y-6 pb-20">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-6 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-emerald-100 text-xs font-semibold backdrop-blur-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>لوحة مؤشرات أداء الطلاب والإنذار المبكر</span>
            </div>
            <h2 className="text-2xl font-black text-white">
              أهلاً بك، {teacherName || 'أستاذ المادة'} 👋
            </h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              تطبيق مسار يتيح لك متابعة تحصيل طلابك الأكاديمي، رصد الدرجات اللحظي، وتلقي تنبيهات التدخل للطلاب المتعثرين.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddStudent}
              className="bg-white text-emerald-800 hover:bg-emerald-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>إضافة طالب</span>
            </button>
            <button
              onClick={onOpenAddGrade}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition-colors border border-emerald-400 flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>رصد درجة</span>
            </button>
          </div>
        </div>

        {/* Decorative background shape */}
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">إجمالي الطلاب</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{stats.totalStudents}</div>
            <div className="text-[11px] text-slate-500 mt-1">طالباً مسجلاً بالنظام</div>
          </div>
        </div>

        {/* Total Grades */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">التقييمات المرصودة</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900">{stats.totalGrades}</div>
            <div className="text-[11px] text-slate-500 mt-1">درجة مسجلة لكافة المواد</div>
          </div>
        </div>

        {/* Overall Average */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">المعدل العام</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <div className="text-2xl font-black text-emerald-700">{stats.overallAverage}%</div>
            <span className="text-xs font-bold text-emerald-600">متوسط الدرجات</span>
          </div>
        </div>

        {/* Pass Rate */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">نسبة النجاح</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <div className="text-2xl font-black text-teal-700">{stats.passRate}%</div>
            <span className="text-xs text-slate-500">من الطلاب المُقيّمين</span>
          </div>
        </div>
      </div>

      {/* NEW FEATURE: INTERVENTION & ALERT SYSTEM (تنبيه المعلم للتدخل الأكاديمي) */}
      <div className="bg-white rounded-2xl border-2 border-rose-200/90 shadow-sm overflow-hidden">
        {/* Alert Header */}
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 p-4 sm:p-5 border-b border-rose-200/80">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-600/20">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    رادار الإنذار الأكاديمي وتنبيهات التدخل
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white shadow-xs">
                    {studentsNeedingIntervention.length} طلاب
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  قائمة فورية لتنبيه المعلم بالطلاب الحاصلين على درجات أقل من المستوى المطلوب لاتخاذ إجراء علاجي سريع
                </p>
              </div>
            </div>

            {/* Threshold Controls */}
            <div className="flex flex-wrap items-center gap-2 bg-white/80 backdrop-blur-xs p-1.5 rounded-xl border border-rose-200 self-start md:self-auto text-xs">
              <div className="flex items-center gap-1 text-slate-600 font-bold px-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-rose-600" />
                <span>عتبة التنبيه:</span>
              </div>
              {[50, 60, 70].map((val) => (
                <button
                  key={val}
                  onClick={() => setAlertThreshold(val)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    alertThreshold === val
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  أقل من {val}%
                </button>
              ))}
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="mt-3 pt-3 border-t border-rose-200/50 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">معيار الفرز:</span>
              <button
                onClick={() => setFilterMode('any-subject')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filterMode === 'any-subject'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                مادة واحدة على الأقل أقل من {alertThreshold}% (شامل)
              </button>
              <button
                onClick={() => setFilterMode('overall-avg')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                  filterMode === 'overall-avg'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                المعدل العام أقل من {alertThreshold}%
              </button>
            </div>

            <span className="text-[11px] text-slate-500">
              يُنصح بمراجعة المواد الضعيفة فوراً قبل الاختبارات النهائية
            </span>
          </div>
        </div>

        {/* List of Alerted Students */}
        <div className="p-4 sm:p-5">
          {studentsNeedingIntervention.length === 0 ? (
            <div className="py-8 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                لا توجد حالات تستدعي التدخل حالياً
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                كافة الطلاب المقيّمين حصلوا على درجات أعلى من {alertThreshold}%، أو لم تُسجل درجات دون هذا المستوى.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {studentsNeedingIntervention.map((item) => {
                const badge = getStatusBadgeColor(item.status);
                return (
                  <div
                    key={item.student.id}
                    className="p-4 rounded-xl border border-rose-200/90 bg-rose-50/30 hover:bg-rose-50/60 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Student info & GPA */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs border border-rose-200">
                            {item.student.name[0]}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {item.student.name}
                            </h4>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {item.student.studentId} • {item.student.classroom || 'عام'}
                            </div>
                          </div>
                        </div>

                        <div className="text-left">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-black ${badge.bg}`}>
                            المعدل: {item.average}%
                          </span>
                        </div>
                      </div>

                      {/* Subjects with low grades */}
                      <div className="mt-3 pt-2 border-t border-rose-100">
                        <div className="text-[11px] font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>المواد التي حصل فيها على أقل من {alertThreshold}%:</span>
                        </div>

                        {item.lowGrades.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {item.lowGrades.map((lg) => {
                              const pct = Math.round((lg.grade / (lg.maxGrade || 100)) * 100);
                              return (
                                <span
                                  key={lg.id}
                                  className="inline-flex items-center gap-1 bg-white border border-rose-300 text-rose-800 text-xs px-2.5 py-1 rounded-lg font-bold shadow-2xs"
                                >
                                  <span>{lg.subject}:</span>
                                  <span className="font-mono text-rose-600 font-black">
                                    {lg.grade}/{lg.maxGrade} ({pct}%)
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-[11px] text-slate-500">
                            المعدل التراكمي منخفض رغم عدم وجود درجات مفردة تحت الحد
                          </div>
                        )}
                      </div>

                      {/* Recommended Intervention Action */}
                      <div className="mt-2.5 p-2 bg-amber-50/80 rounded-lg border border-amber-200/60 text-[11px] text-amber-800 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>
                          <strong>خطة التدخل المقترحة:</strong> إسناد واجب تعويضي أو جدولة حصة مراجعة لمواضيع الاختبار.
                        </span>
                      </div>
                    </div>

                    {/* Teacher Action Buttons */}
                    <div className="mt-3 pt-2.5 border-t border-rose-200/60 flex items-center justify-between text-xs">
                      <button
                        onClick={() => {
                          if (onOpenAddGradeForStudent) {
                            onOpenAddGradeForStudent(item.student.id);
                          } else {
                            onNavigate('grades');
                          }
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>رصد درجة تحسينية</span>
                      </button>

                      <button
                        onClick={() => onNavigate('reports')}
                        className="text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                      >
                        <span>تقرير الطالب الكامل</span>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Grade Level Distribution */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">توزيع التقديرات الأكاديمية</h3>
            <p className="text-xs text-slate-500">تصنيف الطلاب بحسب المعدل التراكمي</p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>عرض كل التقارير</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Status Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {(
            [
              { label: 'ممتاز', range: '90-100%', count: stats.statusCounts['ممتاز'], color: 'emerald' },
              { label: 'جيد جداً', range: '80-89%', count: stats.statusCounts['جيد جداً'], color: 'blue' },
              { label: 'جيد', range: '70-79%', count: stats.statusCounts['جيد'], color: 'teal' },
              { label: 'مقبول', range: '60-69%', count: stats.statusCounts['مقبول'], color: 'amber' },
              { label: 'ضعيف', range: '50-59%', count: stats.statusCounts['ضعيف'], color: 'orange' },
              { label: 'راسب', range: 'أقل من 50%', count: stats.statusCounts['راسب'], color: 'rose' },
            ] as const
          ).map((item) => {
            return (
              <div
                key={item.label}
                className="bg-slate-50 hover:bg-slate-100/80 transition-colors rounded-xl p-3 border border-slate-200 text-center"
              >
                <div className="text-xs font-bold text-slate-700">{item.label}</div>
                <div className="text-[10px] text-slate-400 font-medium">{item.range}</div>
                <div className="text-xl font-black text-slate-900 mt-1">{item.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Achievers (لوحة الشرف) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">الطلاب الأوائل المتفوقون</h3>
              <p className="text-[11px] text-slate-400">لوحة الشرف لأعلى الطلاب تحصيلاً دراسياً</p>
            </div>
          </div>
          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            لوحة الشرف
          </span>
        </div>

        {topAchievers.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            لم يتم رصد درجات كافية بعد لإظهار لوحة الشرف
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topAchievers.map((item, idx) => {
              const badge = getStatusBadgeColor(item.status);
              return (
                <div
                  key={item.student.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{item.student.name}</div>
                      <div className="text-xs text-slate-500">
                        {item.student.studentId} • {item.student.classroom || 'عام'}
                      </div>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${badge.bg}`}>
                      {item.average}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Access to Expo App Code */}
      <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-center sm:text-right">
          <div className="w-10 h-10 rounded-xl bg-white text-emerald-700 flex items-center justify-center shadow-xs">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">كود تطبيق الموبايل (Expo + React Native)</h4>
            <p className="text-xs text-slate-500">
              ملفات الكود محدثة وتتضمن شاشات التنبيهات وإدارة الطلاب ورصد الدرجات وقاعدة بيانات Firebase.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('expo')}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all whitespace-nowrap"
        >
          عرض مشروع Expo
        </button>
      </div>
    </div>
  );
};
