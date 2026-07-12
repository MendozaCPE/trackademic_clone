import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';

const performanceData = [
  { classCode: 'ag08itoc', title: 'HTML Activity 1', totalItems: 100, score: 94, average: '94.00%' },
  { classCode: 'ag08itoc', title: 'HTML Activity 2 & Assignment 1', totalItems: 100, score: 100, average: '100.00%' },
  { classCode: 'ag08itoc', title: 'HTML and CSS Quiz 1', totalItems: 20, score: 17, average: '85.00%' },
  { classCode: 'ag08itoc', title: 'Css Activity', totalItems: 100, score: 100, average: '100.00%' },
  { classCode: 'ag08itoc', title: 'Bootstrap Activity', totalItems: 100, score: 90, average: '90.00%' },
  { classCode: 'ag08itoc', title: 'Midterm Examination Results', totalItems: 60, score: 45, average: '75.00%' },
  { classCode: 'ag08itoc', title: 'Midterm Lab Exam Result', totalItems: 100, score: 100, average: '100.00%' },
  { classCode: 'ag08itoc', title: 'Php Mysql, Session, Crud with Login and Logout features', totalItems: 100, score: 100, average: '100.00%' },
  { classCode: 'ag08itoc', title: 'Chapter Test', totalItems: 30, score: 26, average: '86.67%' },
  { classCode: 'ag08itoc', title: 'Codeigniter 4 Setup Activity', totalItems: 100, score: 100, average: '100.00%' },
  { classCode: 'ag08itoc', title: 'Final Project Presentation', totalItems: 50, score: 42, average: '84.00%' },
  { classCode: 'ag08itoc', title: 'Final Examination Results', totalItems: 60, score: 40, average: '66.67%' },
  { classCode: 'fla2efor', title: 'Lab activity 1 - Basic react native app', totalItems: 100, score: 80, average: '80.00%' },
  { classCode: 'fla2efor', title: 'Assignment No.1 (about yourself app)', totalItems: 100, score: 100, average: '100.00%' },
  { classCode: 'fla2efor', title: 'Lab Activity - weather & app application', totalItems: 100, score: 100, average: '100.00%' },
];

const schoolYears = ['2025-2026', '2024-2025', '2023-2024'];
const semesters = ['All Semesters', 'First Semester', 'Second Semester', 'Midterm'];
const subjects = ['All Subjects', 'Web Systems and Technologies', 'Application Development'];

export default function PerformanceScreen() {
  const [selectedSY, setSelectedSY] = useState('2025-2026');
  const [selectedSem, setSelectedSem] = useState('All Semesters');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [showSYPicker, setShowSYPicker] = useState(false);
  const [showSemPicker, setShowSemPicker] = useState(false);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const closeAll = () => {
    setShowSYPicker(false);
    setShowSemPicker(false);
    setShowSubjectPicker(false);
  };

  return (
    <AppLayout title="My Performance">
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Filters */}
        <View style={styles.filtersContainer}>
          {/* School Year */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>School Year</Text>
            <TouchableOpacity
              style={styles.filterSelect}
              onPress={() => { closeAll(); setShowSYPicker(true); }}
            >
              <Text style={styles.filterText}>{selectedSY}</Text>
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

          {/* Semester */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Semester</Text>
            <TouchableOpacity
              style={styles.filterSelect}
              onPress={() => { closeAll(); setShowSemPicker(true); }}
            >
              <Text style={styles.filterText}>{selectedSem}</Text>
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

          {/* Subject */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Enrolled Subject</Text>
            <TouchableOpacity
              style={styles.filterSelect}
              onPress={() => { closeAll(); setShowSubjectPicker(true); }}
            >
              <Text style={styles.filterText}>{selectedSubject}</Text>
              <Ionicons name="chevron-down" size={14} color="#555" />
            </TouchableOpacity>
            {showSubjectPicker && (
              <View style={styles.dropdown}>
                {subjects.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={styles.dropdownItem}
                    onPress={() => { setSelectedSubject(s); setShowSubjectPicker(false); }}
                  >
                    <Text style={styles.dropdownText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Table */}
        <View style={styles.tableContainer}>
          {/* Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.thCell, { flex: 1.2 }]}>Class Code</Text>
            <Text style={[styles.thCell, { flex: 3 }]}>Classwork Title</Text>
            <Text style={[styles.thCell, { flex: 1, textAlign: 'center' }]}>Total Items</Text>
            <Text style={[styles.thCell, { flex: 0.8, textAlign: 'center' }]}>Score</Text>
            <Text style={[styles.thCell, { flex: 1, textAlign: 'center' }]}>Average</Text>
          </View>

          {/* Rows */}
          {performanceData.map((row, idx) => (
            <View
              key={idx}
              style={[styles.tableRow, idx % 2 === 0 && styles.tableRowEven]}
            >
              <Text style={[styles.tdCell, { flex: 1.2 }]}>{row.classCode}</Text>
              <Text style={[styles.tdCell, { flex: 3, color: '#17a2b8' }]}>{row.title}</Text>
              <Text style={[styles.tdCell, { flex: 1, textAlign: 'center' }]}>{row.totalItems}</Text>
              <Text style={[styles.tdCell, { flex: 0.8, textAlign: 'center' }]}>{row.score}</Text>
              <Text style={[styles.tdCell, { flex: 1, textAlign: 'center' }]}>{row.average}</Text>
            </View>
          ))}
        </View>

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
  filtersContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 14,
    marginBottom: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 20,
  },
  filterGroup: {
    gap: 4,
    position: 'relative',
    zIndex: 10,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  filterSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: '#fff',
  },
  filterText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
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
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
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
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: 6,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 2,
    borderBottomColor: '#dee2e6',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  thCell: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  tableRowEven: {
    backgroundColor: '#fafafa',
  },
  tdCell: {
    fontSize: 12,
    color: '#444',
    lineHeight: 16,
  },
});
