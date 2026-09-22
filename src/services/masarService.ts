import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { Student, Grade, GradeStatus, StudentStats, DashboardStats } from '../types';

export function calculateGradeStatus(average: number): GradeStatus {
  if (average >= 90) return 'ممتاز';
  if (average >= 80) return 'جيد جداً';
  if (average >= 70) return 'جيد';
  if (average >= 60) return 'مقبول';
  if (average >= 50) return 'ضعيف';
  return 'راسب';
}

export function getStatusBadgeColor(status: GradeStatus) {
  switch (status) {
    case 'ممتاز':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badge: 'bg-emerald-500 text-white',
        dot: 'bg-emerald-500',
      };
    case 'جيد جداً':
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        badge: 'bg-blue-500 text-white',
        dot: 'bg-blue-500',
      };
    case 'جيد':
      return {
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        badge: 'bg-teal-500 text-white',
        dot: 'bg-teal-500',
      };
    case 'مقبول':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        badge: 'bg-amber-500 text-white',
        dot: 'bg-amber-500',
      };
    case 'ضعيف':
      return {
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        badge: 'bg-orange-500 text-white',
        dot: 'bg-orange-500',
      };
    case 'راسب':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        badge: 'bg-rose-500 text-white',
        dot: 'bg-rose-500',
      };
  }
}

// ---------------- Demo Storage Support ----------------
const DEMO_STUDENTS_KEY = 'masar_demo_students_store';
const DEMO_GRADES_KEY = 'masar_demo_grades_store';
const DEMO_CHANGE_EVENT = 'masar_demo_data_updated';

function getDemoStudentsFromStorage(): Student[] {
  try {
    const raw = localStorage.getItem(DEMO_STUDENTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading demo students:', e);
  }
  const defaults: Student[] = [
    {
      id: 'demo-std-101',
      name: 'محمد أحمد المنصوري',
      studentId: 'STD-101',
      teacherId: 'demo-teacher-local',
      classroom: 'الصف العاشر - أ',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'demo-std-102',
      name: 'سارة خالد العتيبي',
      studentId: 'STD-102',
      teacherId: 'demo-teacher-local',
      classroom: 'الصف العاشر - أ',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'demo-std-103',
      name: 'عمر ياسين الكردي',
      studentId: 'STD-103',
      teacherId: 'demo-teacher-local',
      classroom: 'الصف العاشر - ب',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'demo-std-104',
      name: 'فاطمة عبد الله النجار',
      studentId: 'STD-104',
      teacherId: 'demo-teacher-local',
      classroom: 'الصف العاشر - ب',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'demo-std-105',
      name: 'زيد حسام الشريف',
      studentId: 'STD-105',
      teacherId: 'demo-teacher-local',
      classroom: 'الصف العاشر - أ',
      createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    },
  ];
  saveDemoStudentsToStorage(defaults);
  return defaults;
}

function saveDemoStudentsToStorage(students: Student[]) {
  try {
    localStorage.setItem(DEMO_STUDENTS_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Failed saving demo students:', e);
  }
}

function getDemoGradesFromStorage(): Grade[] {
  try {
    const raw = localStorage.getItem(DEMO_GRADES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading demo grades:', e);
  }
  const defaults: Grade[] = [
    {
      id: 'demo-grd-1',
      studentId: 'demo-std-101',
      teacherId: 'demo-teacher-local',
      subject: 'الرياضيات',
      grade: 95,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'أداء متميز وتفوق في الحساب الذهني',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-2',
      studentId: 'demo-std-101',
      teacherId: 'demo-teacher-local',
      subject: 'العلوم',
      grade: 92,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'مشاركة ممتازة في التجارب العملية',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-3',
      studentId: 'demo-std-101',
      teacherId: 'demo-teacher-local',
      subject: 'اللغة العربية',
      grade: 96,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'إتقان لقواعد النحو والإملاء',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-4',
      studentId: 'demo-std-102',
      teacherId: 'demo-teacher-local',
      subject: 'الرياضيات',
      grade: 88,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'مستوى متقدم واجتهاد ملحوظ',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-5',
      studentId: 'demo-std-102',
      teacherId: 'demo-teacher-local',
      subject: 'العلوم',
      grade: 85,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'جيد جداً',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-6',
      studentId: 'demo-std-102',
      teacherId: 'demo-teacher-local',
      subject: 'اللغة الإنجليزية',
      grade: 90,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'طلاقة في التحدث والتعبير',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-7',
      studentId: 'demo-std-103',
      teacherId: 'demo-teacher-local',
      subject: 'الرياضيات',
      grade: 76,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'يحتاج تدريباً أكثر على حل المسائل',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-8',
      studentId: 'demo-std-103',
      teacherId: 'demo-teacher-local',
      subject: 'العلوم',
      grade: 78,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'أداء جيد',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-9',
      studentId: 'demo-std-103',
      teacherId: 'demo-teacher-local',
      subject: 'اللغة العربية',
      grade: 74,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'تركيز على مهارات التعبير الإنشائي',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-10',
      studentId: 'demo-std-104',
      teacherId: 'demo-teacher-local',
      subject: 'الرياضيات',
      grade: 64,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'مقبول، ينصح بمراجعة المفاهيم الجبرية',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-11',
      studentId: 'demo-std-104',
      teacherId: 'demo-teacher-local',
      subject: 'اللغة العربية',
      grade: 68,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'تحسن ملحوظ في القراءة الحرة',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-12',
      studentId: 'demo-std-105',
      teacherId: 'demo-teacher-local',
      subject: 'الرياضيات',
      grade: 82,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'اجتهاد وحضور ومشاركة فعالة',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'demo-grd-13',
      studentId: 'demo-std-105',
      teacherId: 'demo-teacher-local',
      subject: 'العلوم',
      grade: 80,
      maxGrade: 100,
      term: 'اختبار منتصف الفصل',
      notes: 'جيد جداً',
      createdAt: new Date().toISOString(),
    },
  ];
  saveDemoGradesToStorage(defaults);
  return defaults;
}

function saveDemoGradesToStorage(grades: Grade[]) {
  try {
    localStorage.setItem(DEMO_GRADES_KEY, JSON.stringify(grades));
  } catch (e) {
    console.error('Failed saving demo grades:', e);
  }
}

function notifyDemoChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(DEMO_CHANGE_EVENT));
  }
}

