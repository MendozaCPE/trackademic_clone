import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, ActivityIndicator,
  Linking, Platform,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/context/AuthContext';
import {
  getClassPosts, getClassMaterials, getClassmates,
  getAttendance, BASE_URL,
  ClassPost, LearningMaterial, Classmate, AttendanceRow,
} from '@/services/api';

const TABS = ['Stream', 'Learning Materials', 'My Classmates', 'Attendance'] as const;
type Tab = typeof TABS[number];

function getFileIcon(fileType: string): { name: string; color: string } {
  const t = (fileType ?? '').toLowerCase();
  if (t.includes('pdf'))  return { name: 'document',      color: '#e74c3c' };
  if (t.includes('doc'))  return { name: 'document-text', color: '#1a5276' };
  if (t.includes('xls'))  return { name: 'document-text', color: '#27ae60' };
  if (t.includes('ppt'))  return { name: 'easel',         color: '#e67e22' };
  if (t.includes('img') || t.includes('png') || t.includes('jpg'))
    return { name: 'image', color: '#8e44ad' };
  return { name: 'document', color: '#7f8c8d' };
}

// ── Loading skeleton row ─────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <View style={S.skeletonRow}>
      <View style={S.skeletonBox} />
      <View style={S.skeletonLine} />
    </View>
  );
}

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function ClassDetailScreen() {
  const { id, name, code } = useLocalSearchParams<{
    id: string; name: string; code: string;
  }>();
  const { user } = useAuth();
  const classId = Number(id ?? 0);
  const [activeTab, setActiveTab] = useState<Tab>('Stream');

  return (
    <AppLayout breadcrumb={['🏠', 'Class', 'Class Details']}>
      {/* Title bar */}
      <View style={S.titleBar}>
        <Text style={S.titleLabel}>Class Details: </Text>
        <Text style={S.titleValue} numberOfLines={2}>{name ?? 'Class'}</Text>
      </View>

      {/* Horizontal tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={S.tabBarScroll}
        contentContainerStyle={S.tabBarContent}
      >
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[S.tabItem, activeTab === tab && S.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[S.tabText, activeTab === tab && S.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab content */}
      <View style={S.tabBody}>
        {activeTab === 'Stream'             && <StreamTab classId={classId} classCode={code ?? ''} />}
        {activeTab === 'Learning Materials' && <MaterialsTab classId={classId} />}
        {activeTab === 'My Classmates'      && <ClassmatesTab classId={classId} />}
        {activeTab === 'Attendance'         && <AttendanceTab classId={classId} user={user} />}
      </View>
    </AppLayout>
  );
}

