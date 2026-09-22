export interface Student {
  id: string;
  name: string;
  studentId: string;
  teacherId: string;
  classroom?: string;
  createdAt: string;
}

export interface Grade {
  id: string;
  studentId: string;
  teacherId: string;
  subject: string;
  grade: number;
  maxGrade: number;
  term?: string;
  notes?: string;
  createdAt: string;
}

export type GradeStatus = 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'ضعيف' | 'راسب';

export interface StudentStats {
  student: Student;
  gradesCount: number;
  average: number;
  status: GradeStatus;
  grades: Grade[];
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  isAnonymous?: boolean;
}

export interface DashboardStats {
  totalStudents: number;
  totalGrades: number;
  overallAverage: number;
  passRate: number;
  statusCounts: Record<GradeStatus, number>;
}
