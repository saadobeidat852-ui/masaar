import React, { useState } from 'react';
import {
  Printer,
  Download,
  Filter,
  BarChart2,
  CheckCircle,
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
  FileText,
  Sparkles,
} from 'lucide-react';
import { StudentStats, GradeStatus } from '../types';
import { getStatusBadgeColor } from '../services/masarService';
import { ParentReportModal } from './ParentReportModal';
import { ReportsCharts } from './ReportsCharts';

interface ReportsViewProps {
  studentStats: StudentStats[];
  teacherName?: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  studentStats,
  teacherName,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'avg-desc' | 'avg-asc' | 'name'>('avg-desc');
  const [showCharts, setShowCharts] = useState<boolean>(true);
  const [selectedStudentForParentReport, setSelectedStudentForParentReport] =
    useState<StudentStats | null>(null);

  // Filter
  const filtered = studentStats.filter((item) => {
    if (selectedStatus === 'all') return true;
    return item.status === selectedStatus;
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'avg-desc') return b.average - a.average;
    if (sortBy === 'avg-asc') return a.average - b.average;
    return a.student.name.localeCompare(b.student.name, 'ar');
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['اسم الطالب', 'الرقم الأكاديمي', 'الفصل', 'المعدل العام %', 'التقدير', 'عدد المواد'];
    const rows = sorted.map((s) => [
      `"${s.student.name}"`,
      `"${s.student.studentId}"`,
      `"${s.student.classroom || ''}"`,
      s.average,
      `"${s.status}"`,
      s.gradesCount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `تقرير_درجات_مسار_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">تقارير ومعدلات الطلاب</h2>
          <p className="text-xs text-slate-500">
            كشوف التحصيل الدراسي الشاملة وحساب المعدلات والتقديرات لكل طالب
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCharts(!showCharts)}
            className={`font-bold text-xs px-3.5 py-2 rounded-xl border shadow-xs transition-colors flex items-center gap-1.5 ${
              showCharts
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="إظهار / إخفاء التحليل البياني"
          >
            <BarChart2 className="w-4 h-4 text-indigo-600" />
            <span>{showCharts ? 'إخفاء الرسوم البيانية' : 'عرض الرسوم البيانية'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="تصدير ملف Excel CSV"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>تصدير CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="طباعة التقرير أو حفظ كـ PDF"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف الدرجات</span>
          </button>
        </div>
      </div>

      {/* Recharts Data Visualization Section */}
      {showCharts && (
        <div className="print:hidden">
          <ReportsCharts studentStats={studentStats} />
        </div>
      )}

      {/* Filter and Sort Tabs */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        {/* Status filter chips */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-500 ml-1">الحالة:</span>
          {(
            [
              { id: 'all', label: 'الكل' },
              { id: 'ممتاز', label: 'ممتاز' },
              { id: 'جيد جداً', label: 'جيد جداً' },
              { id: 'جيد', label: 'جيد' },
              { id: 'مقبول', label: 'مقبول' },
              { id: 'ضعيف', label: 'ضعيف' },
              { id: 'راسب', label: 'راسب' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedStatus(t.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                selectedStatus === t.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">ترتيب بحسب:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-1.5 px-3 text-slate-700 font-medium"
          >
            <option value="avg-desc">المعدل: من الأعلى للأدنى</option>
            <option value="avg-asc">المعدل: من الأدنى للأعلى</option>
            <option value="name">الاسم أبجدياً</option>
          </select>
        </div>
      </div>

      {/* Reports Print-friendly layout */}
      <div id="printable-report" className="space-y-4">
        {/* Print Header (Visible when printing) */}
        <div className="hidden print:block p-4 border-b-2 border-slate-900 mb-6 text-center">
          <h1 className="text-2xl font-black">نظام مسار - كشف الدرجات والتقييم الأكاديمي</h1>
          <p className="text-sm text-slate-600 mt-1">
            إعداد المعلم: {teacherName || 'معلم المادة'} • التاريخ:{' '}
            {new Date().toLocaleDateString('ar-EG')}
          </p>
        </div>

        {sorted.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
            لا توجد تقارير مطابقة للتصفية المحددة.
          </div>
        ) : (
          <div className="space-y-3.5">
            {sorted.map((item) => {
              const badge = getStatusBadgeColor(item.status);
              return (
                <div
                  key={item.student.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all break-inside-avoid"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {item.student.name}
                        </h3>
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {item.student.studentId}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.student.classroom ? `الفصل: ${item.student.classroom} • ` : ''}
                        عدد المواد المقيّمة: {item.gradesCount}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="text-xs text-slate-500">المعدل التراكمي</div>
                        <div className="text-2xl font-black text-slate-900">
                          {item.average}%
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1.5 rounded-xl text-xs font-black border ${badge.bg}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Grades summary chips */}
                  {item.grades.length > 0 ? (
                    <div className="mt-3 pt-1">
                      <div className="text-[11px] font-bold text-slate-500 mb-2">
                        تفاصيل المواد المرصودة:
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {item.grades.map((g) => {
                          const pct = Math.round((g.grade / (g.maxGrade || 100)) * 100);
                          return (
                            <div
                              key={g.id}
                              className="bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-800 block truncate max-w-[100px]">
                                  {g.subject}
                                </span>
                                <span className="text-[10px] text-slate-400">{g.term}</span>
                              </div>
                              <div className="text-left font-mono font-bold">
                                <span>{g.grade}</span>
                                <span className="text-slate-400 text-[10px]">/{g.maxGrade}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-xs text-slate-400">
                      لم يتم إدخال درجات لهذا الطالب حتى الآن.
                    </div>
                  )}
                  {/* Parent Report Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">
                      وثيقة رسمية منسقة ببيانات الطالب ودرجاته وملاحظات المتابعة
                    </span>
                    <button
                      onClick={() => setSelectedStudentForParentReport(item)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-xl border border-indigo-200 transition-colors flex items-center justify-center gap-1.5 shadow-2xs self-start sm:self-auto"
                      title="طباعة أو تحميل كشف أداء الطالب بصيغة PDF لتقديمه لولي الأمر"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-600" />
                      <span>تقرير ولي الأمر (PDF)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Parent Report Modal */}
      {selectedStudentForParentReport && (
        <ParentReportModal
          studentStats={selectedStudentForParentReport}
          teacherName={teacherName}
          onClose={() => setSelectedStudentForParentReport(null)}
        />
      )}
    </div>
  );
};
