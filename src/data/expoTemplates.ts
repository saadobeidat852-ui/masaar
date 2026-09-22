import firebaseConfig from '../../firebase-applet-config.json';

export interface ExpoFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const getExpoProjectFiles = (): ExpoFile[] => {
  return [
    {
      name: 'App.js',
      path: 'App.js',
      language: 'javascript',
      description: 'نقطة دخول التطبيق الرئيسية مع تهيئة التنقل React Navigation وتهيئة الاتجاه العربي RTL',
      content: `import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, I18nManager, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth } from './firebase';

import DashboardScreen from './screens/DashboardScreen';
import StudentsScreen from './screens/StudentsScreen';
import GradesScreen from './screens/GradesScreen';
import ReportsScreen from './screens/ReportsScreen';

// تفعيل الواجهة العربية من اليمين لليسار (RTL)
try {
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
} catch (e) {
  console.log('RTL Error:', e);
}

const Tab = createBottomTabNavigator();

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#059669" />
        <Text style={styles.loadingText}>جاري تحميل تطبيق مسار...</Text>
      </View>
    );
  }

  // إذا لم يكن المعلم مسجلاً الدخول، عرض شاشة الدخول
  if (!user) {
    return <AuthScreen onLoginSuccess={() => {}} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: '#ffffff', elevation: 2, shadowOpacity: 0.1 },
            headerTitleStyle: { fontWeight: '700', color: '#0f172a', textAlign: 'right' },
            tabBarActiveTintColor: '#059669',
            tabBarInactiveTintColor: '#64748b',
            tabBarStyle: {
              height: 64,
              paddingBottom: 8,
              paddingTop: 8,
              backgroundColor: '#ffffff',
              borderTopColor: '#e2e8f0',
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '600',
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              if (route.name === 'الرئيسية') {
                iconName = focused ? 'speedometer' : 'speedometer-outline';
              } else if (route.name === 'الطلاب') {
                iconName = focused ? 'people' : 'people-outline';
              } else if (route.name === 'رصد الدرجات') {
                iconName = focused ? 'create' : 'create-outline';
              } else if (route.name === 'التقارير') {
                iconName = focused ? 'analytics' : 'analytics-outline';
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen 
            name="الرئيسية" 
            component={DashboardScreen} 
            options={{ title: 'لوحة تحكم مسار' }}
          />
          <Tab.Screen 
            name="الطلاب" 
            component={StudentsScreen} 
            options={{ title: 'إدارة الطلاب' }}
          />
          <Tab.Screen 
            name="رصد الدرجات" 
            component={GradesScreen} 
            options={{ title: 'رصد درجات المواد' }}
          />
          <Tab.Screen 
            name="التقارير" 
            component={ReportsScreen} 
            options={{ title: 'تقارير ومعدلات الطلاب' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}

// شاشة تسجيل دخول المعلم المبسطة
function AuthScreen() {
  const [email, setEmail] = useState('teacher@masar.edu');
  const [password, setPassword] = useState('123456');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    try {
      setErrorMsg('');
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setErrorMsg('خطأ في البريد أو كلمة المرور');
    }
  };

  return (
    <View style={styles.authContainer}>
      <Text style={styles.appTitle}>تطبيق مَسار</Text>
      <Text style={styles.appSubtitle}>نظام إدارة الطلاب ورصد الدرجات للمعلمين</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginBtnText}>تسجيل دخول المعلم</Text>
      </TouchableOpacity>
      {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#475569' },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#f8fafc' },
  appTitle: { fontSize: 32, fontWeight: '800', color: '#059669', marginBottom: 8 },
  appSubtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 32 },
  loginBtn: { backgroundColor: '#059669', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 12 },
  loginBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  errorText: { color: '#e11d48', marginTop: 14, fontSize: 14 },
});`,
    },
    {
      name: 'firebase.js',
      path: 'firebase.js',
      language: 'javascript',
      description: 'تهيئة Firebase SDK والاتصال بـ Firestore وقواعد البيانات',
      content: `import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "${firebaseConfig.projectId}",
  appId: "${firebaseConfig.appId}",
  apiKey: "${firebaseConfig.apiKey}",
  authDomain: "${firebaseConfig.authDomain}",
  storageBucket: "${firebaseConfig.storageBucket}",
  messagingSenderId: "${firebaseConfig.messagingSenderId}",
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app, "${firebaseConfig.firestoreDatabaseId}");`,
    },
    {
      name: 'DashboardScreen.js',
      path: 'screens/DashboardScreen.js',
      language: 'javascript',
      description: 'لوحة التحكم السريعة مع إحصائيات الطلاب والدرجات والنسب المئوية',
      content: `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;
    const teacherId = auth.currentUser.uid;

    const qStudents = query(collection(db, 'students'), where('teacherId', '==', teacherId));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qGrades = query(collection(db, 'grades'), where('teacherId', '==', teacherId));
    const unsubGrades = onSnapshot(qGrades, (snap) => {
      setGrades(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubStudents();
      unsubGrades();
    };
  }, []);

  const totalStudents = students.length;
  const totalGrades = grades.length;
  
  // حساب المتوسط العام
  let avgPercentage = 0;
  if (grades.length > 0) {
    const sum = grades.reduce((acc, g) => acc + ((Number(g.grade) / Number(g.maxGrade || 100)) * 100), 0);
    avgPercentage = Math.round((sum / grades.length) * 10) / 10;
  }

  // الطلاب الحاصلين على درجات أقل من 60 لتنبيه المعلم للتدخل
  const lowScoringStudents = students.map(student => {
    const studentGrades = grades.filter(g => g.studentId === student.id);
    const lowGrades = studentGrades.filter(g => ((Number(g.grade) / Number(g.maxGrade || 100)) * 100) < 60);
    return { ...student, lowGrades };
  }).filter(s => s.lowGrades.length > 0);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.welcomeBanner}>
        <Text style={styles.welcomeTitle}>مرحباً بك في مسار 👋</Text>
        <Text style={styles.welcomeSubtitle}>نظرة سريعة على أداء طلابك ودرجاتهم</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderTopColor: '#059669' }]}>
          <Ionicons name="people" size={24} color="#059669" />
          <Text style={styles.statNumber}>{totalStudents}</Text>
          <Text style={styles.statLabel}>إجمالي الطلاب</Text>
        </View>

        <View style={[styles.statCard, { borderTopColor: '#2563eb' }]}>
          <Ionicons name="documents" size={24} color="#2563eb" />
          <Text style={styles.statNumber}>{totalGrades}</Text>
          <Text style={styles.statLabel}>الدرجات المسجلة</Text>
        </View>

        <View style={[styles.statCard, { borderTopColor: '#d97706' }]}>
          <Ionicons name="trending-up" size={24} color="#d97706" />
          <Text style={styles.statNumber}>{avgPercentage}%</Text>
          <Text style={styles.statLabel}>المعدل العام</Text>
        </View>
      </View>

      {/* بطاقة تنبيه المعلم للتدخل: درجات أقل من 60 */}
      <View style={styles.alertCard}>
        <View style={styles.alertHeader}>
          <Ionicons name="warning" size={22} color="#e11d48" />
          <Text style={styles.alertTitle}>تنبيه التدخل الأكاديمي (أقل من 60%)</Text>
        </View>

        {lowScoringStudents.length === 0 ? (
          <Text style={styles.alertEmpty}>ممتاز! لا يوجد أي طالب حصل على درجة أقل من 60%</Text>
        ) : (
          <View style={styles.alertList}>
            {lowScoringStudents.map((st) => (
              <View key={st.id} style={styles.alertItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.alertStudentName}>{st.name}</Text>
                  <Text style={styles.alertStudentCode}>{st.studentId} {st.classroom ? '• ' + st.classroom : ''}</Text>
                  <View style={styles.lowSubjectsRow}>
                    {st.lowGrades.map(g => (
                      <Text key={g.id} style={styles.lowGradeBadge}>
                        {g.subject}: {g.grade}/{g.maxGrade || 100}
                      </Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  welcomeBanner: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20, marginBottom: 16 },
  welcomeTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', textAlign: 'right' },
  welcomeSubtitle: { fontSize: 14, color: '#64748b', textAlign: 'right', marginTop: 4 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    width: '31%',
    alignItems: 'center',
    borderTopWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
  },
  statNumber: { fontSize: 22, fontWeight: '800', color: '#0f172a', marginTop: 8 },
  statLabel: { fontSize: 11, color: '#64748b', textAlign: 'center', marginTop: 4 },
  alertCard: {
    backgroundColor: '#fff1f2',
    borderWidth: 1.5,
    borderColor: '#fecdd3',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  alertHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 10 },
  alertTitle: { fontSize: 15, fontWeight: 'bold', color: '#9f1239' },
  alertEmpty: { fontSize: 12, color: '#059669', textAlign: 'right', marginTop: 4 },
  alertList: { marginTop: 4 },
  alertItem: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  alertStudentName: { fontSize: 14, fontWeight: 'bold', color: '#0f172a', textAlign: 'right' },
  alertStudentCode: { fontSize: 11, color: '#64748b', textAlign: 'right', marginTop: 2 },
  lowSubjectsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  lowGradeBadge: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
`,
    },
    {
      name: 'StudentsScreen.js',
      path: 'screens/StudentsScreen.js',
      language: 'javascript',
      description: 'شاشة إدارة الطلاب: الإضافة، الحذف، والبحث الفوري',
      content: `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, Alert } from 'react-native';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

export default function StudentsScreen() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [classroom, setClassroom] = useState('');

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, 'students'), where('teacherId', '==', auth.currentUser.uid));
    const unsub = onSnapshot(q, (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const handleAddStudent = async () => {
    if (!name.trim() || !studentId.trim()) {
      Alert.alert('تنبيه', 'يرجى إدخال اسم الطالب ورقمه الأكاديمي');
      return;
    }
    try {
      await addDoc(collection(db, 'students'), {
        name: name.trim(),
        studentId: studentId.trim(),
        classroom: classroom.trim() || 'الصف العام',
        teacherId: auth.currentUser.uid,
        createdAt: new Date().toISOString(),
      });
      setName('');
      setStudentId('');
      setClassroom('');
      setModalVisible(false);
    } catch (err) {
      Alert.alert('خطأ', 'تعذر إضافة الطالب');
    }
  };

  const handleDelete = (id, studentName) => {
    Alert.alert(
      'تأكيد الحذف',
      \`هل أنت متأكد من حذف الطالب "\${studentName}"؟\`,
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: async () => await deleteDoc(doc(db, 'students', id)) },
      ]
    );
  };

  const filtered = students.filter(s => 
    s.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.studentId?.includes(search)
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="بحث باسم الطالب أو رقمه..."
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.studentCard}>
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>{item.name}</Text>
              <Text style={styles.studentSub}>رقم القيد: {item.studentId} • {item.classroom}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color="#e11d48" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* نافذة إضافة طالب */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>إضافة طالب جديد</Text>
            <TextInput style={styles.input} placeholder="اسم الطالب الثلاثي" value={name} onChangeText={setName} textAlign="right" />
            <TextInput style={styles.input} placeholder="الرقم الأكاديمي (مثال: STD-101)" value={studentId} onChangeText={setStudentId} textAlign="right" />
            <TextInput style={styles.input} placeholder="الصف / الشعبة" value={classroom} onChangeText={setClassroom} textAlign="right" />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAddStudent}>
                <Text style={styles.saveBtnText}>حفظ الطالب</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>إلغاء</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  headerRow: { flexDirection: 'row-reverse', marginBottom: 16, alignItems: 'center' },
  searchInput: { flex: 1, backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: '#e2e8f0', marginLeft: 10 },
  addBtn: { backgroundColor: '#059669', width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  studentCard: { backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  studentInfo: { alignItems: 'flex-end' },
  studentName: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  studentSub: { fontSize: 12, color: '#64748b', marginTop: 4 },
  deleteBtn: { padding: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#ffffff', borderRadius: 16, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a', textAlign: 'right', marginBottom: 16 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12, marginBottom: 12 },
  modalButtons: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 10 },
  saveBtn: { backgroundColor: '#059669', padding: 12, borderRadius: 10, flex: 1, marginLeft: 8, alignItems: 'center' },
  saveBtnText: { color: '#ffffff', fontWeight: '700' },
  cancelBtn: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 10, width: 80, alignItems: 'center' },
  cancelBtnText: { color: '#64748b', fontWeight: '600' },
});`,
    },
    {
      name: 'GradesScreen.js',
      path: 'screens/GradesScreen.js',
      language: 'javascript',
      description: 'شاشة رصد وإدخال الدرجات لكل طالب ولكل مادة دراسية',
      content: `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Ionicons } from '@expo/vector-icons';

const SUBJECTS = ['الرياضيات', 'اللغة العربية', 'العلوم', 'اللغة الإنجليزية', 'التربية الإسلامية', 'التاريخ', 'الحاسوب'];

export default function GradesScreen() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [gradeVal, setGradeVal] = useState('');
  const [maxGradeVal, setMaxGradeVal] = useState('100');

  useEffect(() => {
    if (!auth.currentUser) return;
    const teacherId = auth.currentUser.uid;

    const qStudents = query(collection(db, 'students'), where('teacherId', '==', teacherId));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(list);
      if (list.length > 0 && !selectedStudentId) {
        setSelectedStudentId(list[0].id);
      }
    });

    const qGrades = query(collection(db, 'grades'), where('teacherId', '==', teacherId));
    const unsubGrades = onSnapshot(qGrades, (snap) => {
      setGrades(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubStudents();
      unsubGrades();
    };
  }, []);

  const handleSaveGrade = async () => {
    if (!selectedStudentId) {
      Alert.alert('تنبيه', 'يرجى اختيار طالب أولاً');
      return;
    }
    const num = parseFloat(gradeVal);
    const max = parseFloat(maxGradeVal) || 100;
    if (isNaN(num) || num < 0 || num > max) {
      Alert.alert('تنبيه', \`الدرجة يجب أن تكون رقماً بين 0 و \${max}\`);
      return;
    }

    try {
      await addDoc(collection(db, 'grades'), {
        studentId: selectedStudentId,
        teacherId: auth.currentUser.uid,
        subject,
        grade: num,
        maxGrade: max,
        term: 'الاختبار الشهري',
        createdAt: new Date().toISOString(),
      });
      setGradeVal('');
      Alert.alert('نجاح', 'تم رصد الدرجة بنجاح');
    } catch (e) {
      Alert.alert('خطأ', 'تعذر رصد الدرجة');
    }
  };

  const getStudentName = (id) => {
    const s = students.find(item => item.id === id);
    return s ? s.name : 'طالب غير معروف';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>رصد درجة جديدة</Text>

        <Text style={styles.label}>اختر الطالب:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {students.map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.chip, selectedStudentId === s.id && styles.chipActive]}
              onPress={() => setSelectedStudentId(s.id)}
            >
              <Text style={[styles.chipText, selectedStudentId === s.id && styles.chipTextActive]}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>اختر المادة:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {SUBJECTS.map(subj => (
            <TouchableOpacity
              key={subj}
              style={[styles.chip, subject === subj && styles.chipActive]}
              onPress={() => setSubject(subj)}
            >
              <Text style={[styles.chipText, subject === subj && styles.chipTextActive]}>
                {subj}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputRow}>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>الدرجة المحصلة:</Text>
            <TextInput
              style={styles.input}
              placeholder="مثال: 95"
              keyboardType="numeric"
              value={gradeVal}
              onChangeText={setGradeVal}
              textAlign="right"
            />
          </View>
          <View style={{ width: 100 }}>
            <Text style={styles.label}>الدرجة العظمى:</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              keyboardType="numeric"
              value={maxGradeVal}
              onChangeText={setMaxGradeVal}
              textAlign="right"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSaveGrade}>
          <Text style={styles.submitBtnText}>حفظ ورصد الدرجة</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>أحدث الدرجات المرصودة ({grades.length})</Text>
      {grades.slice(0, 10).map(g => (
        <View key={g.id} style={styles.gradeItem}>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.gradeStudent}>{getStudentName(g.studentId)}</Text>
            <Text style={styles.gradeSubject}>{g.subject}</Text>
          </View>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center' }}>
            <Text style={styles.gradeScore}>{g.grade} / {g.maxGrade || 100}</Text>
            <TouchableOpacity onPress={() => deleteDoc(doc(db, 'grades', g.id))} style={{ marginRight: 12 }}>
              <Ionicons name="trash-outline" size={18} color="#e11d48" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 20 },
  title: { fontSize: 18, fontWeight: '700', color: '#0f172a', textAlign: 'right', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', textAlign: 'right', marginTop: 8, marginBottom: 6 },
  chipsScroll: { flexDirection: 'row-reverse', marginBottom: 8 },
  chip: { backgroundColor: '#f1f5f9', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginLeft: 8 },
  chipActive: { backgroundColor: '#059669' },
  chipText: { fontSize: 13, color: '#334155' },
  chipTextActive: { color: '#ffffff', fontWeight: '700' },
  inputRow: { flexDirection: 'row-reverse', marginTop: 8 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, padding: 12 },
  submitBtn: { backgroundColor: '#059669', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  submitBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a', textAlign: 'right', marginBottom: 12 },
  gradeItem: { backgroundColor: '#ffffff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  gradeStudent: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  gradeSubject: { fontSize: 12, color: '#64748b' },
  gradeScore: { fontSize: 16, fontWeight: '800', color: '#059669' },
});`,
    },
    {
      name: 'ReportsScreen.js',
      path: 'screens/ReportsScreen.js',
      language: 'javascript',
      description: 'شاشة التقارير والمعدلات وحالة الطالب (ممتاز، جيد، راسب...)',
      content: `import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function ReportsScreen() {
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;
    const teacherId = auth.currentUser.uid;

    const qStudents = query(collection(db, 'students'), where('teacherId', '==', teacherId));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const qGrades = query(collection(db, 'grades'), where('teacherId', '==', teacherId));
    const unsubGrades = onSnapshot(qGrades, (snap) => {
      setGrades(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubStudents();
      unsubGrades();
    };
  }, []);

  const getStatus = (avg) => {
    if (avg >= 90) return { label: 'ممتاز', color: '#059669', bg: '#ecfdf5' };
    if (avg >= 80) return { label: 'جيد جداً', color: '#2563eb', bg: '#eff6ff' };
    if (avg >= 70) return { label: 'جيد', color: '#0d9488', bg: '#f0fdfa' };
    if (avg >= 60) return { label: 'مقبول', color: '#d97706', bg: '#fffbeb' };
    if (avg >= 50) return { label: 'ضعيف', color: '#ea580c', bg: '#fff7ed' };
    return { label: 'راسب', color: '#e11d48', bg: '#fff1f2' };
  };

  const shareParentReport = async (item) => {
    const gradesList = item.grades.map(g => '• ' + g.subject + ': ' + g.grade + '/' + (g.maxGrade || 100)).join('\\n');
    const message = '📋 كشف أداء الطالب الموجه لولي الأمر\\n\\n👤 الطالب: ' + item.student.name + '\\n🆔 الرقم الأكاديمي: ' + item.student.studentId + '\\n🏫 الفصل: ' + (item.student.classroom || 'عام') + '\\n\\n📊 المعدل التراكمي: ' + item.average + '% (' + item.status.label + ')\\n\\n📚 تفاصيل المواد:\\n' + (gradesList || 'لا توجد درجات مرصودة') + '\\n\\n✍️ ملاحظة المعلم: نرجو متابعة الطالب وحل الواجبات لتعزيز التحصيل الدراسي.\\nمع تحيات إدارة نظام مسار';

    try {
      await Share.share({ message });
    } catch (error) {
      Alert.alert('خطأ', 'تعذر مشاركة التقرير');
    }
  };

  const studentReports = students.map(student => {
    const sGrades = grades.filter(g => g.studentId === student.id);
    let avg = 0;
    if (sGrades.length > 0) {
      const sum = sGrades.reduce((acc, g) => acc + ((g.grade / (g.maxGrade || 100)) * 100), 0);
      avg = Math.round((sum / sGrades.length) * 10) / 10;
    }
    return {
      student,
      grades: sGrades,
      average: avg,
      status: getStatus(avg),
    };
  });

  return (
    <View style={styles.container}>
      <FlatList
        data={studentReports}
        keyExtractor={item => item.student.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={[styles.badge, { backgroundColor: item.status.bg }]}>
                <Text style={[styles.badgeText, { color: item.status.color }]}>
                  {item.status.label}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.name}>{item.student.name}</Text>
                <Text style={styles.sub}>{item.student.studentId} • {item.student.classroom}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <Text style={styles.statItem}>المعدل التراكمي: <Text style={{ fontWeight: '800', color: item.status.color }}>{item.average}%</Text></Text>
              <Text style={styles.statItem}>عدد المواد المرصودة: {item.grades.length}</Text>
            </View>

            {/* زر تقرير ولي الأمر */}
            <TouchableOpacity style={styles.parentBtn} onPress={() => shareParentReport(item)}>
              <Ionicons name="document-text-outline" size={16} color="#4338ca" />
              <Text style={styles.parentBtnText}>مشاركة / طباعة تقرير ولي الأمر (PDF)</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  card: { backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 12 },
  row: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  sub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 13, fontWeight: '700' },
  statsRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  statItem: { fontSize: 13, color: '#475569' },
  parentBtn: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c7d2fe',
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  parentBtnText: { color: '#4338ca', fontSize: 12, fontWeight: 'bold' },
});`,
    },
    {
      name: 'package.json',
      path: 'package.json',
      language: 'json',
      description: 'حزم الاعتماد لتطبيق Expo وReact Native',
      content: `{
  "name": "masar-teacher-app",
  "version": "1.0.0",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "expo": "~52.0.0",
    "expo-status-bar": "~2.0.0",
    "react": "18.3.1",
    "react-native": "0.76.5",
    "@react-navigation/native": "^7.0.0",
    "@react-navigation/bottom-tabs": "^7.0.0",
    "firebase": "^11.0.0",
    "@expo/vector-icons": "^14.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  },
  "private": true
}`,
    },
  ];
};
