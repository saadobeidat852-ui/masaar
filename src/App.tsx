/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { GradesView } from './components/GradesView';
import { ReportsView } from './components/ReportsView';
import { ExpoCodeView } from './components/ExpoCodeView';
import { AuthModal } from './components/AuthModal';
import {
  Student,
  Grade,
  StudentStats,
  DashboardStats,
} from './types';
import {
  subscribeToStudents,
  subscribeToGrades,
  addStudent,
  deleteStudent,
  addGrade,
  deleteGrade,
  computeStudentStats,
  computeDashboardStats,
} from './services/masarService';
import {
  Sparkles,
  WifiOff,
  UserCheck,
  Smartphone,
  GraduationCap,
  Layers,
} from 'lucide-react';

function MasarMain() {
  const { currentUser, loading: authLoading, signInDemoTeacher } = useAuth();

  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Firestore Data State
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | undefined>(undefined);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  // Subscribe to Firestore collections
  useEffect(() => {
    if (!currentUser) {
      setStudents([]);
      setGrades([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    const unsubStudents = subscribeToStudents(
      currentUser.uid,
      (data) => {
        setStudents(data);
        setDataLoading(false);
      },
      (err) => {
        console.error('Error fetching students:', err);
        setDataLoading(false);
      }
    );

    const unsubGrades = subscribeToGrades(
      currentUser.uid,
      (data) => {
        setGrades(data);
      },
      (err) => {
        console.error('Error fetching grades:', err);
      }
    );

    return () => {
      unsubStudents();
      unsubGrades();
    };
  }, [currentUser]);

  // Computed statistics
  const studentStats: StudentStats[] = computeStudentStats(students, grades);
  const dashboardStats: DashboardStats = computeDashboardStats(studentStats, grades.length);

  // Handlers
  const handleAddStudent = async (data: { name: string; studentId: string; classroom?: string }) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    await addStudent(currentUser.uid, data);
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!currentUser) return;
    if (window.confirm(`هل أنت متأكد من حذف الطالب "${name}" وكافة درجاته المسجلة؟`)) {
      await deleteStudent(id, currentUser.uid);
    }
  };

  const handleAddGrade = async (data: {
    studentId: string;
    subject: string;
    grade: number;
    maxGrade?: number;
    term?: string;
    notes?: string;
  }) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    await addGrade(currentUser.uid, data);
  };

  const handleDeleteGrade = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الدرجة؟')) {
      await deleteGrade(id);
    }
  };

  const handleOpenAddGradeForStudent = (studentId: string) => {
    setPreselectedStudentId(studentId);
    setActiveTab('grades');
  };

  // Seed sample data for teacher convenience
  const handleSeedDemoData = async () => {
    if (!currentUser) return;
    setIsSeeding(true);
    try {
      const sampleStudents = [
        { name: 'محمد أحمد المنصوري', studentId: 'STD-101', classroom: 'الصف العاشر - أ' },
        { name: 'سارة خالد العتيبي', studentId: 'STD-102', classroom: 'الصف العاشر - أ' },
        { name: 'عمر ياسين الكردي', studentId: 'STD-103', classroom: 'الصف العاشر - ب' },
        { name: 'فاطمة عبد الله النجار', studentId: 'STD-104', classroom: 'الصف العاشر - ب' },
        { name: 'زيد حسام الشريف', studentId: 'STD-105', classroom: 'الصف العاشر - أ' },
      ];

      for (const s of sampleStudents) {
        const docId = await addStudent(currentUser.uid, s);
        if (docId) {
          // Add 2-3 sample grades
          const sampleSubjects = [
            { subject: 'الرياضيات', grade: Math.floor(Math.random() * 25) + 75 },
            { subject: 'اللغة العربية', grade: Math.floor(Math.random() * 20) + 80 },
            { subject: 'العلوم', grade: Math.floor(Math.random() * 30) + 65 },
          ];
          for (const sub of sampleSubjects) {
            await addGrade(currentUser.uid, {
              studentId: docId,
              subject: sub.subject,
              grade: sub.grade,
              maxGrade: 100,
              term: 'اختبار منتصف الفصل',
            });
          }
        }
      }
    } catch (e) {
      console.error('Seeding error:', e);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-['Tajawal',sans-serif] text-slate-800">
      {/* Top Navbar */}
      <Navbar
        isMobileFrame={isMobileFrame}
        setIsMobileFrame={setIsMobileFrame}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex justify-center py-4 px-2 sm:px-4">
        {isMobileFrame ? (
          /* Mobile Phone Frame Mockup */
          <div className="w-full max-w-md bg-white rounded-[38px] shadow-2xl border-[10px] border-slate-900 overflow-hidden flex flex-col relative min-h-[760px] max-h-[880px]">
            {/* Phone Notch / Speaker */}
            <div className="bg-slate-900 h-6 w-full flex items-center justify-center relative shrink-0">
              <div className="w-24 h-4 bg-slate-900 rounded-b-xl flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-700 rounded-full" />
                <div className="w-2 h-2 rounded-full bg-slate-800 mr-2" />
              </div>
            </div>

            {/* Mobile Status Bar */}
            <div className="px-5 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-600 bg-white shrink-0 border-b border-slate-100">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <span>تطبيق مَسار</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            {/* Mobile Scrollable Viewport */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              {authLoading ? (
                <div className="h-full flex flex-col items-center justify-center py-20 text-slate-400">
                  <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
                  <span className="text-xs">جاري تهيئة النظام...</span>
                </div>
              ) : !currentUser ? (
                /* Prompt to Login */
                <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-white rounded-3xl border border-slate-200 mt-6 shadow-xs">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4">
                    <GraduationCap className="w-9 h-9" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900">مرحباً بك في مَسار</h3>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    منصة المعلم لإدارة قوائم الطلاب، رصد الدرجات اللحظي، واستخراج تقارير التقديرات التراكمية.
                  </p>

                  <div className="w-full space-y-2 mt-6">
                    <button
                      onClick={() => {
                        signInDemoTeacher().catch((err) => console.warn('Demo login note:', err));
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>دخول تجريبي فوري كمعلم</span>
                    </button>

                    <button
                      onClick={() => setIsAuthModalOpen(true)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>تسجيل الدخول بحساب Google / البريد</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Authenticated Content */
                <>
                  {/* Quick Seed Banner if no students */}
                  {students.length === 0 && !dataLoading && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-emerald-900">فصلك الدراسي جديد فارغ</div>
                        <div className="text-[11px] text-emerald-700">تريد ملء بيانات تجريبية للاختبار؟</div>
                      </div>
                      <button
                        onClick={handleSeedDemoData}
                        disabled={isSeeding}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
                      >
                        {isSeeding ? 'جاري الإضافة...' : 'إضافة طلاب تجريبيين'}
                      </button>
                    </div>
                  )}

                  {activeTab === 'dashboard' && (
                    <DashboardView
                      stats={dashboardStats}
                      studentStats={studentStats}
                      onNavigate={(tab) => setActiveTab(tab)}
                      onOpenAddStudent={() => setActiveTab('students')}
                      onOpenAddGrade={() => setActiveTab('grades')}
                      onOpenAddGradeForStudent={handleOpenAddGradeForStudent}
                      teacherName={currentUser.displayName || undefined}
                    />
                  )}

                  {activeTab === 'students' && (
                    <StudentsView
                      students={students}
                      studentStats={studentStats}
                      onAddStudent={handleAddStudent}
                      onDeleteStudent={handleDeleteStudent}
                      onOpenAddGradeForStudent={handleOpenAddGradeForStudent}
                    />
                  )}

                  {activeTab === 'grades' && (
                    <GradesView
                      students={students}
                      grades={grades}
                      onAddGrade={handleAddGrade}
                      onDeleteGrade={handleDeleteGrade}
                      preselectedStudentId={preselectedStudentId}
                    />
                  )}

                  {activeTab === 'reports' && (
                    <ReportsView
                      studentStats={studentStats}
                      teacherName={currentUser.displayName || undefined}
                    />
                  )}

                  {activeTab === 'expo' && <ExpoCodeView />}
                </>
              )}
            </div>

            {/* Mobile Bottom Navigation */}
            {currentUser && (
              <BottomNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                studentsCount={students.length}
                gradesCount={grades.length}
              />
            )}
          </div>
        ) : (
          /* Full Desktop Width Dashboard */
          <div className="w-full max-w-6xl bg-white rounded-3xl shadow-sm border border-slate-200 p-6 flex flex-col relative min-h-[680px]">
            {/* Desktop Tab Selector */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
                {(
                  [
                    { id: 'dashboard', label: 'لوحة التحكم الإحصائية' },
                    { id: 'students', label: `سجل الطلاب (${students.length})` },
                    { id: 'grades', label: `رصد الدرجات (${grades.length})` },
                    { id: 'reports', label: 'التقارير والمعدلات' },
                    { id: 'expo', label: 'كود Expo / React Native' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTab === t.id
                        ? 'bg-white text-emerald-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {currentUser && students.length === 0 && (
                <button
                  onClick={handleSeedDemoData}
                  disabled={isSeeding}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                >
                  {isSeeding ? 'جاري الملء...' : '✨ ملء بيانات تجريبية سريعة'}
                </button>
              )}
            </div>

            {/* Desktop View Content */}
            {!currentUser ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/20">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900">سجل الدخول للمتابعة</h3>
                <p className="text-slate-500 text-xs mt-1 max-w-md">
                  يرجى تسجيل الدخول بحساب المعلم لحفظ واستعراض بيانات الطلاب والدرجات في قاعدة بيانات Firebase Firestore.
                </p>
                <div className="flex items-center gap-3 mt-6">
                  <button
                    onClick={() => {
                      signInDemoTeacher().catch((err) => console.warn('Demo login note:', err));
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs"
                  >
                    تجربة فورية كمعلم
                  </button>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl"
                  >
                    دخول بواسطة Google / البريد
                  </button>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && (
                  <DashboardView
                    stats={dashboardStats}
                    studentStats={studentStats}
                    onNavigate={(tab) => setActiveTab(tab)}
                    onOpenAddStudent={() => setActiveTab('students')}
                    onOpenAddGrade={() => setActiveTab('grades')}
                    onOpenAddGradeForStudent={handleOpenAddGradeForStudent}
                    teacherName={currentUser.displayName || undefined}
                  />
                )}

                {activeTab === 'students' && (
                  <StudentsView
                    students={students}
                    studentStats={studentStats}
                    onAddStudent={handleAddStudent}
                    onDeleteStudent={handleDeleteStudent}
                    onOpenAddGradeForStudent={handleOpenAddGradeForStudent}
                  />
                )}

                {activeTab === 'grades' && (
                  <GradesView
                    students={students}
                    grades={grades}
                    onAddGrade={handleAddGrade}
                    onDeleteGrade={handleDeleteGrade}
                    preselectedStudentId={preselectedStudentId}
                  />
                )}

                {activeTab === 'reports' && (
                  <ReportsView
                    studentStats={studentStats}
                    teacherName={currentUser.displayName || undefined}
                  />
                )}

                {activeTab === 'expo' && <ExpoCodeView />}
              </>
            )}
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MasarMain />
    </AuthProvider>
  );
}