// ---------------- Students API ----------------

// Subscribe to students for a teacher
export function subscribeToStudents(
  teacherId: string,
  onData: (students: Student[]) => void,
  onError?: (error: Error) => void
) {
  if (teacherId === 'demo-teacher-local') {
    const emit = () => {
      const data = getDemoStudentsFromStorage();
      onData(data);
    };
    emit();
    const handler = () => emit();
    window.addEventListener(DEMO_CHANGE_EVENT, handler);
    return () => window.removeEventListener(DEMO_CHANGE_EVENT, handler);
  }

  const colPath = 'students';
  const q = query(collection(db, colPath), where('teacherId', '==', teacherId));

  return onSnapshot(
    q,
    (snapshot) => {
      const students: Student[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name || '',
          studentId: data.studentId || '',
          teacherId: data.teacherId || '',
          classroom: data.classroom || '',
          createdAt: data.createdAt || new Date().toISOString(),
        };
      });
      // Sort by creation date descending
      students.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(students);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, colPath);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

// Subscribe to grades for a teacher
export function subscribeToGrades(
  teacherId: string,
  onData: (grades: Grade[]) => void,
  onError?: (error: Error) => void
) {
  if (teacherId === 'demo-teacher-local') {
    const emit = () => {
      const data = getDemoGradesFromStorage();
      onData(data);
    };
    emit();
    const handler = () => emit();
    window.addEventListener(DEMO_CHANGE_EVENT, handler);
    return () => window.removeEventListener(DEMO_CHANGE_EVENT, handler);
  }

  const colPath = 'grades';
  const q = query(collection(db, colPath), where('teacherId', '==', teacherId));

  return onSnapshot(
    q,
    (snapshot) => {
      const grades: Grade[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          studentId: data.studentId || '',
          teacherId: data.teacherId || '',
          subject: data.subject || '',
          grade: Number(data.grade ?? 0),
          maxGrade: Number(data.maxGrade ?? 100),
          term: data.term || 'الفصل الأول',
          notes: data.notes || '',
          createdAt: data.createdAt || new Date().toISOString(),
        };
      });
      grades.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onData(grades);
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.LIST, colPath);
      } catch (wrapped) {
        if (onError) onError(wrapped as Error);
      }
    }
  );
}

// Add student
export async function addStudent(
  teacherId: string,
  studentData: { name: string; studentId: string; classroom?: string }
): Promise<string> {
  if (teacherId === 'demo-teacher-local') {
    const list = getDemoStudentsFromStorage();
    const newId = `demo-std-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newStudent: Student = {
      id: newId,
      name: studentData.name.trim(),
      studentId: studentData.studentId.trim(),
      teacherId,
      classroom: studentData.classroom ? studentData.classroom.trim() : '',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newStudent);
    saveDemoStudentsToStorage(list);
    notifyDemoChange();
    return newId;
  }

  const path = 'students';
  const newDocRef = doc(collection(db, path));
  const payload = {
    name: studentData.name.trim(),
    studentId: studentData.studentId.trim(),
    teacherId,
    classroom: studentData.classroom ? studentData.classroom.trim() : '',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(newDocRef, payload);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${newDocRef.id}`);
  }
}

