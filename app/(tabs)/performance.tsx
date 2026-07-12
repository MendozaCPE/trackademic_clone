import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Platform
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';
import { getPerformance, getSchoolYears, getSubjects, PerformanceRow } from '@/services/api';

const ALL_SEM = 'All Sem';
const ALL_SUB = 'All Subjects';
const SEMESTERS = [ALL_SEM, 'First Semester', 'Second Semester', 'Midterm'];

export default function PerformanceScreen() {
  const [data, setData] = useState<PerformanceRow[]>([]);
  const [schoolYears, setSchoolYears] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([ALL_SUB]);
  const [selectedSY, setSelectedSY] = useState('');
  const [selectedSem, setSelectedSem] = useState(ALL_SEM);
  const [selectedSub, setSelectedSub] = useState(ALL_SUB);
  
  const [showSYPicker, setShowSYPicker] = useState(false);
  const [showSemPicker, setShowSemPicker] = useState(false);
  const [showSubPicker, setShowSubPicker] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getSchoolYears(), getSubjects()])
      .then(([yrs, subs]) => {
        setSchoolYears(yrs);
        if (yrs.length) setSelectedSY(yrs[0]);
        setSubjects([ALL_SUB, ...subs]);
      })
      .catch(() => {});
  }, []);

  const closeAll = () => { 
    setShowSYPicker(false); 
    setShowSemPicker(false); 
    setShowSubPicker(false); 
  };

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
    } catch (e: any) { 
        setError(e.message ?? 'Unable to retrieve academic records.'); 
    } finally { 
        setLoading(false); 
    }
  }, [selectedSY, selectedSem, selectedSub]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <AppLayout>
      <View style={styles.root}>
        
        {/* ── FIXED TOP SECTION ── */}
        <View style={styles.fixedTop}>
          <View style={styles.headerTextSection}>
            <Text style={styles.screenTitle}>Performance</Text>
            <Text style={styles.screenSubtitle}>Filter results by tapping column titles</Text>
          </View>

          {/* ── TABLE HEADER WITH INTEGRATED FILTERS ── */}
          <View style={styles.tableHeader}>
            
            {/* Subject Header (Subject Filter) */}
            <View style={[styles.thContainer, { flex: 2, zIndex: 30 }]}>
              <TouchableOpacity style={styles.thButton} onPress={() => { const v = !showSubPicker; closeAll(); setShowSubPicker(v); }}>
                <Text style={styles.thText} numberOfLines={1}>Subject</Text>
                <Ionicons name="filter" size={12} color={selectedSub !== ALL_SUB ? "#17a2b8" : "#94a3b8"} />
              </TouchableOpacity>
              {showSubPicker && (
                <View style={[styles.dropdown, { left: 0 }]}>
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 250 }}>
                    {subjects.map((s) => (
                      <TouchableOpacity key={s} style={styles.dropdownOption} onPress={() => { setSelectedSub(s); setShowSubPicker(false); }}>
                        <Text style={[styles.optionText, selectedSub === s && styles.activeOption]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Classwork Header (Semester Filter) */}
            <View style={[styles.thContainer, { flex: 3, zIndex: 20 }]}>
              <TouchableOpacity style={styles.thButton} onPress={() => { const v = !showSemPicker; closeAll(); setShowSemPicker(v); }}>
                <Text style={styles.thText} numberOfLines={1}>Classwork</Text>
                <Ionicons name="filter" size={12} color={selectedSem !== ALL_SEM ? "#17a2b8" : "#94a3b8"} />
              </TouchableOpacity>
              {showSemPicker && (
                <View style={[styles.dropdown, { left: 0, right: 0 }]}>
                  {SEMESTERS.map((s) => (
                    <TouchableOpacity key={s} style={styles.dropdownOption} onPress={() => { setSelectedSem(s); setShowSemPicker(false); }}>
                      <Text style={[styles.optionText, selectedSem === s && styles.activeOption]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Score Header (School Year Filter) */}
            <View style={[styles.thContainer, { flex: 1.5, zIndex: 10 }]}>
              <TouchableOpacity style={[styles.thButton, { justifyContent: 'flex-end' }]} onPress={() => { const v = !showSYPicker; closeAll(); setShowSYPicker(v); }}>
                <Text style={styles.thText} numberOfLines={1}>SY</Text>
                <Ionicons name="filter" size={12} color="#94a3b8" />
              </TouchableOpacity>
              {showSYPicker && (
                <View style={[styles.dropdown, { right: 0, width: 140 }]}>
                  <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
                    {schoolYears.map((sy) => (
                      <TouchableOpacity key={sy} style={styles.dropdownOption} onPress={() => { setSelectedSY(sy); setShowSYPicker(false); }}>
                        <Text style={[styles.optionText, selectedSY === sy && styles.activeOption]}>{sy}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

          </View>
        </View>

        {/* ── SCROLLABLE DATA ROWS ── */}
        <View style={styles.tableArea}>
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="small" color="#1a2e4a" />
              <Text style={styles.loadingText}>Fetching Records...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchData} style={styles.retryBtn}>
                <Text style={styles.retryBtnText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : data.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>No records found</Text>
              <Text style={styles.emptySub}>Try adjusting the column filters</Text>
            </View>
          ) : (
            <ScrollView 
              style={styles.scrollTable} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View style={styles.cardContainer}>
                {data.map((row, idx) => (
                  <View key={idx} style={[styles.tr, idx === data.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={{ flex: 2 }}>
                      <Text style={styles.classCode}>{row.class_code}</Text>
                    </View>
                    <View style={{ flex: 3 }}>
                      <Text style={styles.workTitle} numberOfLines={2}>{row.title}</Text>
                    </View>
                    <View style={{ flex: 1.5, alignItems: 'flex-end' }}>
                      <View style={styles.scoreBadge}>
                        <Text style={styles.scoreText}>{row.score}</Text>
                        <Text style={styles.scoreTotal}>/{row.total_items}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f8fafc' },
  
  fixedTop: { 
    zIndex: 100, 
    backgroundColor: '#f8fafc',
  },
  headerTextSection: { paddingHorizontal: 20, paddingTop: 20, marginBottom: 15 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: '#1a2e4a', letterSpacing: -0.5 },
  screenSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },

  // Table Header Styling
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 14,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderBottomWidth: 2,
    borderBottomColor: '#f1f5f9',
  },
  thContainer: { position: 'relative' },
  thButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  thText: { fontSize: 11, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 },
  
  // Dropdowns positioned specifically under titles
  dropdown: {
    position: 'absolute', 
    top: 30, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    width: 180,
    borderWidth: 1, 
    borderColor: '#e2e8f0', 
    zIndex: 9999,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 20 },
    }),
  },
  dropdownOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  optionText: { fontSize: 13, color: '#475569', fontWeight: '500' },
  activeOption: { color: '#17a2b8', fontWeight: '700' },

  // Table Body Styling
  tableArea: { flex: 1, zIndex: 1 },
  scrollTable: { flex: 1, paddingHorizontal: 20 },
  cardContainer: {
    backgroundColor: '#fff', 
    borderBottomLeftRadius: 16, 
    borderBottomRightRadius: 16,
    borderWidth: 1, 
    borderTopWidth: 0, 
    borderColor: '#e2e8f0',
    // Matches the header's aesthetic
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  tr: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 15, paddingVertical: 18,
    borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  classCode: { fontSize: 12, fontWeight: '700', color: '#1a2e4a' },
  workTitle: { fontSize: 13, fontWeight: '600', color: '#475569', lineHeight: 18, paddingRight: 10 },
  
  scoreBadge: { 
    flexDirection: 'row', 
    alignItems: 'baseline', 
    backgroundColor: '#f8fafc', 
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 10 
  },
  scoreText: { fontSize: 14, fontWeight: '800', color: '#1a2e4a' },
  scoreTotal: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },

  // States
  centerBox: { paddingVertical: 60, alignItems: 'center' },
  loadingText: { fontSize: 13, color: '#94a3b8', marginTop: 10 },
  errorCard: { margin: 20, padding: 30, backgroundColor: '#fff', borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#fee2e2' },
  errorText: { color: '#94a3b8', textAlign: 'center', marginBottom: 12 },
  retryBtn: { backgroundColor: '#1a2e4a', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  emptyCard: { paddingVertical: 80, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#475569' },
  emptySub: { fontSize: 13, color: '#94a3b8', marginTop: 4 },
});