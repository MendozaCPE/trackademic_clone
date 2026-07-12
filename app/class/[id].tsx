import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';

// ── Mock data ────────────────────────────────────────────────────────────────
const CLASS_DATA: Record<string, any> = {
  '1': {
    name: 'Web Systems And Technologies - BSIT BA-3103',
    code: 'ag08itoc',
    srCode: '22-03592',
    studentName: 'Christian Paul E. Mendoza',
  },
  '2': {
    name: 'Application Development - BSIT BA 3303 BSIT BA-3103',
    code: 'fla2efor',
    srCode: '22-03592',
    studentName: 'Christian Paul E. Mendoza',
  },
};

const TABS = ['Stream', 'Learning Materials', 'My Classmates', 'Attendance'];

const LEARNING_MATERIALS = [
  { id: 1, icon: 'document', iconColor: '#e74c3c', title: 'Introduction to MVC and Web Frameworks', subtitle: 'God Bless', date: 'Date Posted: November 11, 2025 at 1:14 PM' },
  { id: 2, icon: 'document', iconColor: '#e74c3c', title: 'Introduction to MVC and Web Frameworks', subtitle: 'Practice the setup of CodeIgniter 4', date: 'Date Posted: November 11, 2025 at 1:15 PM' },
  { id: 3, icon: 'document-text', iconColor: '#1a5276', title: 'Php CRUD, SESSION LAB ACTIVITY', subtitle: 'Please follow the given instruction. Thank you!', date: 'Date Posted: November 7, 2025 at 2:14 PM' },
  { id: 4, icon: 'document', iconColor: '#e74c3c', title: 'PHP_MySql', subtitle: 'Practice and Review!', date: 'Date Posted: October 26, 2025 at 11:18 PM' },
  { id: 5, icon: 'document', iconColor: '#e74c3c', title: 'PHP_Basics_wk10-11', subtitle: 'Practice and Review!', date: 'Date Posted: October 26, 2025 at 11:33 PM' },
  { id: 6, icon: 'document', iconColor: '#e67e22', title: 'JavaScript Fundamentals', subtitle: 'Read and practice the use of javascript with html and bootstrap!', date: 'Date Posted: September 26, 2025 at 11:41 PM' },
];

const CLASSMATES = [
  { id: 1, name: 'URGE, KIMBERLY GUA' },
  { id: 2, name: 'BETITA, NIEL FRANCIS BENEDICT J.' },
  { id: 3, name: 'MACALALAD, RUEL B.' },
  { id: 4, name: 'ALCARAZ, GENWIL D.' },
  { id: 5, name: 'DESPO, ELMIRA A.' },
  { id: 6, name: 'CATU, AJ E.' },
  { id: 7, name: 'DANDO, KING EXQUIEL C.' },
  { id: 8, name: 'PAGCALIWAGAN, ZETH RAMZY A.' },
  { id: 9, name: 'TORRES, JOHN LUI T.' },
  { id: 10, name: 'CUENCA, IRISH KAYE D.' },
  { id: 11, name: 'CABATIAN, IVAN S.' },
  { id: 12, name: 'RAMIREZ, JOSHUA P.' },
];