// Delete student and all associated grades
export async function deleteStudent(studentDocId: string, teacherId: string): Promise<void> {
  if (teacherId === 'demo-teacher-local' || studentDocId.startsWith('demo-std-')) {
    const students = getDemoStudentsFromStorage().filter((s) => s.id !== studentDocId);
    saveDemoStudentsToStorage(students);
    const grades = getDemoGradesFromStorage().filter((g) => g.studentId !== studentDocId);
    saveDemoGradesToStorage(grades);
    notifyDemoChange();
    return;
  }

  const path = `students/${studentDocId}`;
  try {
    const gradesCol = collection(db, 'grades');
    const gradesQuery = query(
      gradesCol,
      where('teacherId', '==', teacherId),
      where('studentId', '==', studentDocId)
    );
    const gradesSnapshot = await getDocs(gradesQuery);

    const batch = writeBatch(db);
    gradesSnapshot.forEach((docItem) => {
      batch.delete(docItem.ref);
    });

    batch.delete(doc(db, 'students', studentDocId));
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Add or update grade
export async function addGrade(
  teacherId: string,
  gradeData: {
    studentId: string;
    subject: string;
    grade: number;
    maxGrade?: number;
    term?: string;
    notes?: string;
  }
): Promise<string> {
  if (teacherId === 'demo-teacher-local') {
    const list = getDemoGradesFromStorage();
    const newId = `demo-grd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newGrade: Grade = {
      id: newId,
      studentId: gradeData.studentId,
      teacherId,
      subject: gradeData.subject.trim(),
      grade: Number(gradeData.grade),
      maxGrade: Number(gradeData.maxGrade || 100),
      term: gradeData.term ? gradeData.term.trim() : 'اختبار نصفي',
      notes: gradeData.notes ? gradeData.notes.trim() : '',
      createdAt: new Date().toISOString(),
    };
    list.unshift(newGrade);
    saveDemoGradesToStorage(list);
    notifyDemoChange();
    return newId;
  }

  const path = 'grades';
  const newDocRef = doc(collection(db, path));
  const payload = {
    studentId: gradeData.studentId,
    teacherId,
    subject: gradeData.subject.trim(),
    grade: Number(gradeData.grade),
    maxGrade: Number(gradeData.maxGrade || 100),
    term: gradeData.term ? gradeData.term.trim() : 'اختبار نصفي',
    notes: gradeData.notes ? gradeData.notes.trim() : '',
    createdAt: new Date().toISOString(),
  };

  try {
    await setDoc(newDocRef, payload);
    return newDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${path}/${newDocRef.id}`);
  }
}

// Delete a grade record
export async function deleteGrade(gradeDocId: string): Promise<void> {
  if (gradeDocId.startsWith('demo-grd-')) {
    const list = getDemoGradesFromStorage().filter((g) => g.id !== gradeDocId);
    saveDemoGradesToStorage(list);
    notifyDemoChange();
    return;
  }

  const path = `grades/${gradeDocId}`;
  try {
    await deleteDoc(doc(db, 'grades', gradeDocId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Compute student statistics and summary metrics
export function computeStudentStats(students: Student[], grades: Grade[]): StudentStats[] {
  const gradesByStudent: Record<string, Grade[]> = {};
  for (const grade of grades) {
    if (!gradesByStudent[grade.studentId]) {
      gradesByStudent[grade.studentId] = [];
    }
    gradesByStudent[grade.studentId].push(grade);
  }

  return students.map((student) => {
    const studentGrades = gradesByStudent[student.id] || [];
    const count = studentGrades.length;

    let average = 0;
    if (count > 0) {
      const sumPercentage = studentGrades.reduce((acc, curr) => {
        const max = curr.maxGrade || 100;
        const pct = (curr.grade / max) * 100;
        return acc + pct;
      }, 0);
      average = Math.round((sumPercentage / count) * 10) / 10;
    }

    const status = calculateGradeStatus(average);

    return {
      student,
      gradesCount: count,
      average,
      status,
      grades: studentGrades,
    };
  });
}

// Compute dashboard overall KPIs
export function computeDashboardStats(
  studentStats: StudentStats[],
  totalGradesCount: number
): DashboardStats {
  const totalStudents = studentStats.length;

  let overallAverage = 0;
  let passCount = 0;

  const statusCounts: Record<GradeStatus, number> = {
    ممتاز: 0,
    'جيد جداً': 0,
    جيد: 0,
    مقبول: 0,
    ضعيف: 0,
    راسب: 0,
  };

  const studentsWithGrades = studentStats.filter((s) => s.gradesCount > 0);

  if (studentsWithGrades.length > 0) {
    const sum = studentsWithGrades.reduce((acc, curr) => acc + curr.average, 0);
    overallAverage = Math.round((sum / studentsWithGrades.length) * 10) / 10;

    for (const s of studentStats) {
      statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
      if (s.average >= 60 && s.gradesCount > 0) {
        passCount++;
      }
    }
  }

  const passRate =
    studentsWithGrades.length > 0
      ? Math.round((passCount / studentsWithGrades.length) * 100)
      : 0;

  return {
    totalStudents,
    totalGrades: totalGradesCount,
    overallAverage,
    passRate,
    statusCounts,
  };
}
