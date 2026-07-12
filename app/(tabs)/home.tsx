import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { getAnnouncements, Announcement } from '@/services/api';

export default function HomeScreen() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load announcements.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fullName = user ? `${user.first_name} ${user.last_name}` : '...';

  return (
    <AppLayout title="Home" breadcrumb={['🏠', 'My Dashboard']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={36} color="#fff" />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeName}>Welcome back, {fullName}!</Text>
            <Text style={styles.welcomeSub}>
              Glad to see you again. Check your classes, updates, and performance below.
            </Text>
          </View>
        </View>

        {/* Announcement Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.announcementIcon}>📣</Text>
            <Text style={styles.sectionTitle}>Announcement Section</Text>
            <TouchableOpacity onPress={fetchData} style={styles.refreshBtn}>
              <Ionicons name="refresh-outline" size={18} color="#17a2b8" />
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#17a2b8" />
            </View>
          )}

          {!loading && error !== '' && (
            <View style={styles.errorCard}>
              <Ionicons name="alert-circle-outline" size={20} color="#e74c3c" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {!loading && error === '' && announcements.length === 0 && (
            <View style={styles.emptyCard}>
              <Ionicons name="megaphone-outline" size={36} color="#ccc" />
              <Text style={styles.emptyText}>No announcements yet.</Text>
            </View>
          )}

          {!loading && announcements.map((item) => (
            <View key={item.id} style={styles.announcementCard}>
              <Text style={styles.announcementTitle}>{item.title}</Text>
              <Text style={styles.announcementDate}>
                {item.poster_name} · {new Date(item.created_at).toLocaleString()}
              </Text>
              <Text style={styles.announcementContent}>{item.body}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingHorizontal: 14 },
  welcomeCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 8, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, gap: 14,
  },
  avatarLarge: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#6c8096', justifyContent: 'center', alignItems: 'center' },
  welcomeText: { flex: 1 },
  welcomeName: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 4 },
  welcomeSub: { fontSize: 13, color: '#666', lineHeight: 18 },
  section: { marginBottom: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
  announcementIcon: { fontSize: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  refreshBtn: { padding: 4 },
  centered: { paddingVertical: 40, alignItems: 'center' },
  errorCard: {
    backgroundColor: '#fff5f5', borderRadius: 8, padding: 16,
    alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#fcc',
  },
  errorText: { fontSize: 13, color: '#e74c3c', textAlign: 'center' },
  retryBtn: { backgroundColor: '#e74c3c', borderRadius: 4, paddingHorizontal: 16, paddingVertical: 8 },
  retryText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyCard: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, color: '#aaa' },
  announcementCard: {
    backgroundColor: '#fff', borderRadius: 6, padding: 14, marginBottom: 10,
    borderLeftWidth: 3, borderLeftColor: '#17a2b8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  announcementTitle: { fontSize: 13, fontWeight: '700', color: '#17a2b8', marginBottom: 3 },
  announcementDate: { fontSize: 11, color: '#999', marginBottom: 8 },
  announcementContent: { fontSize: 13, color: '#444', lineHeight: 19 },
});
