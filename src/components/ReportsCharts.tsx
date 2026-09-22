import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  BarChart2,
  PieChart as PieIcon,
  TrendingUp,
  Award,
  BookOpen,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { StudentStats, GradeStatus } from '../types';

interface ReportsChartsProps {
  studentStats: StudentStats[];
}

const STATUS_COLORS: Record<GradeStatus, string> = {
  ممتاز: '#059669', // Emerald
  'جيد جداً': '#0284c7', // Sky
  جيد: '#6366f1', // Indigo
  مقبول: '#d97706', // Amber
  ضعيف: '#ea580c', // Orange
  راسب: '#e11d48', // Rose
};

const PALETTE = ['#059669', '#0284c7', '#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export const ReportsCharts: React.FC<ReportsChartsProps> = ({ studentStats }) => {
  const [activeChartTab, setActiveChartTab] = useState<'status' | 'subjects' | 'students'>('status');

  // 1. Grade Status Distribution Data
  const statusData = useMemo(() => {
    const statusCounts: Record<GradeStatus, number> = {
      ممتاز: 0,
      'جيد جداً': 0,
      جيد: 0,
      مقبول: 0,
      ضعيف: 0,
      راسب: 0,
    };

    let totalWithGrades = 0;
    studentStats.forEach((s) => {
      if (s.gradesCount > 0) {
        statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
        totalWithGrades += 1;
      }
    });

    const categories: GradeStatus[] = ['ممتاز', 'جيد جداً', 'جيد', 'مقبول', 'ضعيف', 'راسب'];
    return categories.map((cat) => ({
      name: cat,
      count: statusCounts[cat],
      percentage: totalWithGrades > 0 ? Math.round((statusCounts[cat] / totalWithGrades) * 100) : 0,
      fill: STATUS_COLORS[cat],
    }));
  }, [studentStats]);

  // 2. Subject Performance Data
  const subjectsData = useMemo(() => {
    const subjectMap: Record<
      string,
      { totalScorePct: number; count: number; maxScore: number; minScore: number }
    > = {};

    studentStats.forEach((s) => {
      s.grades.forEach((g) => {
        const sub = g.subject ? g.subject.trim() : 'عام';
        const max = g.maxGrade || 100;
        const pct = Math.round((g.grade / max) * 100);

        if (!subjectMap[sub]) {
          subjectMap[sub] = {
            totalScorePct: pct,
            count: 1,
            maxScore: pct,
            minScore: pct,
          };
        } else {
          subjectMap[sub].totalScorePct += pct;
          subjectMap[sub].count += 1;
          subjectMap[sub].maxScore = Math.max(subjectMap[sub].maxScore, pct);
          subjectMap[sub].minScore = Math.min(subjectMap[sub].minScore, pct);
        }
      });
    });

    return Object.entries(subjectMap).map(([subject, data]) => ({
      subject,
      average: Math.round(data.totalScorePct / data.count),
      highest: data.maxScore,
      lowest: data.minScore,
      evaluationsCount: data.count,
    }));
  }, [studentStats]);

  // 3. Top / Individual Student Averages Data (Top 10 or all if fewer)
  const studentsAveragesData = useMemo(() => {
    return [...studentStats]
      .filter((s) => s.gradesCount > 0)
      .sort((a, b) => b.average - a.average)
      .slice(0, 12)
      .map((s) => ({
        name: s.student.name.length > 15 ? s.student.name.slice(0, 14) + '...' : s.student.name,
        fullName: s.student.name,
        average: s.average,
        status: s.status,
        fill: STATUS_COLORS[s.status] || '#059669',
      }));
  }, [studentStats]);

  // Overall Cohort Quick Metrics
  const metrics = useMemo(() => {
    const activeStudents = studentStats.filter((s) => s.gradesCount > 0);
    if (activeStudents.length === 0) {
      return {
        overallAvg: 0,
        passRate: 0,
        topSubject: '-',
        needsFocusSubject: '-',
        totalGradesRecorded: 0,
      };
    }

    const overallAvg =
      Math.round(
        (activeStudents.reduce((acc, curr) => acc + curr.average, 0) / activeStudents.length) * 10
      ) / 10;

    const passingCount = activeStudents.filter((s) => s.average >= 60).length;
    const passRate = Math.round((passingCount / activeStudents.length) * 100);

    const sortedSubjects = [...subjectsData].sort((a, b) => b.average - a.average);
    const topSubject = sortedSubjects.length > 0 ? `${sortedSubjects[0].subject} (${sortedSubjects[0].average}%)` : '-';
    const needsFocusSubject =
      sortedSubjects.length > 0
        ? `${sortedSubjects[sortedSubjects.length - 1].subject} (${sortedSubjects[sortedSubjects.length - 1].average}%)`
        : '-';

    const totalGradesRecorded = studentStats.reduce((acc, s) => acc + s.gradesCount, 0);

    return {
      overallAvg,
      passRate,
      topSubject,
      needsFocusSubject,
      totalGradesRecorded,
    };
  }, [studentStats, subjectsData]);

  const hasAnyData = studentStats.some((s) => s.gradesCount > 0);

  if (!hasAnyData) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
        <BarChart2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-700">لا توجد بيانات درجات للرسم البياني بعد</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
          قم برصد درجات الطلاب في شاشة "رصد الدرجات" لتظهر الرسوم البيانية الإحصائية لتوزيع المعدلات والأداء فوراً.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-6">
      {/* Chart Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shadow-2xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <span>التحليل البياني للأداء الأكاديمي</span>
              <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                Recharts Analytics
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              رسوم بيانية تفاعلية توضح توزيع المعدلات ومقارنة مستويات التحصيل بين المواد
            </p>
          </div>
        </div>

        {/* Chart View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setActiveChartTab('status')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeChartTab === 'status'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>توزيع التقديرات</span>
          </button>

          <button
            onClick={() => setActiveChartTab('subjects')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeChartTab === 'subjects'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>أداء المواد ({subjectsData.length})</span>
          </button>

          <button
            onClick={() => setActiveChartTab('students')}
            className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
              activeChartTab === 'students'
                ? 'bg-white text-indigo-700 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>معدلات الطلاب</span>
          </button>
        </div>
      </div>

      {/* Cohort Key Performance Indicators */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
            %
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">المعدل العام للدفعة</div>
            <div className="text-lg font-black text-slate-900">{metrics.overallAvg}%</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 font-semibold">نسبة النجاح العامة</div>
            <div className="text-lg font-black text-slate-900">{metrics.passRate}%</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Award className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] text-slate-500 font-semibold">أعلى مادة تحصيلاً</div>
            <div className="text-xs font-black text-slate-900 truncate" title={metrics.topSubject}>
              {metrics.topSubject}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-[11px] text-slate-500 font-semibold">أدنى مادة تحصيلاً</div>
            <div className="text-xs font-black text-slate-900 truncate" title={metrics.needsFocusSubject}>
              {metrics.needsFocusSubject}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
        {/* VIEW 1: Status Distribution Bar & Pie Charts */}
        {activeChartTab === 'status' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-700">
                توزيع الطلاب حسب التقديرات الأكاديمية (ممتاز، جيد جداً، جيد، مقبول، ضعيف، راسب)
              </h4>
              <div className="text-[11px] text-slate-400 font-medium">
                إجمالي الطلاب المقيّمين: {studentStats.filter((s) => s.gradesCount > 0).length} طالب
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              {/* Bar Chart (2 columns width) */}
              <div className="lg:col-span-2 h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1 text-right dir-rtl">
                              <div className="font-bold text-sm text-emerald-400">{data.name}</div>
                              <div>
                                عدد الطلاب: <span className="font-bold">{data.count}</span> طالب
                              </div>
                              <div className="text-slate-300">
                                النسبة من الدفعة: <span className="font-bold text-white">{data.percentage}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={55}>
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart & Mini Breakdown (1 column width) */}
              <div className="h-64 sm:h-72 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200/80 p-3">
                <div className="w-full h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData.filter((d) => d.count > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="count"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`pie-cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs">
                                <span>{data.name}: </span>
                                <span className="font-bold">{data.count} ({data.percentage}%)</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-3 gap-2 w-full pt-2 border-t border-slate-100 text-[11px]">
                  {statusData.map((d) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                      <span className="text-slate-600 truncate">{d.name}</span>
                      <span className="font-bold text-slate-800 ml-auto">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Subject Performance Comparison */}
        {activeChartTab === 'subjects' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <h4 className="text-xs font-bold text-slate-700">
                مقارنة متوسط التحصيل وأعلى وأدنى درجة عبر المواد الدراسية (%)
              </h4>
              <div className="flex items-center gap-3 text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> المتوسط العام
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> أعلى درجة
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-rose-400 inline-block" /> أدنى درجة
                </span>
              </div>
            </div>

            {subjectsData.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                لا توجد مواد مقيّمة لعرض المقارنة.
              </div>
            ) : (
              <div className="h-72 sm:h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={subjectsData} margin={{ top: 15, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="subject"
                      tick={{ fill: '#334155', fontSize: 12, fontWeight: 600 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1.5 text-right dir-rtl">
                              <div className="font-bold text-sm text-indigo-300 border-b border-slate-700 pb-1">
                                مادة: {item.subject}
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-slate-400">متوسط درجات الطلاب:</span>
                                <span className="font-bold text-indigo-400">{item.average}%</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-slate-400">أعلى درجة محققة:</span>
                                <span className="font-bold text-emerald-400">{item.highest}%</span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-slate-400">أدنى درجة محققة:</span>
                                <span className="font-bold text-rose-400">{item.lowest}%</span>
                              </div>
                              <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                                عدد التقييمات المرصودة: {item.evaluationsCount}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="average" name="المتوسط" fill="#4f46e5" radius={[6, 6, 0, 0]} maxBarSize={38} />
                    <Bar dataKey="highest" name="أعلى درجة" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="lowest" name="أدنى درجة" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* VIEW 3: Individual Student Averages Chart */}
        {activeChartTab === 'students' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1">
              <h4 className="text-xs font-bold text-slate-700">
                مقارنة المعدلات التراكمية الفردية للطلاب (أفضل أداء)
              </h4>
              <div className="text-[11px] text-slate-500 font-medium">
                الخط الأحمر المتقطع يشير إلى عتبة النجاح (60%)
              </div>
            </div>

            <div className="h-72 sm:h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studentsAveragesData} margin={{ top: 15, right: 10, left: -15, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    interval={0}
                    angle={-25}
                    textAnchor="end"
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1 text-right dir-rtl">
                            <div className="font-bold text-sm text-emerald-400">{item.fullName}</div>
                            <div>
                              المعدل التراكمي: <span className="font-bold text-white">{item.average}%</span>
                            </div>
                            <div className="text-slate-300">
                              التقدير: <span className="font-bold" style={{ color: item.fill }}>{item.status}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="average" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {studentsAveragesData.map((entry, index) => (
                      <Cell key={`student-bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
