import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, TextInput, ActivityIndicator,
  Linking, Modal, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/context/AuthContext';
import {
  getClassPosts, getClassMaterials, getClassmates,
  getAttendance, getClassById, createClassPost, BASE_URL,
  ClassPost, LearningMaterial, Classmate, AttendanceRow, ClassItem,
} from '@/services/api';

const TABS = ['Stream', 'Learning Materials', 'Classmates', 'Attendance'] as const;
type Tab = typeof TABS[number];

function getFileIcon(fileType: string): { name: string; color: string } {
  const t = (fileType ?? '').toLowerCase();
  if (t.includes('pdf'))  return { name: 'document-text', color: '#ef4444' };
  if (t.includes('doc'))  return { name: 'document',      color: '#3b82f6' };
  if (t.includes('xls'))  return { name: 'grid',          color: '#10b981' };
  if (t.includes('ppt'))  return { name: 'presentation',  color: '#f59e0b' };
  return { name: 'file-tray-full', color: '#64748b' };
}

export default function ClassDetailScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name: string; }>();
  const { user } = useAuth();
  const classId = Number(id ?? 0);
  const [activeTab, setActiveTab] = useState<Tab>('Stream');
  const [classDetail, setClassDetail] = useState<ClassItem | null>(null);

  useEffect(() => {
    getClassById(classId).then(setClassDetail).catch(() => {});
  }, [classId]);

  const classCode = classDetail?.class_code ?? '—';

  return (
    <AppLayout>
      <View style={S.root}>
        {/* ── Fixed Class Header ── */}
        <View style={S.headerCard}>
          <View style={S.headerRow}>
            <View style={S.titleGroup}>
              <Text style={S.className} numberOfLines={1}>{name ?? 'Class Details'}</Text>
              <View style={S.codeBadge}>
                <Text style={S.codeText}>Class Code: {classCode}</Text>
              </View>
            </View>
          </View>

          {/* Horizontal Tabs */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.tabScroll}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[S.tabItem, activeTab === tab && S.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[S.tabItemText, activeTab === tab && S.tabItemTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Content Area ── */}
        <View style={S.content}>
          {activeTab === 'Stream' && <StreamTab classId={classId} />}
          {activeTab === 'Learning Materials' && <MaterialsTab classId={classId} />}
          {activeTab === 'Classmates' && <ClassmatesTab classId={classId} />}
          {activeTab === 'Attendance' && <AttendanceTab classId={classId} user={user} />}
        </View>
      </View>
    </AppLayout>
  );
}

