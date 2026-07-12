import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppLayout from '@/components/AppLayout';
import { getClasses, joinClass, getSchoolYears, ClassItem } from '@/services/api';

const ALL_SY  = 'All School Years';
const ALL_SEM = 'All Semesters';
const SEMESTERS = [ALL_SEM, 'First Semester', 'Second Semester', 'Midterm'];

export default function ClassesScreen() {
  const [classes,   setClasses]   = useState<ClassItem[]>([]);
  const [schoolYears, setSchoolYears] = useState<string[]>([ALL_SY]);
  const [selectedSY,  setSelectedSY]  = useState(ALL_SY);
  const [selectedSem, setSelectedSem] = useState(ALL_SEM);
  const [showSYPicker,  setShowSYPicker]  = useState(false);
  const [showSemPicker, setShowSemPicker] = useState(false);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [joinModal, setJoinModal] = useState(false);
  const [joinCode,  setJoinCode]  = useState('');
  const [joining,   setJoining]   = useState(false);

  const fetchClasses = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [cls, yrs] = await Promise.all([
        getClasses(selectedSY !== ALL_SY ? selectedSY : undefined,
                   selectedSem !== ALL_SEM ? selectedSem : undefined),
        getSchoolYears(),
      ]);
      setClasses(cls);
      setSchoolYears([ALL_SY, ...yrs]);
    } catch (e: any) { setError(e.message ?? 'Failed to load classes.'); }
    finally { setLoading(false); }
  }, [selectedSY, selectedSem]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  const handleJoin = async () => {
    if (!joinCode.trim()) return Alert.alert('Error', 'Enter a class code.');
    setJoining(true);
    try {
      await joinClass(joinCode.trim());
      Alert.alert('Success', 'Joined class successfully!');
      setJoinModal(false); setJoinCode('');
      fetchClasses();
    } catch (e: any) { Alert.alert('Error', e.message); }
    finally { setJoining(false); }
  };

  return (
    <AppLayout>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Filters row */}
        <View style={styles.filtersRow}>
          {/* School Year */}
          <View style={styles.filterWrap}>
            <TouchableOpacity style={styles.filterSelect}
              onPress={() => { setShowSYPicker(!showSYPicker); setShowSemPicker(false); }}>
              <Text style={styles.filterText} numberOfLines={1}>{selectedSY}</Text>
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
          <View style={styles.filterWrap}>
            <TouchableOpacity style={styles.filterSelect}
              onPress={() => { setShowSemPicker(!showSemPicker); setShowSYPicker(false); }}>
              <Text style={styles.filterText} numberOfLines={1}>{selectedSem}</Text>
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

          <TouchableOpacity style={styles.joinBtn} onPress={() => setJoinModal(true)}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.joinBtnText}>Join Class</Text>
          </TouchableOpacity>
        </View>

        {/* States */}
        {loading && <View style={styles.centered}><ActivityIndicator size="large" color="#17a2b8" /></View>}

        {!loading && error !== '' && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={fetchClasses} style={styles.retryBtn}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && error === '' && classes.length === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="school-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No classes found. Join a class to get started.</Text>
          </View>
        )}

        {/* Class cards */}
        {!loading && classes.map((cls) => {
          const isActive = cls.status === 'active';
          return (
            <View key={cls.id} style={[styles.classCard, isActive && styles.classCardActive]}>
              <View style={styles.classCardTop}>
                <View style={styles.classInfo}>
                  <Text style={styles.className}>
                    {cls.subject_name?.toUpperCase()} {cls.course_name}
                  </Text>
                  <Text style={styles.classMeta}>Course Name: | {cls.course_name}</Text>
                  <Text style={styles.classMeta}>Instructor: | {cls.instructor_name}</Text>
                  <Text style={styles.classMeta}>S.Y / Semester: | {cls.school_year} | {cls.semester}</Text>
                  <Text style={styles.classMeta}>
                    Class Status: |{' '}
                    <Text style={{ color: isActive ? '#27ae60' : '#bbb', fontWeight: '600' }}>
                      {isActive ? 'Active' : 'Archived'}
                    </Text>
                  </Text>
                </View>
                <View style={styles.classAvatar}>
                  <Ionicons name="person" size={22} color="#fff" />
                </View>
              </View>

              {cls.schedules?.length > 0 && (
                <View style={styles.scheduleBox}>
                  <Text style={styles.scheduleLabel}>Schedule:</Text>
                  {cls.schedules.map((s, i) => (
                    <Text key={i} style={styles.scheduleText}>
                      {s.day}: {s.time_start} - {s.time_end}
                    </Text>
                  ))}
                </View>
              )}

              <TouchableOpacity style={styles.viewClassBtn}
                onPress={() => router.push({ pathname: '/class/[id]', params: { id: cls.id, name: `${cls.subject_name} - ${cls.course_name}` } })}>
                <Text style={styles.viewClassText}>View Class</Text>
              </TouchableOpacity>
            </View>
          );
        })}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Join Class Modal */}
      <Modal transparent animationType="fade" visible={joinModal} onRequestClose={() => setJoinModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setJoinModal(false)}>
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Join a Class</Text>
            <Text style={styles.modalSub}>Enter the class code provided by your instructor.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Class Code (e.g. ag08itoc)"
              placeholderTextColor="#aaa"
              value={joinCode}
              onChangeText={setJoinCode}
              autoCapitalize="none"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setJoinModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleJoin} disabled={joining}>
                {joining ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.confirmBtnText}>Join</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </AppLayout>
  );
}