const ATTENDANCE = [
  { date: 'August 19, 2025', timeIn: '02:00 PM', status: 'Present - On Time', points: '-0' },
  { date: 'August 22, 2025', timeIn: '04:15 PM', status: 'Present - On Time', points: '-0' },
  { date: 'August 29, 2025', timeIn: '04:05 PM', status: 'Present - On Time', points: '-0' },
  { date: 'September 2, 2025', timeIn: '02:00 PM', status: 'Present - On Time', points: '-0' },
  { date: 'September 5, 2025', timeIn: '04:04 PM', status: 'Present - On Time', points: '-0' },
  { date: 'September 9, 2025', timeIn: '02:04 PM', status: 'Present - On Time', points: '-0' },
  { date: 'September 16, 2025', timeIn: '02:02 PM', status: 'Present - On Time', points: '-0' },
  { date: 'September 19, 2025', timeIn: '04:05 PM', status: 'Present - On Time', points: '-0' },
  { date: 'September 23, 2025', timeIn: '02:08 PM', status: 'Present - On Time', points: '-0' },
  { date: 'October 7, 2025', timeIn: '02:00 PM', status: 'Present - On Time', points: '-0' },
  { date: 'October 10, 2025', timeIn: '04:03 PM', status: 'Present - On Time', points: '0' },
  { date: 'October 21, 2025', timeIn: '02:03 PM', status: 'Present - On Time', points: '0' },
  { date: 'October 24, 2025', timeIn: '04:13 PM', status: 'Present - On Time', points: '0' },
  { date: 'October 28, 2025', timeIn: '02:01 PM', status: 'Present - On Time', points: '0' },
];

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function ClassDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string }>();
  const [activeTab, setActiveTab] = useState('Stream');
  const cls = CLASS_DATA[id ?? '1'] ?? CLASS_DATA['1'];
  const displayName = name ?? cls.name;

  return (
    <AppLayout breadcrumb={['🏠', 'Class', 'Class Details']}>
      {/* Class title */}
      <View style={styles.classTitleBar}>
        <Text style={styles.classTitleLabel}>Class Details: </Text>
        <Text style={styles.classTitleValue} numberOfLines={2}>{displayName}</Text>
      </View>

      {/* Tab Header */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBarScroll}
        contentContainerStyle={styles.tabBarContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <View style={styles.tabBody}>
        {activeTab === 'Stream' && <StreamTab cls={cls} />}
        {activeTab === 'Learning Materials' && <LearningMaterialsTab />}
        {activeTab === 'My Classmates' && <ClassmatesTab />}
        {activeTab === 'Attendance' && <AttendanceTab cls={cls} />}
      </View>
    </AppLayout>
  );
}

