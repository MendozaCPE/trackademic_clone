import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';
import { getSchedule, ScheduleEntry } from '@/services/api';
import { readCache, writeCache } from '@/hooks/use-cache';

const CACHE_KEY = 'schedule';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// One teal-family color per subject (cycles through)
const SUBJECT_COLORS = [
  { bg: '#e0f2fe', border: '#0ea5e9', text: '#0369a1', icon: '#0ea5e9' },
  { bg: '#ede9fe', border: '#7c3aed', text: '#5b21b6', icon: '#7c3aed' },
  { bg: '#d1fae5', border: '#059669', text: '#065f46', icon: '#059669' },
  { bg: '#fff7ed', border: '#ea580c', text: '#9a3412', icon: '#ea580c' },
  { bg: '#fce7f3', border: '#db2777', text: '#9d174d', icon: '#db2777' },
  { bg: '#fef9c3', border: '#ca8a04', text: '#713f12', icon: '#ca8a04' },
];

function getColor(subject: string) {
  let hash = 0;
  for (let i = 0; i < subject.length; i++) hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length];
}

export default function ScheduleScreen() {
  const [entries,  setEntries]  = useState<ScheduleEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,    setError]    = useState('');
  const [selected, setSelected] = useState<number>(new Date().getDay()); // 0=Sun

  const load = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError('');
    try {
      const data = await getSchedule();
      setEntries(data);
      await writeCache(CACHE_KEY, data);
    } catch (e: any) {
      const cached = await readCache<ScheduleEntry[]>(CACHE_KEY);
      if (cached) {
        setEntries(cached);
      } else {
        setError(e.message ?? 'Failed to load schedule.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load(true);
  }, [load]);

  useEffect(() => { load(); }, [load]);

  const today = new Date().getDay();
  const dayEntries = entries.filter(e => e.day === DAYS[selected]);

  return (
    <AppLayout>
      {/* ── Sticky header ── */}
      <View style={S.stickyTop}>
        <View style={S.titleRow}>
          <View>
            <Text style={S.pageTitle}>My Schedule</Text>
            <Text style={S.pageSubtitle}>Weekly class timetable</Text>
          </View>
          <TouchableOpacity style={S.refreshBtn} onPress={load}>
            <Ionicons name="refresh" size={18} color="#17a2b8" />
          </TouchableOpacity>
        </View>

        {/* Day selector strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={S.dayStrip}
        >
          {DAYS.map((day, idx) => {
            const isToday    = idx === today;
            const isSelected = idx === selected;
            const count      = entries.filter(e => e.day === day).length;
            return (
              <TouchableOpacity
                key={day}
                style={[S.dayChip, isSelected && S.dayChipActive, isToday && !isSelected && S.dayChipToday]}
                onPress={() => setSelected(idx)}
              >
                <Text style={[S.dayShort, isSelected && S.dayShortActive]}>{DAY_SHORT[idx]}</Text>
                {count > 0 && (
                  <View style={[S.dayDot, isSelected && S.dayDotActive]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Selected day label */}
        <View style={S.selectedDayRow}>
          <Text style={S.selectedDayText}>
            {DAYS[selected]}
            {selected === today && <Text style={S.todayBadge}>  · Today</Text>}
          </Text>
          <Text style={S.classCountText}>
            {dayEntries.length} {dayEntries.length === 1 ? 'class' : 'classes'}
          </Text>
        </View>
      </View>

      {/* ── Scrollable content ── */}
      <ScrollView
        style={S.scroll}
        contentContainerStyle={S.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#17a2b8"
            colors={['#17a2b8', '#1a2e4a']}
          />
        }
      >
        {/* Loading skeletons */}
        {loading && (
          <>
            {[1, 2, 3].map(k => (
              <View key={k} style={S.skeleton}>
                <View style={S.skeletonLeft} />
                <View style={S.skeletonRight}>
                  <View style={S.skeletonLine} />
                  <View style={[S.skeletonLine, { width: '60%', marginTop: 8 }]} />
                  <View style={[S.skeletonLine, { width: '40%', marginTop: 8 }]} />
                </View>
              </View>
            ))}
          </>
        )}

        {/* Error */}
        {!loading && error !== '' && (
          <View style={S.errorCard}>
            <Ionicons name="cloud-offline-outline" size={40} color="#cbd5e1" />
            <Text style={S.errorText}>{error}</Text>
            <TouchableOpacity style={S.retryBtn} onPress={load}>
              <Text style={S.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!loading && error === '' && dayEntries.length === 0 && (
          <View style={S.emptyCard}>
            <View style={S.emptyIconWrap}>
              <Ionicons name="calendar" size={40} color="#17a2b8" />
            </View>
            <Text style={S.emptyTitle}>No Classes Today</Text>
            <Text style={S.emptySubtitle}>
              No classes scheduled on {DAYS[selected]}. Enjoy your free time!
            </Text>
          </View>
        )}

        {/* Schedule cards */}
        {!loading && dayEntries.map((item, idx) => {
          const col = getColor(item.subject_name);
          return (
            <View key={idx} style={[S.card, { borderLeftColor: col.border }]}>
              {/* Time column */}
              <View style={[S.timeCol, { backgroundColor: col.bg }]}>
                <Ionicons name="time" size={14} color={col.icon} style={{ marginBottom: 6 }} />
                <Text style={[S.timeText, { color: col.text }]}>{item.time_start}</Text>
                <View style={S.timeDivider} />
                <Text style={[S.timeText, { color: col.text }]}>{item.time_end}</Text>
              </View>

              {/* Info column */}
              <View style={S.infoCol}>
                <Text style={S.subjectName}>{item.subject_name}</Text>
                <Text style={S.courseName}>{item.course_name}</Text>

                <View style={S.metaRow}>
                  <Ionicons name="person" size={12} color="#94a3b8" />
                  <Text style={S.metaText}>{item.instructor_name}</Text>
                </View>

                <View style={S.metaRow}>
                  <Ionicons name="pricetag" size={12} color="#94a3b8" />
                  <Text style={S.metaText}>{item.class_code}</Text>
                  <View style={[
                    S.statusPill,
                    { backgroundColor: item.status === 'active' ? '#d1fae5' : '#f1f5f9' },
                  ]}>
                    <Text style={[
                      S.statusText,
                      { color: item.status === 'active' ? '#065f46' : '#64748b' },
                    ]}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={S.metaRow}>
                  <Ionicons name="school" size={12} color="#94a3b8" />
                  <Text style={S.metaText}>{item.school_year}  ·  {item.semester}</Text>
                </View>
              </View>
            </View>
          );
        })}

        {/* Full week summary at bottom */}
        {!loading && entries.length > 0 && (
          <View style={S.weekSummary}>
            <Text style={S.weekSummaryTitle}>Weekly Overview</Text>
            <View style={S.weekGrid}>
              {DAYS.map((day, idx) => {
                const cnt     = entries.filter(e => e.day === day).length;
                const isToday = idx === today;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[S.weekCell, isToday && S.weekCellToday]}
                    onPress={() => setSelected(idx)}
                  >
                    <Text style={[S.weekCellDay, isToday && S.weekCellDayToday]}>{DAY_SHORT[idx]}</Text>
                    <Text style={[S.weekCellCount, isToday && S.weekCellCountToday]}>
                      {cnt > 0 ? `${cnt}` : '—'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppLayout>
  );
}

const S = StyleSheet.create({
  // Sticky top
  stickyTop: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  titleRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14,
  },
  pageTitle:    { fontSize: 26, fontWeight: '800', color: '#1a2e4a', letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 13, color: '#94a3b8', marginTop: 2 },
  refreshBtn:   { padding: 8, backgroundColor: '#e0f2fe', borderRadius: 10, marginTop: 4 },

  // Day selector strip
  dayStrip: { paddingHorizontal: 16, paddingVertical: 6, gap: 8 },
  dayChip: {
    width: 46, height: 52, borderRadius: 14,
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0',
    justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  dayChipActive: { backgroundColor: '#1a2e4a', borderColor: '#1a2e4a' },
  dayChipToday:  { borderColor: '#17a2b8', borderWidth: 2 },
  dayShort:      { fontSize: 13, fontWeight: '700', color: '#64748b' },
  dayShortActive:{ color: '#fff' },
  dayDot:        { width: 5, height: 5, borderRadius: 3, backgroundColor: '#17a2b8' },
  dayDotActive:  { backgroundColor: '#fff' },

  selectedDayRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 10, paddingBottom: 2,
  },
  selectedDayText: { fontSize: 16, fontWeight: '700', color: '#1a2e4a' },
  todayBadge:      { fontSize: 14, fontWeight: '600', color: '#17a2b8' },
  classCountText:  { fontSize: 13, color: '#94a3b8', fontWeight: '500' },

  // Scrollable
  scroll:        { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14 },

  // Skeleton
  skeleton: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 12, gap: 14,
    borderWidth: 1, borderColor: '#f1f5f9',
  },
  skeletonLeft:  { width: 64, height: 80, borderRadius: 12, backgroundColor: '#f1f5f9' },
  skeletonRight: { flex: 1 },
  skeletonLine:  { height: 14, borderRadius: 7, backgroundColor: '#f1f5f9', width: '80%' },

  // Error / empty
  errorCard: {
    marginTop: 20, padding: 30, backgroundColor: '#fff', borderRadius: 16,
    alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#fee2e2',
  },
  errorText: { fontSize: 13, color: '#94a3b8', textAlign: 'center' },
  retryBtn:  { backgroundColor: '#1a2e4a', paddingHorizontal: 22, paddingVertical: 10, borderRadius: 10 },
  retryText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  emptyCard: {
    marginTop: 30, alignItems: 'center', paddingHorizontal: 30, gap: 12,
  },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#e0f2fe',
    justifyContent: 'center', alignItems: 'center', marginBottom: 4,
  },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: '#1a2e4a' },
  emptySubtitle: { fontSize: 14, color: '#94a3b8', textAlign: 'center', lineHeight: 20 },

  // Schedule card
  card: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 16, marginBottom: 12, overflow: 'hidden',
    borderLeftWidth: 4,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  timeCol: {
    width: 74, paddingVertical: 16, paddingHorizontal: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  timeText:    { fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 15 },
  timeDivider: { width: 20, height: 1, backgroundColor: 'rgba(0,0,0,0.12)', marginVertical: 5 },
  infoCol:     { flex: 1, padding: 14, gap: 5 },
  subjectName: { fontSize: 15, fontWeight: '800', color: '#1a2e4a', lineHeight: 20 },
  courseName:  { fontSize: 12, color: '#64748b', marginBottom: 4 },
  metaRow:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:    { fontSize: 12, color: '#64748b', flex: 1 },
  statusPill:  { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  statusText:  { fontSize: 10, fontWeight: '700' },

  // Week summary
  weekSummary: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginTop: 8, borderWidth: 1, borderColor: '#e2e8f0',
  },
  weekSummaryTitle: { fontSize: 13, fontWeight: '700', color: '#1a2e4a', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  weekGrid:         { flexDirection: 'row', justifyContent: 'space-between' },
  weekCell:         { alignItems: 'center', padding: 8, borderRadius: 10, flex: 1 },
  weekCellToday:    { backgroundColor: '#e0f2fe' },
  weekCellDay:      { fontSize: 11, fontWeight: '600', color: '#94a3b8', marginBottom: 4 },
  weekCellDayToday: { color: '#17a2b8' },
  weekCellCount:    { fontSize: 16, fontWeight: '800', color: '#cbd5e1' },
  weekCellCountToday: { color: '#17a2b8' },
});
