import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  FileCode,
  Terminal,
  Smartphone,
  ExternalLink,
  Download,
  Sparkles,
} from 'lucide-react';
import { getExpoProjectFiles, ExpoFile } from '../data/expoTemplates';

export const ExpoCodeView: React.FC = () => {
  const files = getExpoProjectFiles();
  const [selectedFile, setSelectedFile] = useState<ExpoFile>(files[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadAll = () => {
    files.forEach((file) => {
      const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>مشروع React Native + Expo المكتمل</span>
            </div>
            <h2 className="text-xl font-black">كود تطبيق الموبايل (React Native + Expo)</h2>
            <p className="text-slate-300 text-xs mt-1 max-w-xl">
              تم تجهيز كامل ملفات الكود لتطبيق "مسار" ليعمل على نظامي Android وiOS مع React Navigation وقاعدة بيانات Firebase الحقيقية بواجهة عربية (RTL).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل الملفات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Setup Instructions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">خطوات تشغيل التطبيق في Expo Go خلال دقيقة:</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">1. إنشاء المشروع الجديد:</div>
            <code className="block bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[11px] ltr text-left">
              npx create-expo-app masar-mobile
            </code>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">2. تثبيت الحزم المطلوبة:</div>
            <code className="block bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[11px] ltr text-left truncate">
              npx expo install @react-navigation/native @react-navigation/bottom-tabs firebase @expo/vector-icons
            </code>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="font-bold text-slate-900 mb-1">3. تشغيل التطبيق:</div>
            <code className="block bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[11px] ltr text-left">
              npx expo start
            </code>
          </div>
        </div>
      </div>

      {/* Code Browser */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* File Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto">
          {files.map((file) => {
            const isSelected = selectedFile.name === file.name;
            return (
              <button
                key={file.name}
                onClick={() => setSelectedFile(file)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono">{file.name}</span>
              </button>
            );
          })}
        </div>

        {/* Current File Meta */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900">
                {selectedFile.path}
              </span>
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                {selectedFile.language}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{selectedFile.description}</p>
          </div>

          <button
            onClick={handleCopy}
            className={`self-start sm:self-auto flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-200'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'تم نسخ الكود!' : 'نسخ محتوى الملف'}</span>
          </button>
        </div>

        {/* Code Content */}
        <div className="relative">
          <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed text-left ltr selection:bg-emerald-500 selection:text-white">
            <code>{selectedFile.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
