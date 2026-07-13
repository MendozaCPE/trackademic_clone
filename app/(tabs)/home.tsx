import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl,
  Modal, Pressable, Dimensions, Platform,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { getAnnouncements, Announcement } from '@/services/api';
import { readCache, writeCache } from '@/hooks/use-cache';
import { useNetwork } from '@/hooks/use-network';

const CACHE_KEY = 'announcements';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function HomeScreen() {
  const { user } = useAuth();
  const isOnline = useNetwork();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState('');
  const [selected,   setSelected]   = useState<Announcement | null>(null);
  const [fromCache,  setFromCache]  = useState(false);

  const fetchData = useCallback(async () => {
    setError('');
    try {
      // Try live data first
      const data = await getAnnouncements();
      setAnnouncements(data);
      setFromCache(false);
      await writeCache(CACHE_KEY, data);
    } catch (e: any) {
      // Fall back to cache
      const cached = await readCache<Announcement[]>(CACHE_KEY);
      if (cached) {
        setAnnouncements(cached);
        setFromCache(true);
      } else {
        setError(e.message ?? 'Unable to connect to the campus server.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => { setRefreshing(true); fetchData(); };
  useEffect(() => { fetchData(); }, [fetchData]);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const firstName = user?.first_name ?? 'Student';

  return (
    <AppLayout>

      {/* ── STICKY top section ── */}
      <View style={S.stickyTop}>
        <View style={S.headerSection}>
          <Text style={S.greetingText}>{getGreeting()},</Text>
          <Text style={S.userName}>{firstName}!</Text>
        </View>

        <View style={S.quickActions}>
          <TouchableOpacity style={S.actionChip} onPress={() => router.push('/(tabs)/classes')}>
            <View style={[S.actionIcon, { backgroundColor: '#e8f4f8' }]}>
              <Ionicons name="school" size={22} color="#17a2b8" />
            </View>
            <Text style={S.actionLabel}>Class</Text>
          </TouchableOpacity>

          <TouchableOpacity style={S.actionChip} onPress={() => router.push('/(tabs)/schedule')}>
            <View style={[S.actionIcon, { backgroundColor: '#eef2ff' }]}>
              <Ionicons name="calendar" size={22} color="#4f46e5" />
            </View>
            <Text style={S.actionLabel}>Schedule</Text>
          </TouchableOpacity>

          <TouchableOpacity style={S.actionChip} onPress={() => router.push('/(tabs)/performance')}>
            <View style={[S.actionIcon, { backgroundColor: '#fff7ed' }]}>
              <Ionicons name="bar-chart" size={22} color="#ea580c" />
            </View>
            <Text style={S.actionLabel}>Performance</Text>
          </TouchableOpacity>

          <TouchableOpacity style={S.actionChip} onPress={() => router.push('/(tabs)/profile')}>
            <View style={[S.actionIcon, { backgroundColor: '#f0fdf4' }]}>
              <Ionicons name="person" size={22} color="#16a34a" />
            </View>
            <Text style={S.actionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={S.sectionHeader}>
          <View>
            <Text style={S.sectionTitle}>Campus Announcements</Text>
            <Text style={S.sectionSubtitle}>
              {fromCache ? '📦 Showing cached data' : 'Stay updated with university news'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Announcements list ── */}
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#17a2b8" />
        }
      >
        {loading ? (
          <View style={S.loaderContainer}>
            <ActivityIndicator size="small" color="#1a2e4a" />
            <Text style={S.loaderText}>Fetching updates...</Text>
          </View>
        ) : error ? (
          <View style={S.errorState}>
            <Ionicons name="cloud-offline-outline" size={40} color="#cbd5e1" />
            <Text style={S.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchData} style={S.retryButton}>
              <Text style={S.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : announcements.length === 0 ? (
          <View style={S.emptyState}>
            <Ionicons name="megaphone-outline" size={36} color="#cbd5e1" />
            <Text style={S.emptyStateText}>No new announcements today.</Text>
          </View>
        ) : (
          announcements.map((item) => (
            <TouchableOpacity key={item.id} activeOpacity={0.7} style={S.newsCard} onPress={() => setSelected(item)}>
              <View style={S.newsTag}><Text style={S.newsTagText}>Official</Text></View>
              <Text style={S.newsTitle}>{item.title}</Text>
              <Text style={S.newsBody} numberOfLines={3}>{item.body}</Text>
              <View style={S.newsFooter}>
                <View style={S.posterInfo}>
                  <View style={S.posterAvatar}>
                    <Text style={S.posterInitial}>{item.poster_name.charAt(0)}</Text>
                  </View>
                  <Text style={S.posterName}>{item.poster_name}</Text>
                </View>
                <Text style={S.newsDate}>
                  {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Announcement Detail Modal ── */}
      <Modal visible={!!selected} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setSelected(null)}>
        <View style={S.modalOverlay}>
          <Pressable style={S.modalBackdrop} onPress={() => setSelected(null)} />
          <View style={S.modalSheet}>
            <View style={S.modalHandle} />
            <View style={S.modalTopBar}>
              <View style={S.modalTagPill}>
                <Ionicons name="megaphone-outline" size={11} color="#17a2b8" />
                <Text style={S.modalTagText}>Official Announcement</Text>
              </View>
              <TouchableOpacity onPress={() => setSelected(null)} style={S.modalCloseBtn}>
                <Ionicons name="close-circle" size={26} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={S.modalScrollContent}>
              <Text style={S.modalTitle}>{selected?.title}</Text>
              <View style={S.modalAuthorRow}>
                <View style={S.modalAuthorAvatar}>
                  <Text style={S.modalAuthorInitial}>{selected?.poster_name.charAt(0)}</Text>
                </View>
                <View style={S.modalAuthorInfo}>
                  <Text style={S.modalAuthorName}>{selected?.poster_name}</Text>
                  <Text style={S.modalAuthorDate}>
                    {selected ? new Date(selected.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  </Text>
                </View>
              </View>
              <View style={S.modalDivider} />
              <Text style={S.modalBodyText}>{selected?.body}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </AppLayout>
  );
}

const S = StyleSheet.create({
  stickyTop: { backgroundColor: '#f8fafc', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 12 },
  headerSection: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
  greetingText: { fontSize: 16, color: '#64748b', fontWeight: '400' },
  userName:     { fontSize: 28, fontWeight: '800', color: '#1a2e4a', letterSpacing: -0.5 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 18 },
  actionChip:  { alignItems: 'center', width: '23%' },
  actionIcon:  { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 4 },
  sectionTitle:    { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  sectionSubtitle: { fontSize: 12, color: '#94a3b8', marginTop: 2 },

  scroll:        { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 14 },

  newsCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#e2e8f0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  newsTag:       { backgroundColor: '#f1f5f9', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 10 },
  newsTagText:   { fontSize: 10, fontWeight: '700', color: '#64748b', textTransform: 'uppercase' },
  newsTitle:     { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 6, lineHeight: 21 },
  newsBody:      { fontSize: 13, color: '#475569', lineHeight: 19, marginBottom: 12 },
  newsFooter:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  posterInfo:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  posterAvatar:  { width: 24, height: 24, borderRadius: 12, backgroundColor: '#1a2e4a', justifyContent: 'center', alignItems: 'center' },
  posterInitial: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  posterName:    { fontSize: 12, fontWeight: '600', color: '#64748b' },
  newsDate:      { fontSize: 11, color: '#94a3b8', fontWeight: '500' },

  loaderContainer: { paddingVertical: 40, alignItems: 'center', gap: 10 },
  loaderText:      { fontSize: 13, color: '#94a3b8' },
  errorState:      { padding: 30, backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#fee2e2' },
  errorText:       { fontSize: 14, color: '#94a3b8', textAlign: 'center' },
  retryButton:     { backgroundColor: '#1a2e4a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyState:      { paddingVertical: 50, alignItems: 'center', gap: 12 },
  emptyStateText:  { color: '#94a3b8', fontSize: 14 },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject },
  modalSheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, height: SCREEN_HEIGHT * 0.78, paddingBottom: Platform.OS === 'android' ? 24 : 34, overflow: 'hidden' },
  modalHandle: { width: 44, height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  modalTopBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTagPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#f0f9fa', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#bde8f0' },
  modalTagText: { fontSize: 11, fontWeight: '700', color: '#17a2b8', textTransform: 'uppercase', letterSpacing: 0.4 },
  modalCloseBtn: { padding: 2 },
  modalScrollContent: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1e293b', lineHeight: 28, marginBottom: 18 },
  modalAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  modalAuthorAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1a2e4a', justifyContent: 'center', alignItems: 'center' },
  modalAuthorInitial: { color: '#fff', fontSize: 16, fontWeight: '800' },
  modalAuthorInfo: { flex: 1 },
  modalAuthorName: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  modalAuthorDate: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  modalDivider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 18 },
  modalBodyText: { fontSize: 14, color: '#475569', lineHeight: 24, letterSpacing: 0.1 },
});