// ── Stream Tab ───────────────────────────────────────────────────────────────
function StreamTab({ classId, classCode }: { classId: number; classCode: string }) {
  const [posts,   setPosts]   = useState<ClassPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClassPosts(classId)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [classId]);

  return (
    <ScrollView style={S.tabScroll} showsVerticalScrollIndicator={false}>
      <View style={S.streamCard}>
        {/* Left: code + meet */}
        <View style={S.streamLeft}>
          <Text style={S.streamCodeLabel}>Class Code</Text>
          <Text style={S.streamCode}>{classCode}</Text>
          <TouchableOpacity style={S.joinMeetBtn}>
            <Text style={S.joinMeetText}>Join Meet</Text>
          </TouchableOpacity>
        </View>

        {/* Right: posts */}
        <View style={S.streamRight}>
          <TouchableOpacity style={S.addPostBtn}>
            <Ionicons name="add" size={14} color="#17a2b8" />
            <Text style={S.addPostText}>Add Post (Available Soon)</Text>
          </TouchableOpacity>

          {loading && [1, 2].map((k) => <SkeletonRow key={k} />)}

          {!loading && posts.length === 0 && (
            <View style={S.emptyPosts}>
              <Ionicons name="chatbubble-ellipses-outline" size={38} color="#ccc" />
              <Text style={S.emptyPostsText}>
                No posts yet. Be the first to share something!
              </Text>
            </View>
          )}

          {!loading && posts.map((p) => (
            <View key={p.id} style={S.postCard}>
              <View style={S.postHeader}>
                <View style={S.postAvatar}>
                  <Ionicons name="person" size={14} color="#fff" />
                </View>
                <View>
                  <Text style={S.postAuthor}>{p.author_name}</Text>
                  <Text style={S.postDate}>
                    {new Date(p.created_at).toLocaleString()}
                  </Text>
                </View>
              </View>
              <Text style={S.postContent}>{p.content}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Learning Materials Tab ───────────────────────────────────────────────────
function MaterialsTab({ classId }: { classId: number }) {
  const [items,   setItems]   = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(() => {
    setLoading(true); setError('');
    getClassMaterials(classId)
      .then(setItems)
      .catch((e) => setError(e.message ?? 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [classId]);

  useEffect(() => { load(); }, [load]);

  const openFile = (path: string) => {
    const url = `${BASE_URL.replace('/api.php', '')}/${path}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView style={S.tabScroll} showsVerticalScrollIndicator={false}>
      {loading && [1, 2, 3].map((k) => <SkeletonRow key={k} />)}

      {!loading && error !== '' && (
        <View style={S.errorCard}>
          <Ionicons name="alert-circle-outline" size={20} color="#e74c3c" />
          <Text style={S.errorText}>{error}</Text>
          <TouchableOpacity style={S.retryBtn} onPress={load}>
            <Text style={S.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && error === '' && items.length === 0 && (
        <View style={S.emptyCard}>
          <Ionicons name="folder-open-outline" size={40} color="#ccc" />
          <Text style={S.emptyText}>No learning materials yet.</Text>
        </View>
      )}

      {!loading && items.map((item) => {
        const { name: iconName, color: iconColor } = getFileIcon(item.file_type);
        return (
          <View key={item.id} style={S.materialCard}>
            <View style={S.materialLeft}>
              <View style={[S.materialIconBox, { backgroundColor: iconColor + '22' }]}>
                <Ionicons name={iconName as any} size={24} color={iconColor} />
              </View>
              <View style={S.materialInfo}>
                <Text style={S.materialTitle}>{item.title}</Text>
                {!!item.description && (
                  <Text style={S.materialSubtitle}>{item.description}</Text>
                )}
                <Text style={S.materialDate}>
                  Date Posted: {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={S.materialActions}>
              <TouchableOpacity
                style={S.viewFileBtn}
                onPress={() => openFile(item.file_path)}
              >
                <Text style={S.viewFileBtnText}>View File</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={S.downloadBtn}
                onPress={() => openFile(item.file_path)}
              >
                <Text style={S.downloadBtnText}>Download</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── My Classmates Tab ────────────────────────────────────────────────────────
function ClassmatesTab({ classId }: { classId: number }) {
  const [all,     setAll]     = useState<Classmate[]>([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(() => {
    setLoading(true); setError('');
    getClassmates(classId)
      .then(setAll)
      .catch((e) => setError(e.message ?? 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [classId]);

  useEffect(() => { load(); }, [load]);

  const filtered = all.filter((c) => {
    const full = `${c.last_name} ${c.first_name} ${c.middle_initial}`.toLowerCase();
    return full.includes(search.toLowerCase());
  });

  return (
    <ScrollView style={S.tabScroll} showsVerticalScrollIndicator={false}>
      <View style={S.searchBox}>
        <Ionicons name="search-outline" size={16} color="#aaa" style={S.searchIcon} />
        <TextInput
          style={S.searchInput}
          placeholder="Search student..."
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading && [1, 2, 3, 4].map((k) => <SkeletonRow key={k} />)}

      {!loading && error !== '' && (
        <View style={S.errorCard}>
          <Text style={S.errorText}>{error}</Text>
          <TouchableOpacity style={S.retryBtn} onPress={load}>
            <Text style={S.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && error === '' && filtered.length === 0 && (
        <View style={S.emptyCard}>
          <Ionicons name="people-outline" size={40} color="#ccc" />
          <Text style={S.emptyText}>
            {search ? 'No students match your search.' : 'No classmates found.'}
          </Text>
        </View>
      )}

      {!loading && filtered.map((student) => (
        <View key={student.id} style={S.classmateRow}>
          <View style={S.classmateAvatar}>
            <Ionicons name="person" size={18} color="#fff" />
          </View>
          <Text style={S.classmateName}>
            {`${student.last_name}, ${student.first_name} ${student.middle_initial}.`.toUpperCase()}
          </Text>
          <TouchableOpacity
            style={S.mailBtn}
            onPress={() => Linking.openURL(`mailto:${student.email}`)}
          >
            <Ionicons name="mail-outline" size={18} color="#555" />
          </TouchableOpacity>
        </View>
      ))}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Attendance Tab ────────────────────────────────────────────────────────────
function AttendanceTab({ classId, user }: { classId: number; user: any }) {
  const [rows,    setRows]    = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  const load = useCallback(() => {
    setLoading(true); setError('');
    getAttendance(classId)
      .then(setRows)
      .catch((e) => setError(e.message ?? 'Failed to load.'))
      .finally(() => setLoading(false));
  }, [classId]);

  useEffect(() => { load(); }, [load]);

  const srCode    = user?.sr_code   ?? '—';
  const fullName  = user
    ? `${user.first_name} ${user.middle_initial ? user.middle_initial + '.' : ''} ${user.last_name}`
    : '—';

  return (
    <ScrollView style={S.tabScroll} showsVerticalScrollIndicator={false}>
      {/* Student info header */}
      <View style={S.attendInfoRow}>
        <View style={[S.attendInfoCell, { borderRightWidth: 1, borderRightColor: '#dee2e6' }]}>
          <Text style={S.attendInfoLabel}>Sr Code</Text>
          <Text style={S.attendInfoValue}>{srCode}</Text>
        </View>
        <View style={S.attendInfoCell}>
          <Text style={S.attendInfoLabel}>Name</Text>
          <Text style={S.attendInfoValue}>{fullName}</Text>
        </View>
      </View>

      {/* Sheet title */}
      <View style={S.sheetTitle}>
        <Text style={S.sheetTitleText}>Attendance Sheet</Text>
      </View>

      {/* Column headers */}
      <View style={S.attHeader}>
        <Text style={[S.attTh, { flex: 1.4 }]}>Date</Text>
        <Text style={[S.attTh, { flex: 1 }]}>Time In</Text>
        <Text style={[S.attTh, { flex: 1.4 }]}>Status</Text>
        <Text style={[S.attTh, { flex: 0.7, textAlign: 'right' }]}>Points</Text>
      </View>

      {loading && [1, 2, 3, 4, 5].map((k) => (
        <View key={k} style={S.attRow}>
          <View style={[S.skeletonLine, { flex: 1, marginRight: 6 }]} />
          <View style={[S.skeletonLine, { flex: 1, marginRight: 6 }]} />
          <View style={[S.skeletonLine, { flex: 1, marginRight: 6 }]} />
          <View style={[S.skeletonLine, { flex: 0.5 }]} />
        </View>
      ))}

      {!loading && error !== '' && (
        <View style={S.errorCard}>
          <Text style={S.errorText}>{error}</Text>
          <TouchableOpacity style={S.retryBtn} onPress={load}>
            <Text style={S.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && error === '' && rows.length === 0 && (
        <View style={S.emptyCard}>
          <Ionicons name="calendar-outline" size={40} color="#ccc" />
          <Text style={S.emptyText}>No attendance records found.</Text>
        </View>
      )}

      {!loading && rows.map((row, idx) => (
        <View key={idx} style={[S.attRow, idx % 2 === 0 && S.attRowEven]}>
          <Text style={[S.attTd, { flex: 1.4 }]}>{row.date}</Text>
          <Text style={[S.attTd, { flex: 1 }]}>{row.time_in}</Text>
          <Text style={[S.attTd, { flex: 1.4 }]}>
            <Text style={{ color: row.status.includes('Late') ? '#e74c3c' : '#27ae60' }}>
              {row.status}
            </Text>
          </Text>
          <Text style={[S.attTd, { flex: 0.7, textAlign: 'right' }]}>{row.points}</Text>
        </View>
      ))}

      {/* Summary row */}
      {!loading && rows.length > 0 && (
        <View style={S.summaryRow}>
          <Text style={S.summaryText}>
            Total Sessions: {rows.length}{'  '}
            Present: {rows.filter((r) => r.status.toLowerCase().includes('present')).length}{'  '}
            Late/Absent: {rows.filter((r) => !r.status.toLowerCase().includes('present')).length}
          </Text>
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // Title bar
  titleBar: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#f4f5f7' },
  titleLabel: { fontSize: 16, fontWeight: '600', color: '#222' },
  titleValue: { fontSize: 15, color: '#17a2b8', fontWeight: '600', textDecorationLine: 'underline', flex: 1 },

  // Tab bar
  tabBarScroll: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e8e8e8', flexGrow: 0 },
  tabBarContent: { paddingHorizontal: 8 },
  tabItem: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabItemActive: { borderBottomColor: '#17a2b8' },
  tabText: { fontSize: 14, color: '#666', fontWeight: '500' },
  tabTextActive: { color: '#17a2b8', fontWeight: '600' },
  tabBody: { flex: 1, backgroundColor: '#f4f5f7' },
  tabScroll: { flex: 1, paddingHorizontal: 14, paddingTop: 14 },

  // Skeleton
  skeletonRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, backgroundColor: '#fff', borderRadius: 6, padding: 12 },
  skeletonBox: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#eee' },
  skeletonLine: { flex: 1, height: 14, borderRadius: 4, backgroundColor: '#eee' },

  // Error / empty
  errorCard: { backgroundColor: '#fff5f5', borderRadius: 8, padding: 18, alignItems: 'center', gap: 8, marginBottom: 12, borderWidth: 1, borderColor: '#fcc' },
  errorText: { fontSize: 13, color: '#e74c3c', textAlign: 'center' },
  retryBtn: { backgroundColor: '#e74c3c', borderRadius: 4, paddingHorizontal: 16, paddingVertical: 7 },
  retryText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyCard: { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyText: { fontSize: 14, color: '#aaa', textAlign: 'center', maxWidth: 220 },

  // Stream
  streamCard: { backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', flexDirection: 'row', minHeight: 200, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  streamLeft: { width: 150, padding: 18, borderRightWidth: 1, borderRightColor: '#eee', alignItems: 'center', justifyContent: 'center', gap: 10 },
  streamCodeLabel: { fontSize: 12, color: '#888', fontWeight: '500' },
  streamCode: { fontSize: 20, fontWeight: '700', color: '#17a2b8', letterSpacing: 1 },
  joinMeetBtn: { backgroundColor: '#17a2b8', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 4, marginTop: 4 },
  joinMeetText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  streamRight: { flex: 1, padding: 14 },
  addPostBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#17a2b8', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 7, alignSelf: 'flex-end', marginBottom: 14 },
  addPostText: { color: '#17a2b8', fontSize: 12, fontWeight: '500' },
  emptyPosts: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 30, gap: 10 },
  emptyPostsText: { fontSize: 13, color: '#999', textAlign: 'center', maxWidth: 180 },
  postCard: { backgroundColor: '#f8f9fa', borderRadius: 6, padding: 12, marginBottom: 8, borderLeftWidth: 3, borderLeftColor: '#17a2b8' },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  postAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#6c8096', justifyContent: 'center', alignItems: 'center' },
  postAuthor: { fontSize: 12, fontWeight: '700', color: '#333' },
  postDate: { fontSize: 11, color: '#aaa' },
  postContent: { fontSize: 13, color: '#444', lineHeight: 18 },

  // Materials
  materialCard: { backgroundColor: '#fff', borderRadius: 6, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  materialLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 10 },
  materialIconBox: { width: 40, height: 40, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  materialInfo: { flex: 1, gap: 2 },
  materialTitle: { fontSize: 13, fontWeight: '700', color: '#222' },
  materialSubtitle: { fontSize: 12, color: '#666' },
  materialDate: { fontSize: 11, color: '#aaa', marginTop: 2 },
  materialActions: { flexDirection: 'column', gap: 6, marginLeft: 8 },
  viewFileBtn: { borderWidth: 1, borderColor: '#17a2b8', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  viewFileBtnText: { color: '#17a2b8', fontSize: 12, fontWeight: '500' },
  downloadBtn: { borderWidth: 1, borderColor: '#6c757d', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center' },
  downloadBtnText: { color: '#6c757d', fontSize: 12, fontWeight: '500' },

  // Classmates
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 6, marginBottom: 8, borderWidth: 1, borderColor: '#ddd', paddingHorizontal: 10 },
  searchIcon: { marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: '#333' },
  classmateRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10 },
  classmateAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6c8096', justifyContent: 'center', alignItems: 'center' },
  classmateName: { flex: 1, fontSize: 13, color: '#333', fontWeight: '500' },
  mailBtn: { padding: 4 },

  // Attendance
  attendInfoRow: { backgroundColor: '#fff', flexDirection: 'row', borderRadius: 6, marginBottom: 2, overflow: 'hidden', borderWidth: 1, borderColor: '#dee2e6' },
  attendInfoCell: { flex: 1, padding: 12 },
  attendInfoLabel: { fontSize: 11, color: '#888', fontWeight: '600', textTransform: 'uppercase', marginBottom: 3 },
  attendInfoValue: { fontSize: 13, color: '#333', fontWeight: '500' },
  sheetTitle: { backgroundColor: '#f8f9fa', paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderTopWidth: 0, borderColor: '#dee2e6', alignItems: 'center' },
  sheetTitleText: { fontSize: 13, fontWeight: '700', color: '#333' },
  attHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderTopWidth: 0, borderColor: '#dee2e6' },
  attTh: { fontSize: 12, fontWeight: '700', color: '#333' },
  attRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#dee2e6', backgroundColor: '#fff' },
  attRowEven: { backgroundColor: '#fafafa' },
  attTd: { fontSize: 12, color: '#444', lineHeight: 16 },
  summaryRow: { backgroundColor: '#eaf7fb', borderWidth: 1, borderTopWidth: 0, borderColor: '#dee2e6', padding: 12, alignItems: 'center' },
  summaryText: { fontSize: 12, color: '#17a2b8', fontWeight: '600' },
});
