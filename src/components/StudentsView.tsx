import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  Trash2,
  BookOpen,
  Award,
  ChevronLeft,
  X,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import { Student, StudentStats } from '../types';
import { getStatusBadgeColor } from '../services/masarService';

interface StudentsViewProps {
  students: Student[];
  studentStats: StudentStats[];
  onAddStudent: (data: { name: string; studentId: string; classroom?: string }) => Promise<void>;
  onDeleteStudent: (id: string, name: string) => Promise<void>;
  onOpenAddGradeForStudent: (studentId: string) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  studentStats,
  onAddStudent,
  onDeleteStudent,
  onOpenAddGradeForStudent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<StudentStats | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [classroom, setClassroom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Distinct classrooms list
  const classrooms = Array.from(
    new Set(students.map((s) => s.classroom).filter(Boolean))
  ) as string[];

  // Filter students
  const filtered = studentStats.filter((item) => {
    const matchesSearch =
      item.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClassroom === 'all' || item.student.classroom === selectedClassroom;
    return matchesSearch && matchesClass;
  });

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('يرجى إدخال اسم الطالب');
      return;
    }
    if (!studentId.trim()) {
      setFormError('يرجى إدخال الرقم الأكاديمي للطالب');
      return;
    }

    try {
      setIsSubmitting(true);
      await onAddStudent({
        name: name.trim(),
        studentId: studentId.trim(),
        classroom: classroom.trim() || undefined,
      });
      setName('');
      setStudentId('');
      setClassroom('');
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'حدث خطأ أثناء إضافة الطالب');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">سجل الطلاب</h2>
          <p className="text-xs text-slate-500">
            إدارة بيانات الطلاب المسجلين لديك ومتابعة تحصيلهم الدراسي ({students.length} طالب)
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة طالب جديد</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم أو الرقم الأكاديمي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-right"
          />
        </div>

        {classrooms.length > 0 && (
          <div className="w-full sm:w-auto flex items-center gap-2">
            <span className="text-xs text-slate-500 whitespace-nowrap">الفصل:</span>
            <select
              value={selectedClassroom}
              onChange={(e) => setSelectedClassroom(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">كل الفصول</option>
              {classrooms.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Students List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">لم يتم العثور على طلاب</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {students.length === 0
              ? 'ابدأ بإضافة أول طالب في فصلك الدراسي لتتمكن من رصد الدرجات واستعراض التقارير.'
              : 'لا توجد نتائج تطابق بحثك الحالي، جرب تغيير معايير البحث.'}
          </p>
          {students.length === 0 && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>إضافة أول طالب</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filtered.map((item) => {
            const badge = getStatusBadgeColor(item.status);
            return (
              <div
                key={item.student.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-slate-300 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-100 to-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm border border-slate-200">
                      {item.student.name[0] || 'ط'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.student.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[11px] text-slate-600">
                          {item.student.studentId}
                        </span>
                        {item.student.classroom && (
                          <span>• {item.student.classroom}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  {item.gradesCount > 0 ? (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.bg}`}>
                      {item.average}% • {item.status}
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                      بانتظار الرصد
                    </span>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.gradesCount} مواد مرصودة</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onOpenAddGradeForStudent(item.student.id)}
                      className="text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors"
                      title="رصد درجة جديدة لهذا الطالب"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>رصد درجة</span>
                    </button>

                    <button
                      onClick={() => setSelectedStudentForDetail(item)}
                      className="text-slate-600 hover:bg-slate-100 px-2 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                      title="عرض سجل درجات الطالب"
                    >
                      <span>السجل</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteStudent(item.student.id, item.student.name)}
                      className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                      title="حذف الطالب وسجل درجاته"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add Student */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">إضافة طالب جديد</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAdd} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الطالب الثلاثي <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: أحمد محمد العلي"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-right"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم الأكاديمي / رقم القيد <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: STD-2024-001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-right font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الصف / الشعبة (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="مثال: الصف العاشر - أ"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white text-right"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ الطالب في النظام'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Detail Transcript */}
      {selectedStudentForDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center">
                  {selectedStudentForDetail.student.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {selectedStudentForDetail.student.name}
                  </h3>
                  <div className="text-xs text-slate-500 font-mono">
                    {selectedStudentForDetail.student.studentId} • {selectedStudentForDetail.student.classroom || 'عام'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              {/* Summary Banner */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-around text-center">
                <div>
                  <div className="text-xs text-slate-500">المعدل العام</div>
                  <div className="text-xl font-black text-emerald-700">
                    {selectedStudentForDetail.average}%
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <div className="text-xs text-slate-500">التقدير</div>
                  <div className="text-sm font-bold text-slate-800">
                    {selectedStudentForDetail.status}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-200" />
                <div>
                  <div className="text-xs text-slate-500">المواد المرصودة</div>
                  <div className="text-xl font-black text-slate-800">
                    {selectedStudentForDetail.gradesCount}
                  </div>
                </div>
              </div>

              {/* Grades Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">تفاصيل المواد والدرجات</h4>
                {selectedStudentForDetail.grades.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-100">
                    لا توجد درجات مرصودة لهذا الطالب حتى الآن
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedStudentForDetail.grades.map((g) => (
                      <div
                        key={g.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{g.subject}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            {g.term} {g.notes ? `• ${g.notes}` : ''}
                          </div>
                        </div>
                        <div className="text-left font-mono font-bold text-sm text-slate-800">
                          {g.grade} / {g.maxGrade}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  const id = selectedStudentForDetail.student.id;
                  setSelectedStudentForDetail(null);
                  onOpenAddGradeForStudent(id);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>رصد درجة جديدة</span>
              </button>

              <button
                onClick={() => setSelectedStudentForDetail(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
