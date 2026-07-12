import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AppLayout from '@/components/AppLayout';

const classes = [
  {
    id: 1,
    code: 'ag08itoc',
    name: 'WEB SYSTEMS AND TECHNOLOGIES BSIT BA-3103',
    courseName: 'Web Systems and Technologies',
    instructor: 'Jason C. Magsino',
    sy: '2025-2026 | First Semester',
    status: 'Archived',
    statusColor: '#6c757d',
    schedule: ['Tuesday: 02:00 PM - 04:00 PM', 'Friday: 04:00 PM - 07:00 PM'],
  },
  {
    id: 2,
    code: 'fla2efor',
    name: 'APPLICATION DEVELOPMENT - BSIT BA 3303 BSIT BA-3103',
    courseName: 'Application Development and Emerging Technologies',
    instructor: 'Jovan L. Magano',
    sy: '2025-2026 | Midterm',
    status: 'Active',
    statusColor: '#1a5276',
    schedule: [
      'Monday: 01:00 PM - 06:00 PM',
      'Wednesday: 01:00 PM - 06:00 PM',
      'Saturday: 07:00 AM - 12:00 PM',
    ],
  },
];

const schoolYears = ['All School Years', '2025-2026', '2024-2025'];
const semesters = ['All Semesters', 'First Semester', 'Second Semester', 'Midterm'];

export default function ClassesScreen() {
  const [selectedSY, setSelectedSY] = useState('All School Years');
  const [selectedSem, setSelectedSem] = useState('All Semesters');
  const [showSYPicker, setShowSYPicker] = useState(false);
  const [showSemPicker, setShowSemPicker] = useState(false);

  return (
    <AppLayout title="My Classes">
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filtersRow}>
          <View style={styles.filterWrap}>
            <TouchableOpacity
              style={styles.filterSelect}
              onPress={() => { setShowSYPicker(!showSYPicker); setShowSemPicker(false); }}
            >
              <Text style={styles.filterText} numberOfLines={1}>{selectedSY}</Text>
              <Ionicons name="chevron-down" size={14} color="#555" />
            </TouchableOpacity>
            {showSYPicker && (
              <View style={styles.dropdown}>
                {schoolYears.map((sy) => (
                  <TouchableOpacity
                    key={sy}
                    style={styles.dropdownItem}
                    onPress={() => { setSelectedSY(sy); setShowSYPicker(false); }}
                  >
                    <Text style={styles.dropdownText}>{sy}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.filterWrap}>
            <TouchableOpacity
              style={styles.filterSelect}
              onPress={() => { setShowSemPicker(!showSemPicker); setShowSYPicker(false); }}
            >
              <Text style={styles.filterText} numberOfLines={1}>{selectedSem}</Text>
              <Ionicons name="chevron-down" size={14} color="#555" />
            </TouchableOpacity>
            {showSemPicker && (
              <View style={styles.dropdown}>
                {semesters.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.dropdownItem}
                    onPress={() => { setSelectedSem(s); setShowSemPicker(false); }}
                  >
                    <Text style={styles.dropdownText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.joinBtn}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.joinBtnText}>Join Class</Text>
          </TouchableOpacity>
        </View>

        {/* Class cards */}
        {classes.map((cls) => (
          <View
            key={cls.id}
            style={[
              styles.classCard,
              cls.status === 'Active' && styles.classCardActive,
            ]}
          >
            <View style={styles.classCardTop}>
              <View style={styles.classInfo}>
                <Text style={[styles.className, cls.status === 'Active' && styles.classNameActive]}>
                  {cls.name}
                </Text>
                <Text style={styles.classMeta}>Course Name: | {cls.courseName}</Text>
                <Text style={styles.classMeta}>Instructor: | {cls.instructor}</Text>
                <Text style={styles.classMeta}>S.Y / Semester: | {cls.sy}</Text>
                <Text style={styles.classMeta}>
                  Class Status: |{' '}
                  <Text style={{ color: cls.status === 'Active' ? '#27ae60' : '#888', fontWeight: '600' }}>
                    {cls.status}
                  </Text>
                </Text>
              </View>
              <View style={styles.classAvatar}>
                <Ionicons name="person" size={22} color="#fff" />
              </View>
            </View>

            <View style={styles.scheduleBox}>
              <Text style={styles.scheduleLabel}>Schedule:</Text>
              {cls.schedule.map((s, i) => (
                <Text key={i} style={styles.scheduleText}>{s}</Text>
              ))}
            </View>

            <TouchableOpacity
              style={styles.viewClassBtn}
              onPress={() => router.push({ pathname: '/class/[id]', params: { id: cls.id, name: cls.name } })}
            >
              <Text style={styles.viewClassText}>View Class</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    paddingHorizontal: 14,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterWrap: {
    flex: 1,
    minWidth: 120,
    position: 'relative',
    zIndex: 10,
  },
  filterSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    marginRight: 4,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownText: {
    fontSize: 13,
    color: '#333',
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#17a2b8',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 4,
  },
  joinBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  classCard: {
    backgroundColor: '#6c757d',
    borderRadius: 6,
    padding: 14,
    marginBottom: 12,
  },
  classCardActive: {
    backgroundColor: '#1a5276',
  },
  classCardTop: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  classInfo: {
    flex: 1,
    gap: 3,
  },
  className: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  classNameActive: {
    color: '#fff',
  },
  classMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  classAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  scheduleBox: {
    marginBottom: 12,
  },
  scheduleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  scheduleText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 18,
  },
  viewClassBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    borderRadius: 4,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  viewClassText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