import { Pressable } from 'react-native';

const styles = StyleSheet.create({
  scroll: { flex: 1, paddingHorizontal: 14 },
  filtersRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  filterWrap: { flex: 1, minWidth: 120, position: 'relative', zIndex: 10 },
  filterSelect: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
    paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#fff',
  },
  filterText: { fontSize: 13, color: '#333', flex: 1, marginRight: 4 },
  dropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff',
    borderWidth: 1, borderColor: '#ddd', borderRadius: 4, zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 5,
  },
  dropdownItem: { paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  dropdownText: { fontSize: 13, color: '#333' },
  joinBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#17a2b8', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 4 },
  joinBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  centered: { paddingVertical: 50, alignItems: 'center' },
  errorCard: { backgroundColor: '#fff5f5', borderRadius: 8, padding: 20, alignItems: 'center', gap: 10 },
  errorText: { fontSize: 13, color: '#e74c3c', textAlign: 'center' },
  retryBtn: { backgroundColor: '#e74c3c', borderRadius: 4, paddingHorizontal: 16, paddingVertical: 8 },
  retryText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  emptyCard: { alignItems: 'center', paddingVertical: 50, gap: 10 },
  emptyText: { fontSize: 14, color: '#aaa', textAlign: 'center', maxWidth: 240 },
  classCard: { backgroundColor: '#6c757d', borderRadius: 6, padding: 14, marginBottom: 12 },
  classCardActive: { backgroundColor: '#1a5276' },
  classCardTop: { flexDirection: 'row', marginBottom: 12 },
  classInfo: { flex: 1, gap: 3 },
  className: { fontSize: 13, fontWeight: '700', color: '#fff', marginBottom: 6 },
  classMeta: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  classAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  scheduleBox: { marginBottom: 12 },
  scheduleLabel: { fontSize: 12, fontWeight: '700', color: '#fff', marginBottom: 4 },
  scheduleText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  viewClassBtn: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.6)', borderRadius: 4, paddingVertical: 7, paddingHorizontal: 14, alignSelf: 'flex-start' },
  viewClassText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalCard: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 6 },
  modalSub: { fontSize: 13, color: '#888', marginBottom: 18 },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15, color: '#333', marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  cancelBtn: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, paddingHorizontal: 18, paddingVertical: 10 },
  cancelBtnText: { fontSize: 14, color: '#666' },
  confirmBtn: { backgroundColor: '#17a2b8', borderRadius: 6, paddingHorizontal: 22, paddingVertical: 10, minWidth: 70, alignItems: 'center' },
  confirmBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