// ── Stream Tab ───────────────────────────────────────────────────────────────
function StreamTab({ cls }: { cls: any }) {
  return (
    <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.streamContainer}>
        {/* Left: Class Code + Join Meet */}
        <View style={styles.streamLeft}>
          <Text style={styles.streamCodeLabel}>Class Code</Text>
          <Text style={styles.streamCode}>{cls.code}</Text>
          <TouchableOpacity style={styles.joinMeetBtn}>
            <Text style={styles.joinMeetText}>Join Meet</Text>
          </TouchableOpacity>
        </View>

        {/* Right: Add Post + Empty posts */}
        <View style={styles.streamRight}>
          <TouchableOpacity style={styles.addPostBtn}>
            <Ionicons name="add" size={14} color="#17a2b8" />
            <Text style={styles.addPostText}>Add Post (Available Soon)</Text>
          </TouchableOpacity>

          <View style={styles.emptyPosts}>
            <Ionicons name="chatbubble-ellipses-outline" size={40} color="#bbb" />
            <Text style={styles.emptyPostsText}>
              No posts yet. Be the first to share something with your class!
            </Text>
          </View>
        </View>
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Learning Materials Tab ───────────────────────────────────────────────────
function LearningMaterialsTab() {
  return (
    <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
      {LEARNING_MATERIALS.map((item) => (
        <View key={item.id} style={styles.materialCard}>
          <View style={styles.materialLeft}>
            <View style={[styles.materialIconBox, { backgroundColor: item.iconColor + '22' }]}>
              <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
            </View>
            <View style={styles.materialInfo}>
              <Text style={styles.materialTitle}>{item.title}</Text>
              <Text style={styles.materialSubtitle}>{item.subtitle}</Text>
              <Text style={styles.materialDate}>{item.date}</Text>
            </View>
          </View>
          <View style={styles.materialActions}>
            <TouchableOpacity style={styles.viewFileBtn}>
              <Text style={styles.viewFileBtnText}>View File</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.downloadBtn}>
              <Text style={styles.downloadBtnText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── My Classmates Tab ────────────────────────────────────────────────────────
function ClassmatesTab() {
  const [search, setSearch] = useState('');
  const filtered = CLASSMATES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search student..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {filtered.map((student) => (
        <View key={student.id} style={styles.classmateRow}>
          <View style={styles.classmateAvatar}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
          <Text style={styles.classmateName}>{student.name}</Text>
          <TouchableOpacity style={styles.mailBtn}>
            <Ionicons name="mail-outline" size={18} color="#555" />
          </TouchableOpacity>
        </View>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Attendance Tab ────────────────────────────────────────────────────────────
function AttendanceTab({ cls }: { cls: any }) {
  return (
    <ScrollView style={styles.tabScroll} showsVerticalScrollIndicator={false}>
      {/* Info row */}
      <View style={styles.attendanceInfoRow}>
        <View style={styles.attendanceInfoCell}>
          <Text style={styles.attendanceInfoLabel}>Sr Code</Text>
          <Text style={styles.attendanceInfoValue}>{cls.srCode}</Text>
        </View>
        <View style={styles.attendanceInfoCell}>
          <Text style={styles.attendanceInfoLabel}>Name</Text>
          <Text style={styles.attendanceInfoValue}>{cls.studentName}</Text>
        </View>
      </View>

      {/* Attendance Sheet header */}
      <View style={styles.attendanceSheetHeader}>
        <Text style={styles.attendanceSheetTitle}>Attendance Sheet</Text>
      </View>

      {/* Table header */}
      <View style={styles.attendanceTableHeader}>
        <Text style={[styles.attThCell, { flex: 1.4 }]}>Date</Text>
        <Text style={[styles.attThCell, { flex: 1 }]}>Time In</Text>
        <Text style={[styles.attThCell, { flex: 1.4 }]}>Status</Text>
        <Text style={[styles.attThCell, { flex: 0.7, textAlign: 'right' }]}>Points</Text>
      </View>

      {/* Rows */}
      {ATTENDANCE.map((row, idx) => (
        <View key={idx} style={[styles.attendanceRow, idx % 2 === 0 && styles.attendanceRowEven]}>
          <Text style={[styles.attTdCell, { flex: 1.4 }]}>{row.date}</Text>
          <Text style={[styles.attTdCell, { flex: 1 }]}>{row.timeIn}</Text>
          <Text style={[styles.attTdCell, { flex: 1.4 }]}>{row.status}</Text>
          <Text style={[styles.attTdCell, { flex: 0.7, textAlign: 'right' }]}>{row.points}</Text>
        </View>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Class title bar
  classTitleBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f4f5f7',
  },
  classTitleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  classTitleValue: {
    fontSize: 15,
    color: '#17a2b8',
    fontWeight: '600',
    textDecorationLine: 'underline',
    flex: 1,
  },

  // Tab bar (horizontal scroll)
  tabBarScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    flexGrow: 0,
  },
  tabBarContent: {
    paddingHorizontal: 8,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#17a2b8',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#17a2b8',
    fontWeight: '600',
  },

  // Tab body
  tabBody: {
    flex: 1,
    backgroundColor: '#f4f5f7',
  },
  tabScroll: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
  },

  // Stream tab
  streamContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  streamLeft: {
    width: 160,
    padding: 20,
    borderRightWidth: 1,
    borderRightColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  streamCodeLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
  },
  streamCode: {
    fontSize: 22,
    fontWeight: '700',
    color: '#17a2b8',
    letterSpacing: 1,
  },
  joinMeetBtn: {
    backgroundColor: '#17a2b8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 4,
  },
  joinMeetText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  streamRight: {
    flex: 1,
    padding: 16,
  },
  addPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#17a2b8',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  addPostText: {
    color: '#17a2b8',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyPosts: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 10,
  },
  emptyPostsText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    maxWidth: 200,
  },

  // Learning Materials tab
  materialCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  materialLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 10,
  },
  materialIconBox: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  materialInfo: {
    flex: 1,
    gap: 2,
  },
  materialTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222',
  },
  materialSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  materialDate: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
  },
  materialActions: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
  },
  viewFileBtn: {
    borderWidth: 1,
    borderColor: '#17a2b8',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  viewFileBtnText: {
    color: '#17a2b8',
    fontSize: 12,
    fontWeight: '500',
  },
  downloadBtn: {
    borderWidth: 1,
    borderColor: '#6c757d',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  downloadBtnText: {
    color: '#6c757d',
    fontSize: 12,
    fontWeight: '500',
  },

  // Classmates tab
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  classmateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 10,
  },
  classmateAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6c8096',
    justifyContent: 'center',
    alignItems: 'center',
  },
  classmateName: {
    flex: 1,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  mailBtn: {
    padding: 4,
  },

  // Attendance tab
  attendanceInfoRow: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderRadius: 6,
    marginBottom: 2,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  attendanceInfoCell: {
    flex: 1,
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#dee2e6',
  },
  attendanceInfoLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  attendanceInfoValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  attendanceSheetHeader: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderTopWidth: 0,
    alignItems: 'center',
  },
  attendanceSheetTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  attendanceTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#dee2e6',
  },
  attThCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  attendanceRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#dee2e6',
    backgroundColor: '#fff',
  },
  attendanceRowEven: {
    backgroundColor: '#fafafa',
  },
  attTdCell: {
    fontSize: 12,
    color: '#444',
    lineHeight: 16,
  },
});
