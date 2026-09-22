import React, { useState } from 'react';
import {
  Award,
  PlusCircle,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { Student, Grade } from '../types';

const COMMON_SUBJECTS = [
  'الرياضيات',
  'اللغة العربية',
  'العلوم',
  'اللغة الإنجليزية',
  'التربية الإسلامية',
  'الدراسات الاجتماعية',
  'الحاسوب وتكنولوجيا المعلومات',
  'الفيزياء',
  'الكيمياء',
];

const EXAM_TERMS = [
  'الاختبار الشهري الأول',
  'اختبار منتصف الفصل',
  'الاختبار النهائي',
  'مشاركة وواجبات',
  'مشروع عملي',
];

interface GradesViewProps {
  students: Student[];
  grades: Grade[];
  onAddGrade: (data: {
    studentId: string;
    subject: string;
    grade: number;
    maxGrade?: number;
    term?: string;
    notes?: string;
  }) => Promise<void>;
  onDeleteGrade: (id: string) => Promise<void>;
  preselectedStudentId?: string;
}

export const GradesView: React.FC<GradesViewProps> = ({
  students,
  grades,
  onAddGrade,
  onDeleteGrade,
  preselectedStudentId,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    preselectedStudentId || (students[0]?.id ?? '')
  );
  const [subject, setSubject] = useState<string>(COMMON_SUBJECTS[0]);
  const [customSubject, setCustomSubject] = useState<string>('');
  const [isCustomSubject, setIsCustomSubject] = useState<boolean>(false);
  const [gradeScore, setGradeScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('100');
  const [term, setTerm] = useState<string>(EXAM_TERMS[0]);
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter state for the grade table
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterStudentId, setFilterStudentId] = useState<string>('all');

  const activeSubjectName = isCustomSubject ? customSubject.trim() : subject;

  const handleSubmitGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessToast(null);

    if (!selectedStudentId) {
      setFormError('يرجى اختيار طالب لرصد الدرجة');
      return;
    }

    if (!activeSubjectName) {
      setFormError('يرجى تحديد اسم المادة');
      return;
    }

    const numGrade = parseFloat(gradeScore);
    const numMax = parseFloat(maxScore) || 100;

    if (isNaN(numGrade) || numGrade < 0 || numGrade > numMax) {
      setFormError(`الدرجة يجب أن تكون قيمة رقمية صحيحة بين 0 و ${numMax}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddGrade({
        studentId: selectedStudentId,
        subject: activeSubjectName,
        grade: numGrade,
        maxGrade: numMax,
        term,
        notes: notes.trim() || undefined,
      });

      // Clear input fields
      setGradeScore('');
      setNotes('');
      const studentName = students.find((s) => s.id === selectedStudentId)?.name || 'الطالب';
      setSuccessToast(`تم رصد درجة مادة ${activeSubjectName} بنجاح لـ ${studentName}`);
      setTimeout(() => setSuccessToast(null), 4000);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'تعذر رصد الدرجة');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered grades list
  const filteredGrades = grades.filter((g) => {
    const matchesSubject = filterSubject === 'all' || g.subject === filterSubject;
    const matchesStudent = filterStudentId === 'all' || g.studentId === filterStudentId;
    return matchesSubject && matchesStudent;
  });

  const getStudentName = (id: string) => {
    const s = students.find((item) => item.id === id);
    return s ? s.name : 'طالب غير محدد';
  };

  const getStudentCode = (id: string) => {
    const s = students.find((item) => item.id === id);
    return s ? s.studentId : '';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900">رصد الدرجات والتقييمات</h2>
        <p className="text-xs text-slate-500">
          تسجيل درجات المواد الدراسية للطلاب وإدارتها فوريًا على قاعدة البيانات
        </p>
      </div>

      {/* Grade Entry Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <PlusCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">إدخال تقييم جديد</h3>
            <p className="text-[11px] text-slate-400">حدد الطالب والمادة وأدخل الدرجة المحرزة</p>
          </div>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {successToast && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successToast}</span>
          </div>
        )}

        {students.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            يرجى إضافة طلاب أولاً في تبويب "الطلاب" قبل البدء برصد الدرجات.
          </div>
        ) : (
          <form onSubmit={handleSubmitGrade} className="space-y-4">
            {/* Student selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                اختر الطالب <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-right font-medium"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.studentId}) {s.classroom ? `- ${s.classroom}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  المادة الدراسية <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomSubject(!isCustomSubject)}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800"
                >
                  {isCustomSubject ? 'اختيار من القائمة' : '+ مادة أخرى مخصصة'}
                </button>
              </div>

              {isCustomSubject ? (
                <input
                  type="text"
                  placeholder="اكتب اسم المادة..."
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-right"
                  required
                />
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_SUBJECTS.map((s) => {
                    const isSelected = subject === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSubject(s)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Score and Max Score */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الدرجة المحصلة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="مثال: 92"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-right font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الدرجة العظمى</label>
                <input
                  type="number"
                  placeholder="100"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-right font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نوع التقييم</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-right font-medium"
                >
                  {EXAM_TERMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ملاحظات المعلم (اختياري)
              </label>
              <input
                type="text"
                placeholder="مثال: أداء متميز في المسائل التحليلية"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-right"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Award className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الحفظ...' : 'حفظ ورصد الدرجة'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Filter and Recorded Grades List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">
              سجل الدرجات المرصودة ({grades.length})
            </h3>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="w-3.5 h-3.5" />
              <span>تصفية:</span>
            </div>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
            >
              <option value="all">كل المواد</option>
              {Array.from(new Set(grades.map((g) => g.subject))).map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
            </select>

            <select
              value={filterStudentId}
              onChange={(e) => setFilterStudentId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700"
            >
              <option value="all">كل الطلاب</option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredGrades.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            لا توجد درجات مسجلة تطابق التصفية المحددة.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredGrades.map((g) => {
              const percentage = Math.round((g.grade / (g.maxGrade || 100)) * 100);
              return (
                <div
                  key={g.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 px-2 rounded-xl transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {getStudentName(g.studentId)}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {getStudentCode(g.studentId)}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                      <span className="font-semibold text-emerald-700">{g.subject}</span>
                      <span>•</span>
                      <span>{g.term}</span>
                      {g.notes && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400 italic">"{g.notes}"</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left">
                      <div className="font-mono font-black text-slate-900 text-sm">
                        {g.grade} / {g.maxGrade || 100}
                      </div>
                      <div
                        className={`text-[10px] font-bold ${
                          percentage >= 80
                            ? 'text-emerald-600'
                            : percentage >= 50
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {percentage}%
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteGrade(g.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="حذف الدرجة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
