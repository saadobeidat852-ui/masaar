import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  GraduationCap,
  Award,
  CheckCircle,
  Calendar,
  User,
  School,
  FileText,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { StudentStats } from '../types';
import { getStatusBadgeColor } from '../services/masarService';

interface ParentReportModalProps {
  studentStats: StudentStats;
  teacherName?: string;
  onClose: () => void;
}

export const ParentReportModal: React.FC<ParentReportModalProps> = ({
  studentStats,
  teacherName,
  onClose,
}) => {
  const { student, grades, average, status, gradesCount } = studentStats;
  const badge = getStatusBadgeColor(status);

  // Default teacher remark to parent based on status
  const defaultNote =
    average >= 85
      ? 'أداء الطالب متميز ومثالي، نثمن حرصكم المستمر على متابعته ونتمنى له دوام التفوق والنجاح.'
      : average >= 65
      ? 'مستوى الطالب جيد ويمتلك قدرات واعدة، نرجو تكثيف المتابعة المنزلية وحل الواجبات لرفع المعدل إلى مستويات أعلى.'
      : 'يحتاج الطالب إلى خطة دعم ومتابعة دورية مشتركة في المواد الضعيفة لتحسين مستواه قبل موعد الامتحانات القادمة.';

  const [customTeacherNote, setCustomTeacherNote] = useState<string>(defaultNote);
  const [schoolName, setSchoolName] = useState<string>('مدرسة مسار النموذجية');
  const currentDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate subject grade level
  const getSubjectStatus = (grade: number, max: number) => {
    const pct = (grade / (max || 100)) * 100;
    if (pct >= 90) return 'ممتاز';
    if (pct >= 80) return 'جيد جداً';
    if (pct >= 70) return 'جيد';
    if (pct >= 60) return 'مقبول';
    if (pct >= 50) return 'ضعيف';
    return 'راسب';
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة للطباعة أو الحفظ كـ PDF');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="utf-8">
  <title>تقرير أداء الطالب - ${student.name}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Cairo', 'Tajawal', sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 20px;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 16px;
      margin-bottom: 24px;
    }
    .school-title {
      font-size: 18px;
      font-weight: 800;
      color: #065f46;
    }
    .sub-title {
      font-size: 12px;
      color: #64748b;
    }
    .report-badge {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 8px 16px;
      border-radius: 12px;
      text-align: center;
    }
    .report-badge h2 {
      font-size: 16px;
      font-weight: 900;
      color: #0f172a;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 20px;
    }
    .meta-item {
      font-size: 12px;
    }
    .meta-item label {
      display: block;
      color: #64748b;
      font-size: 11px;
      font-weight: 600;
    }
    .meta-item span {
      font-weight: 700;
      color: #0f172a;
    }
    .gpa-card {
      display: flex;
      justify-content: space-around;
      align-items: center;
      background: #ecfdf5;
      border: 1.5px solid #a7f3d0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    .gpa-num {
      font-size: 28px;
      font-weight: 900;
      color: #065f46;
    }
    .gpa-status {
      font-size: 16px;
      font-weight: 800;
      color: #047857;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 12px;
    }
    th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      padding: 10px;
      border: 1px solid #cbd5e1;
      text-align: right;
    }
    td {
      padding: 10px;
      border: 1px solid #e2e8f0;
      text-align: right;
    }
    tr:nth-child(even) {
      background: #f8fafc;
    }
    .note-box {
      background: #fffbeb;
      border: 1.5px solid #fde68a;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 30px;
    }
    .note-box h4 {
      font-size: 13px;
      font-weight: 800;
      color: #92400e;
      margin-bottom: 6px;
    }
    .note-box p {
      font-size: 12px;
      color: #78350f;
    }
    .signature-row {
      display: flex;
      justify-content: space-between;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
    }
    .sig-block {
      text-align: center;
      width: 28%;
      font-size: 12px;
    }
    .sig-line {
      margin-top: 45px;
      border-bottom: 1.5px solid #94a3b8;
    }
    .footer-stamp {
      text-align: center;
      margin-top: 30px;
      font-size: 10px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <div class="school-title">${schoolName}</div>
      <div class="sub-title">إدارة الشؤون التعليمية والتقييم • نظام مسار</div>
    </div>
    <div class="report-badge">
      <h2>كشف الأداء الأكاديمي للطلاب</h2>
      <div class="sub-title">نسخة مخصصة لولي الأمر</div>
    </div>
  </div>

  <div class="meta-grid">
    <div class="meta-item">
      <label>اسم الطالب:</label>
      <span>${student.name}</span>
    </div>
    <div class="meta-item">
      <label>الرقم الأكاديمي:</label>
      <span style="font-family: monospace;">${student.studentId}</span>
    </div>
    <div class="meta-item">
      <label>الصف / الشعبة:</label>
      <span>${student.classroom || 'العام'}</span>
    </div>
    <div class="meta-item">
      <label>تاريخ التقرير:</label>
      <span>${currentDate}</span>
    </div>
  </div>

  <div class="gpa-card">
    <div>
      <div style="font-size: 11px; color: #065f46; font-weight: 600;">المعدل التراكمي العام</div>
      <div class="gpa-num">${average}%</div>
    </div>
    <div style="width: 1px; height: 40px; background: #a7f3d0;"></div>
    <div>
      <div style="font-size: 11px; color: #065f46; font-weight: 600;">التقدير العام</div>
      <div class="gpa-status">${status}</div>
    </div>
    <div style="width: 1px; height: 40px; background: #a7f3d0;"></div>
    <div>
      <div style="font-size: 11px; color: #065f46; font-weight: 600;">عدد المواد المرصودة</div>
      <div style="font-size: 20px; font-weight: 800; color: #0f172a;">${gradesCount} مواد</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 30%;">المادة الدراسية</th>
        <th style="width: 25%;">نوع التقييم</th>
        <th style="width: 15%; text-align: center;">الدرجة المحصلة</th>
        <th style="width: 15%; text-align: center;">النسبة / التقدير</th>
        <th style="width: 10%;">ملاحظات</th>
      </tr>
    </thead>
    <tbody>
      ${
        grades.length === 0
          ? '<tr><td colspan="6" style="text-align: center; padding: 20px;">لم يتم تسجيل درجات بعد</td></tr>'
          : grades
              .map((g, idx) => {
                const max = g.maxGrade || 100;
                const pct = Math.round((g.grade / max) * 100);
                const subjStatus = getSubjectStatus(g.grade, max);
                return `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${g.subject}</strong></td>
                <td>${g.term || 'تقييم فصلي'}</td>
                <td style="text-align: center; font-weight: bold; font-family: monospace;">${g.grade} / ${max}</td>
                <td style="text-align: center;"><strong>${pct}%</strong> (${subjStatus})</td>
                <td><small style="color: #64748b;">${g.notes || '-'}</small></td>
              </tr>
            `;
              })
              .join('')
      }
    </tbody>
  </table>

  <div class="note-box">
    <h4>توجيهات وملاحظات المعلم المشرف لولي الأمر:</h4>
    <p>${customTeacherNote || defaultNote}</p>
  </div>

  <div class="signature-row">
    <div class="sig-block">
      <div>معلم المادة / مربي الفصل</div>
      <div style="font-weight: bold; margin-top: 4px;">${teacherName || 'الأستاذ المشرف'}</div>
      <div class="sig-line"></div>
    </div>

    <div class="sig-block">
      <div>إدارة المدرسة والختم</div>
      <div style="font-weight: bold; margin-top: 4px;">مدير المدرسة</div>
      <div class="sig-line"></div>
    </div>

    <div class="sig-block">
      <div>ولي أمر الطالب</div>
      <div style="font-weight: bold; margin-top: 4px;">توقيع ولي الأمر بالعلم</div>
      <div class="sig-line"></div>
    </div>
  </div>

  <div class="footer-stamp">
    تم استخراج هذا التقرير إلكترونياً عبر تطبيق مسار للمعلمين • تاريخ الطباعة: ${new Date().toLocaleString('ar-EG')}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleDownloadHTML = () => {
    const htmlContent = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>تقرير ولي الأمر - ${student.name}</title></head><body><h1>كشف درجات الطالب: ${student.name}</h1><p>المعدل: ${average}% - ${status}</p></body></html>`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير_ولي_الأمر_${student.name.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>تقرير أداء الطالب لولي الأمر (PDF)</span>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  جاهز للطباعة والحفظ
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                وثيقة رسمية منسقة ببيانات الطالب ودرجاته وتوصيات المعلم
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ كـ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Report Preview */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {/* Settings / Customization bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                <School className="w-3.5 h-3.5 text-emerald-600" />
                <span>اسم المدرسة / المؤسسة التعليمية:</span>
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>اسم المعلم المشرف:</span>
              </label>
              <input
                type="text"
                value={teacherName || 'أستاذ المادة'}
                disabled
                className="w-full px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium"
              />
            </div>
          </div>

          {/* Report Paper Preview Container (Mimics printed sheet) */}
          <div className="bg-white rounded-2xl border border-slate-300 p-6 sm:p-8 shadow-sm text-slate-800 space-y-6">
            {/* Header of paper */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-slate-900 gap-3">
              <div>
                <h2 className="text-lg font-black text-emerald-800">{schoolName}</h2>
                <div className="text-xs text-slate-500">نظام مسار للتقييم والرصد الأكاديمي</div>
              </div>
              <div className="sm:text-left bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-900">تقرير مستوى الطالب الفردي</div>
                <div className="text-[11px] text-slate-500">موجّه لولي الأمر • {currentDate}</div>
              </div>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">اسم الطالب:</span>
                <span className="font-bold text-slate-900 text-sm">{student.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">الرقم الأكاديمي:</span>
                <span className="font-mono font-bold text-slate-800">{student.studentId}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">الصف / الشعبة:</span>
                <span className="font-bold text-slate-800">{student.classroom || 'عام'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">المواد المقيّمة:</span>
                <span className="font-bold text-slate-800">{gradesCount} مواد</span>
              </div>
            </div>

            {/* GPA Overview */}
            <div className="flex items-center justify-around bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 text-center">
              <div>
                <div className="text-xs text-emerald-800 font-semibold">المعدل العام التراكمي</div>
                <div className="text-3xl font-black text-emerald-700 mt-0.5">{average}%</div>
              </div>
              <div className="w-px h-10 bg-emerald-200" />
              <div>
                <div className="text-xs text-emerald-800 font-semibold">التقدير الأكاديمي العام</div>
                <div className="mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.bg}`}>
                    {status}
                  </span>
                </div>
              </div>
            </div>

            {/* Grades Table */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">تفاصيل نتائج المواد والاختبارات</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-right divide-y divide-slate-200">
                  <thead className="bg-slate-100 font-bold text-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">المادة</th>
                      <th className="py-2.5 px-3">التقييم</th>
                      <th className="py-2.5 px-3 text-center">الدرجة المحصلة</th>
                      <th className="py-2.5 px-3 text-center">النسبة</th>
                      <th className="py-2.5 px-3">ملاحظة المعلم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {grades.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          لا توجد درجات مرصودة لهذا الطالب حتى الآن
                        </td>
                      </tr>
                    ) : (
                      grades.map((g) => {
                        const max = g.maxGrade || 100;
                        const pct = Math.round((g.grade / max) * 100);
                        return (
                          <tr key={g.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-bold text-slate-900">{g.subject}</td>
                            <td className="py-2.5 px-3 text-slate-500">{g.term}</td>
                            <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                              {g.grade} / {max}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  pct >= 80
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : pct >= 60
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {pct}%
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                              {g.notes || '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Editable Teacher's Note to Parent */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1.5">
              <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>رسالة وتوجيهات المعلم لولي الأمر (يمكنك تعديلها قبل الطباعة):</span>
              </label>
              <textarea
                value={customTeacherNote}
                onChange={(e) => setCustomTeacherNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 bg-white border border-amber-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500 leading-relaxed text-right"
                placeholder="أدخل ملاحظاتك لولي الأمر حول مستوى الطالب وسلوكه..."
              />
            </div>

            {/* Signature row preview */}
            <div className="pt-4 border-t border-dashed border-slate-300 flex items-center justify-between text-center text-xs text-slate-500">
              <div className="space-y-6">
                <div>معلم المادة المشرف</div>
                <div className="border-b border-slate-300 w-32 pb-1 font-bold text-slate-800">
                  {teacherName || 'الأستاذ المشرف'}
                </div>
              </div>
              <div className="space-y-6">
                <div>إدارة المدرسة والاعتماد</div>
                <div className="border-b border-slate-300 w-32 pb-1 font-bold text-slate-800">
                  ختم الإدارة
                </div>
              </div>
              <div className="space-y-6">
                <div>ولي أمر الطالب</div>
                <div className="border-b border-slate-300 w-32 pb-1 text-[11px] text-slate-400">
                  توقيع ولي الأمر بالعلم
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>
              نصيحة: عند النقر على "طباعة"، يمكنك اختيار <strong>"حفظ بتنسيق PDF"</strong> من شاشة
              الطباعة لحفظ الملف على جهازك وإرساله عبر الواتساب أو البريد.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف ولي الأمر</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
