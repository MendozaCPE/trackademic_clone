import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';
import { getPerformance, getSchoolYears, getSubjects, PerformanceRow } from '@/services/api';

const ALL_SEM = 'All Semesters';
const ALL_SUB = 'All Subjects';
const SEMESTERS = [ALL_SEM, 'First Semester', 'Second Semester', 'Midterm'];

export default function PerformanceScreen() {
  const [data,        setData]        = useState<PerformanceRow[]>([]);
  const [schoolYears, setSchoolYears] = useState<string[]>([]);
  const [subjects,    setSubjects]    = useState<string[]>([ALL_SUB]);
  const [selectedSY,  setSelectedSY]  = useState('');
  const [selectedSem, setSelectedSem] = useState(ALL_SEM);
  const [selectedSub, setSelectedSub] = useState(ALL_SUB);
  const [showSYPicker,  setShowSYPicker]  = useState(false);
  const [showSemPicker, setShowSemPicker] = useState(false);
  const [showSubPicker, setShowSubPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  // Load filter options once
  useEffect(() => {
    Promise.all([getSchoolYears(), getSubjects()])
      .then(([yrs, subs]) => {
        setSchoolYears(yrs);
        if (yrs.length) setSelectedSY(yrs[0]);
        setSubjects([ALL_SUB, ...subs]);
      })
      .catch(() => {});
  }, []);

  const closeAll = () => { setShowSYPicker(false); setShowSemPicker(false); setShowSubPicker(false); };

  const fetchData = useCallback(async () => {
    if (!selectedSY) return;
    setLoading(true); setError('');
    try {
      const rows = await getPerformance(
        selectedSY !== 'All School Years' ? selectedSY : undefined,
        selectedSem !== ALL_SEM ? selectedSem : undefined,
        selectedSub !== ALL_SUB ? selectedSub : undefined,
      );
      setData(rows);
    } catch (e: any) { setError(e.message ?? 'Failed to load performance.'); }
    finally { setLoading(false); }
  }, [selectedSY, selectedSem, selectedSub]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <AppLayout title="My Performance">
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          {/* School Year */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>School Year</Text>
            <TouchableOpacity style={styles.filterSelect}
              onPress={() => { closeAll(); setShowSYPicker(true); }}>
              <Text style={styles.filterText}>{selectedSY || 'Loading...'}</Text>
              <Ionicons name="chevron-down" size={14} color="#555" />
            </TouchableOpacity>
            {showSYPicker && (
              <View style={styles.dropdown}>
                {schoolYears.map((sy) => (
                  <TouchableOpacity key={sy} style={styles.dropdownItem}
                    onPress={() => { setSelectedSY(sy); setShowSYPicker(false); }}>
                    <Text style={styles.dropdownText}>{sy}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Semester */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Semester</Text>
            <TouchableOpacity style={styles.filterSelect}
              onPress={() => { closeAll(); setShowSemPicker(true); }}>
              <Text style={styles.filterText}>{selectedSem}</Text>
              <Ionicons name="chevron-down" size={14} color="#555" />
            </TouchableOpacity>
            {showSemPicker && (
              <View style={styles.dropdown}>
                {SEMESTERS.map((s) => (
                  <TouchableOpacity key={s} style={styles.dropdownItem}
                    onPress={() => { setSelectedSem(s); setShowSemPicker(false); }}>
                    <Text style={styles.dropdownText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Subject */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Enrolled Subject</Text>
            <TouchableOpacity style={styles.filterSelect}
              onPress={() => { closeAll(); setShowSubPicker(true); }}>
              <Text style={styles.filterText}>{selectedSub}</Text>
              <Ionicons name="chevron-down" size={14} color="#555" />
            </TouchableOpacity>
            {showSubPicker && (
              <View style={styles.dropdown}>
                {subjects.map((s) => (
                  <TouchableOpacity key={s} style={styles.dropdownItem}
                    onPress={() => { setSelectedSub(s); setShowSubPicker(false); }}>
                    <Text style={styles.dropdownText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Loading / Error / Empty */}
        {loading && <View style={styles.centered}><ActivityIndicator size="large" color="#17a2b8" /></View>}
        {!loading && error !== '' && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {!loading && error === '' && data.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="bar-chart-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No performance records found.</Text>
          </View>
        )}

        {/* Table */}
        {!loading && data.length > 0 && (
          <View style={styles.tableContainer}>
            <View style={styles.tableHeader}>
              <Text style={[styles.thCell, { flex: 1.2 }]}>Class Code</Text>
              <Text style={[styles.thCell, { flex: 3 }]}>Classwork Title</Text>
              <Text style={[styles.thCell, { flex: 1, textAlign: 'center' }]}>Total</Text>
              <Text style={[styles.thCell, { flex: 0.8, textAlign: 'center' }]}>Score</Text>
              <Text style={[styles.thCell, { flex: 1, textAlign: 'center' }]}>Average</Text>
            </View>
            {data.map((row, idx) => (
              <View key={idx} style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}>
                <Text style={[styles.tdCell, { flex: 1.2 }]}>{row.class_code}</Text>
                <Text style={[styles.tdCell, { flex: 3, color: '#17a2b8' }]}>{row.title}</Text>
                <Text style={[styles.tdCell, { flex: 1, textAlign: 'center' }]}>{row.total_items}</Text>
                <Text style={[styles.tdCell, { flex: 0.8, textAlign: 'center' }]}>{row.score}</Text>
                <Text style={[styles.tdCell, { flex: 1, textAlign: 'center' }]}>{row.average}%</Text>
              </View>
            ))}
          </View>
        )}
        <View style={{ height: 32 }} />
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingHorizontal: 14 },
  filtersContainer: {
    backgroundColor: '#fff', borderRadius: 6, padding: 14, marginBottom: 14,
    gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2, zIndex: 20,
  },
  filterGroup: { gap: 4, position: 'relative', zIndex: 10 },
  filterLabel: { fontSize: 12, fontWeight: '600', color: '#555' },
  filterSelect: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
    paddingHorizontal: 10, paddingVertical: 9, backgroundColor: '#fff',
  },
  filterText: { fontSize: 13, color: '#333', flex: 1 },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 4, zIndex: 100, elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownText: { fontSize: 13, color: '#333' },
  centered: { paddingVertical: 50, alignItems: 'center' },
  errorCard: { backgroundColor: '#fff5f5', borderRadius: 8, padding: 20, alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#fcc' },
  errorText: { fontSize: 13, color: '#e74c3c', textAlign: 'center' },
  retryBtn: { backgroundColor: '#e74c3c', borderRadius: 4, paddingHorizontal: 16, paddingVertical: 8 },
  retryText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyCard: { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyText: { fontSize: 14, color: '#aaa' },
  tableContainer: { backgroundColor: '#fff', borderRadius: 6, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f8f9fa', borderBottomWidth: 2, borderBottomColor: '#dee2e6', paddingHorizontal: 10, paddingVertical: 10 },
  thCell: { fontSize: 12, fontWeight: '700', color: '#333' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', backgroundColor: '#fff' },
  tableRowEven: { backgroundColor: '#fafafa' },
  tdCell: { fontSize: 12, color: '#444', lineHeight: 16 },
});
