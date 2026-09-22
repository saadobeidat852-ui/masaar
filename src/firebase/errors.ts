import { auth } from './config';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error) return 'حدث خطأ غير متوقع';
  const errStr = error instanceof Error ? error.message : String(error);
  if (
    errStr.includes('auth/admin-restricted-operation') ||
    errStr.includes('auth/operation-not-allowed')
  ) {
    return 'طريقة تسجيل الدخول هذه مقيدة في إعدادات Firebase الحالية. يمكنك المتابعة بنقرة واحدة عبر "تجربة فورية كمعلم" أو استخدام تسجيل الدخول بواسطة Google.';
  }
  if (
    errStr.includes('auth/invalid-credential') ||
    errStr.includes('auth/wrong-password') ||
    errStr.includes('auth/user-not-found')
  ) {
    return 'بيانات الدخول غير صحيحة، يرجى التحقق من البريد وكلمة المرور.';
  }
  if (errStr.includes('auth/email-already-in-use')) {
    return 'هذا البريد الإلكتروني مسجل بالفعل، يرجى تسجيل الدخول.';
  }
  if (errStr.includes('auth/weak-password')) {
    return 'كلمة المرور ضعيفة جداً، يرجى إدخال 6 أحرف أو أرقام على الأقل.';
  }
  if (errStr.includes('auth/popup-closed-by-user')) {
    return 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.';
  }
  if (errStr.includes('auth/popup-blocked')) {
    return 'تم حظر النافذة المنبثقة من قِبل المتصفح، يرجى السماح بالنوافذ المنبثقة.';
  }
  return errStr;
}