// ── STREAM TAB ───────────────────────────────────────────────────────────────
function StreamTab({ classId }: { classId: number }) {
  const [posts, setPosts] = useState<ClassPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [postText, setPostText] = useState('');
  const [posting, setPosting] = useState(false);

  const loadPosts = () => {
    setLoading(true);
    getClassPosts(classId).then(setPosts).finally(() => setLoading(false));
  };

  useEffect(() => { loadPosts(); }, [classId]);

  const handlePost = async () => {
    if (!postText.trim()) return;
    setPosting(true);
    try {
      await createClassPost(classId, postText.trim());
      setPostText('');
      setModalVisible(false);
      loadPosts();
    } catch (_) {}
    finally { setPosting(false); }
  };

  return (
    <>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.tabPadding}>
        {/* Share placeholder — tapping opens the modal */}
        <TouchableOpacity style={S.postInputPlaceholder} onPress={() => setModalVisible(true)}>
          <Ionicons name="create-outline" size={20} color="#94a3b8" />
          <Text style={S.postInputText}>Share something with your class...</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#1a2e4a" />
        ) : posts.length === 0 ? (
          <View style={S.emptyState}>
            <Ionicons name="chatbubbles-outline" size={48} color="#cbd5e1" />
            <Text style={S.emptyTitle}>No announcements yet</Text>
          </View>
        ) : (
          posts.map((p) => (
            <View key={p.id} style={S.postCard}>
              <View style={S.postHeader}>
                <View style={S.postAvatar}>
                  {p.author_profile_pic ? (
                    <Image
                      source={{ uri: `${BASE_URL.replace('/api.php', '')}/${p.author_profile_pic}` }}
                      style={S.postAvatarImg}
                    />
                  ) : (
                    <Text style={S.avatarInitial}>{p.author_name.charAt(0)}</Text>
                  )}
                </View>
                <View>
                  <Text style={S.postAuthor}>{p.author_name}</Text>
                  <Text style={S.postDate}>{new Date(p.created_at).toLocaleDateString()}</Text>
                </View>
              </View>
              <Text style={S.postContent}>{p.content}</Text>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Compose Post Modal ── */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={S.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={S.modalSheet}>
            <View style={S.modalHandle} />
            <View style={S.modalHeader}>
              <Text style={S.modalTitle}>New Post</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={S.modalInput}
              placeholder="Share something with your class..."
              placeholderTextColor="#94a3b8"
              multiline
              value={postText}
              onChangeText={setPostText}
              autoFocus
            />
            <TouchableOpacity
              style={[S.postBtn, (!postText.trim() || posting) && { opacity: 0.5 }]}
              onPress={handlePost}
              disabled={!postText.trim() || posting}
            >
              {posting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={S.postBtnText}>Post</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

// ── MATERIALS TAB ────────────────────────────────────────────────────────────
function MaterialsTab({ classId }: { classId: number }) {
  const [items, setItems] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClassMaterials(classId).then(setItems).finally(() => setLoading(false));
  }, [classId]);

  const openFile = (path: string) => {
    const url = `${BASE_URL.replace('/api.php', '')}/${path}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.tabPadding}>
      {loading ? (
        <ActivityIndicator color="#1a2e4a" />
      ) : items.map((item) => {
        const icon = getFileIcon(item.file_type);
        return (
          <TouchableOpacity key={item.id} style={S.materialCard} onPress={() => openFile(item.file_path)}>
            <View style={[S.fileIconBg, { backgroundColor: icon.color + '15' }]}>
              <Ionicons name={icon.name as any} size={24} color={icon.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.materialTitle}>{item.title}</Text>
              <Text style={S.materialDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
            <Ionicons name="download-outline" size={20} color="#94a3b8" />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── CLASSMATES TAB ───────────────────────────────────────────────────────────
function ClassmatesTab({ classId }: { classId: number }) {
  const [all, setAll] = useState<Classmate[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClassmates(classId).then(setAll).finally(() => setLoading(false));
  }, [classId]);

  const filtered = all.filter(c => `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={{ flex: 1 }}>
      <View style={S.searchWrapper}>
        <View style={S.searchBar}>
          <Ionicons name="search" size={18} color="#94a3b8" />
          <TextInput
            placeholder="Search classmate..."
            style={S.searchInput}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.tabPadding}>
        {filtered.map((student) => (
          <View key={student.id} style={S.classmateRow}>
            <View style={S.studentAvatar}>
              <Text style={S.avatarInitial}>{student.first_name.charAt(0)}</Text>
            </View>
            <Text style={S.studentName}>{`${student.last_name}, ${student.first_name}`.toUpperCase()}</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`mailto:${student.email}`)}>
              <Ionicons name="mail-outline" size={20} color="#17a2b8" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ── ATTENDANCE TAB ────────────────────────────────────────────────────────────
function AttendanceTab({ classId, user }: { classId: number; user: any }) {
  const [rows, setRows] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAttendance(classId).then(setRows).finally(() => setLoading(false));
  }, [classId]);

  return (
    <View style={{ flex: 1 }}>
      <View style={S.attendanceSummary}>
        <View style={S.summaryBox}>
          <Text style={S.summaryLabel}>Student ID</Text>
          <Text style={S.summaryValue}>{user?.sr_code || '---'}</Text>
        </View>
        <View style={S.summaryBox}>
          <Text style={S.summaryLabel}>Total Present</Text>
          <Text style={S.summaryValue}>{rows.filter(r => r.status.includes('Present')).length}</Text>
        </View>
      </View>

      <View style={S.tableHeader}>
        <Text style={[S.th, { flex: 1.5 }]}>Date</Text>
        <Text style={[S.th, { flex: 1 }]}>Time In</Text>
        <Text style={[S.th, { flex: 1.5, textAlign: 'right' }]}>Status</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
        {rows.map((row, idx) => {
          const isLate = row.status.toLowerCase().includes('late');
          return (
            <View key={idx} style={S.tr}>
              <Text style={[S.td, { flex: 1.5 }]}>{row.date}</Text>
              <Text style={[S.td, { flex: 1, color: '#64748b' }]}>{row.time_in}</Text>
              <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                <View style={[S.statusBadge, { backgroundColor: isLate ? '#fff7ed' : '#f0fdf4' }]}>
                  <Text style={[S.statusBadgeText, { color: isLate ? '#ea580c' : '#16a34a' }]}>{row.status}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const S = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  
  // Header Card
  headerCard: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingTop: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  titleGroup: { flex: 1, marginRight: 10 },
  className: { fontSize: 20, fontWeight: '800', color: '#1a2e4a' },
  codeBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  codeText: { fontSize: 11, fontWeight: '700', color: '#64748b' },
  meetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2e4a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  meetBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Tabs
  tabScroll: { paddingLeft: 20 },
  tabItem: {
    paddingVertical: 12,
    marginRight: 25,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: '#17a2b8' },
  tabItemText: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  tabItemTextActive: { color: '#1a2e4a' },

  // Content
  content: { flex: 1 },
  tabPadding: { padding: 20 },

  // Stream Styles
  postInputPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
    gap: 10,
  },
  postInputText: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  postAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1a2e4a', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  postAvatarImg: { width: 36, height: 36, borderRadius: 18 },
  avatarInitial: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  postAuthor: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  postDate: { fontSize: 11, color: '#94a3b8' },
  postContent: { fontSize: 14, color: '#475569', lineHeight: 20 },

  // Materials Styles
  materialCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    gap: 12,
  },
  fileIconBg: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  materialTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  materialDate: { fontSize: 11, color: '#94a3b8', marginTop: 2 },

  // Classmates Styles
  searchWrapper: { paddingHorizontal: 20, paddingTop: 20 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 45,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1e293b' },
  classmateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    gap: 12,
  },
  studentAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#1a2e4a', justifyContent: 'center', alignItems: 'center' },
  studentName: { flex: 1, fontSize: 13, fontWeight: '600', color: '#475569' },

  // Attendance Styles
  attendanceSummary: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
  summaryValue: { fontSize: 15, fontWeight: '800', color: '#1a2e4a', marginTop: 2 },
  
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 35,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  th: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  td: { fontSize: 13, fontWeight: '600', color: '#1e293b' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  // Helper States
  emptyState: { paddingVertical: 80, alignItems: 'center', gap: 10 },
  emptyTitle: { fontSize: 14, color: '#94a3b8', fontWeight: '500' },

  // Compose Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalHandle: {
    width: 40, height: 4, backgroundColor: '#e2e8f0',
    borderRadius: 2, alignSelf: 'center', marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 16, fontWeight: '800', color: '#1a2e4a' },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: '#1a2e4a',
    minHeight: 110,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  postBtn: {
    backgroundColor: '#1a2e4a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  postBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});