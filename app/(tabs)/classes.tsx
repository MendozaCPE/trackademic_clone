import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput, Pressable,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppLayout from '@/components/AppLayout';
import { getClasses, joinClass, getSchoolYears, ClassItem } from '@/services/api';

const ALL_SY = 'All School Years';
const ALL_SEM = 'All Semesters';
const SEMESTERS = [ALL_SEM, 'First Semester', 'Second Semester', 'Midterm'];

export default function ClassesScreen() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [schoolYears, setSchoolYears] = useState<string[]>([ALL_SY]);
  const [selectedSY, setSelectedSY] = useState(ALL_SY);
  const [selectedSem, setSelectedSem] = useState(ALL_SEM);
  const [showSYPicker, setShowSYPicker] = useState(false);
  const [showSemPicker, setShowSemPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinModal, setJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [cls, yrs] = await Promise.all([
        getClasses(selectedSY !== ALL_SY ? selectedSY : undefined,
          selectedSem !== ALL_SEM ? selectedSem : undefined),
        getSchoolYears(),
      ]);
      setClasses(cls);
      setSchoolYears([ALL_SY, ...yrs]);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load enrollment data.');
    } finally {
      setLoading(false);
    }
  }, [selectedSY, selectedSem]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const handleJoin = async () => {
    if (!joinCode.trim()) return Alert.alert('Required', 'Please enter a class code.');
    setJoining(true);
    try {
      await joinClass(joinCode.trim());
      setJoinModal(false);
      setJoinCode('');
      fetchClasses();
      Alert.alert('Success', 'You have successfully joined the class.');
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setJoining(false);
    }
  };

  return (
    <AppLayout>
      <View style={styles.container}>

        {/* ── Fixed top: title, join button, filters ── */}
        <View style={styles.stickyTop}>
          <View style={styles.topActions}>
            <View style={styles.titleGroup}>
              <Text style={styles.screenTitle}>Course List</Text>
              <Text style={styles.screenSubtitle}>Manage your active enrollments</Text>
            </View>
            <TouchableOpacity style={styles.joinPrimaryBtn} onPress={() => setJoinModal(true)}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.joinPrimaryText}>Join Class</Text>
            </TouchableOpacity>
          </View>

          {/* Filter Bar */}
          <View style={styles.filtersContainer}>
            <View style={styles.filterGroup}>
              {/* SY Filter */}
              <View style={styles.filterColumn}>
                <TouchableOpacity
                  style={[styles.filterBtn, showSYPicker && styles.filterBtnActive]}
                  onPress={() => { setShowSYPicker(!showSYPicker); setShowSemPicker(false); }}
                >
                  <Text style={styles.filterBtnLabel} numberOfLines={1}>{selectedSY}</Text>
                  <Ionicons name="chevron-down" size={14} color="#64748b" />
                </TouchableOpacity>
                {showSYPicker && (
                  <View style={styles.dropdownMenu}>
                    {schoolYears.map((sy) => (
                      <TouchableOpacity key={sy} style={styles.dropdownOption}
                        onPress={() => { setSelectedSY(sy); setShowSYPicker(false); }}>
                        <Text style={[styles.optionText, selectedSY === sy && styles.optionTextActive]}>{sy}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Sem Filter */}
              <View style={styles.filterColumn}>
                <TouchableOpacity
                  style={[styles.filterBtn, showSemPicker && styles.filterBtnActive]}
                  onPress={() => { setShowSemPicker(!showSemPicker); setShowSYPicker(false); }}
                >
                  <Text style={styles.filterBtnLabel} numberOfLines={1}>{selectedSem}</Text>
                  <Ionicons name="chevron-down" size={14} color="#64748b" />
                </TouchableOpacity>
                {showSemPicker && (
                  <View style={styles.dropdownMenu}>
                    {SEMESTERS.map((s) => (
                      <TouchableOpacity key={s} style={styles.dropdownOption}
                        onPress={() => { setSelectedSem(s); setShowSemPicker(false); }}>
                        <Text style={[styles.optionText, selectedSem === s && styles.optionTextActive]}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* ── Scrollable class cards only ── */}
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {loading ? (
          <View style={styles.centerPad}>
            <ActivityIndicator size="small" color="#1a2e4a" />
            <Text style={styles.loaderText}>Loading academic records...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={32} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchClasses} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="library-outline" size={40} color="#cbd5e1" />
            </View>
            <Text style={styles.emptyTitle}>No Classes Found</Text>
            <Text style={styles.emptySub}>You haven't joined any classes for this selection.</Text>
          </View>
        ) : (
          classes.map((cls) => {
            const isActive = cls.status === 'active';
            return (
              <TouchableOpacity 
                key={cls.id} 
                activeOpacity={0.8}
                style={styles.classCard}
                onPress={() => router.push({ pathname: '/class/[id]', params: { id: cls.id, name: `${cls.subject_name}` } })}
              >
                {/* Left Indicator */}
                <View style={[styles.statusIndicator, { backgroundColor: isActive ? '#17a2b8' : '#94a3b8' }]} />
                
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subjectCode}>{cls.subject_name?.toUpperCase()}</Text>
                      <Text style={styles.courseName} numberOfLines={1}>{cls.course_name}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isActive ? '#f0fdfa' : '#f8fafc' }]}>
                      <Text style={[styles.statusBadgeText, { color: isActive ? '#0d9488' : '#64748b' }]}>
                        {isActive ? 'Active' : 'Archived'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                      <Ionicons name="person-outline" size={14} color="#94a3b8" />
                      <Text style={styles.metaLabel}>{cls.instructor_name}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                      <Text style={styles.metaLabel}>{cls.school_year} • {cls.semester}</Text>
                    </View>
                  </View>

                  {cls.schedules?.length > 0 && (
                    <View style={styles.scheduleContainer}>
                      {cls.schedules.map((s, i) => (
                        <View key={i} style={styles.scheduleRow}>
                          <Ionicons name="time-outline" size={12} color="#17a2b8" />
                          <Text style={styles.scheduleText}>{s.day}: {s.time_start} - {s.time_end}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  
                  <View style={styles.cardFooter}>
                    <Text style={styles.viewLink}>Enter Classroom</Text>
                    <Ionicons name="arrow-forward" size={14} color="#17a2b8" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* Join Class Modal */}
      <Modal transparent animationType="fade" visible={joinModal} onRequestClose={() => setJoinModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setJoinModal(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconBg}>
                <Ionicons name="enter-outline" size={24} color="#1a2e4a" />
              </View>
              <Text style={styles.modalTitle}>Join New Class</Text>
              <Text style={styles.modalSub}>Enter the 8-character code from your instructor.</Text>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="e.g. ag08itoc"
              placeholderTextColor="#94a3b8"
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="none"
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setJoinModal(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirm, !joinCode && { opacity: 0.5 }]} 
                onPress={handleJoin} 
                disabled={joining || !joinCode}
              >
                {joining ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.modalConfirmText}>Join Class</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  stickyTop: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 4,
    zIndex: 50,
  },
  list: { flex: 1, backgroundColor: '#f8fafc' },
  listContent: { paddingHorizontal: 20, paddingTop: 14 },
  topActions: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleGroup: { flex: 1 },
  screenTitle: { fontSize: 24, fontWeight: '800', color: '#1a2e4a', letterSpacing: -0.5 },
  screenSubtitle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  
  joinPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a2e4a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  joinPrimaryText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Filters
  filtersContainer: { paddingHorizontal: 20, marginBottom: 12 },
  filterGroup: { flexDirection: 'row', gap: 10 },
  filterColumn: { flex: 1, position: 'relative' },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  filterBtnActive: { borderColor: '#17a2b8', backgroundColor: '#f0f9fa' },
  filterBtnLabel: { fontSize: 12, fontWeight: '600', color: '#475569' },
  
  dropdownMenu: {
    position: 'absolute',
    top: '110%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 100,
  },
  dropdownOption: { padding: 10, borderRadius: 8 },
  optionText: { fontSize: 13, color: '#64748b' },
  optionTextActive: { color: '#17a2b8', fontWeight: '700' },

  // Class Card
  classCard: {
    backgroundColor: '#fff',
    marginBottom: 15,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  statusIndicator: { width: 5 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  subjectCode: { fontSize: 16, fontWeight: '800', color: '#1a2e4a' },
  courseName: { fontSize: 13, color: '#64748b', fontWeight: '500', marginTop: 1 },
  
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  metaGrid: { gap: 6, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaLabel: { fontSize: 12, color: '#64748b', fontWeight: '500' },

  scheduleContainer: {
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scheduleText: { fontSize: 11, color: '#475569', fontWeight: '500' },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 4,
  },
  viewLink: { fontSize: 12, fontWeight: '700', color: '#17a2b8' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: '#fff', width: '100%', borderRadius: 20, padding: 24 },
  modalHeader: { alignItems: 'center', marginBottom: 20 },
  modalIconBg: { width: 50, height: 50, backgroundColor: '#f1f5f9', borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1a2e4a' },
  modalSub: { fontSize: 13, color: '#64748b', textAlign: 'center', marginTop: 4, lineHeight: 18 },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1a2e4a',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 20,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, padding: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#f1f5f9' },
  modalCancelText: { fontWeight: '700', color: '#64748b' },
  modalConfirm: { flex: 2, padding: 14, alignItems: 'center', borderRadius: 12, backgroundColor: '#1a2e4a' },
  modalConfirmText: { fontWeight: '700', color: '#fff' },

  // States
  centerPad: { paddingVertical: 60, alignItems: 'center' },
  loaderText: { fontSize: 13, color: '#94a3b8', marginTop: 10 },
  errorContainer: { padding: 40, alignItems: 'center', gap: 12 },
  errorText: { color: '#64748b', textAlign: 'center' },
  retryBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1a2e4a', borderRadius: 10 },
  retryBtnText: { color: '#fff', fontWeight: '600' },
  emptyContainer: { paddingVertical: 60, alignItems: 'center' },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f1f5f9', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#475569' },
  emptySub: { fontSize: 14, color: '#94a3b8', textAlign: 'center', marginTop: 4, paddingHorizontal: 40 },
});