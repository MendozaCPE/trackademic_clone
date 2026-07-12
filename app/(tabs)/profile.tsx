import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';

const TABS = ['Personal Info', 'Download Qr Code'];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('Personal Info');

  // Profile form state
  const [firstname, setFirstname] = useState('Christian Paul');
  const [middleInitial, setMiddleInitial] = useState('E');
  const [lastname, setLastname] = useState('Mendoza');
  const [section, setSection] = useState('BSIT BA-3103');
  const [yearLevel, setYearLevel] = useState('3');
  const [email, setEmail] = useState('22-03592@g.batstate-u.edu.ph');

  return (
    <AppLayout title="Welcome: Christian Paul Mendoza" breadcrumb={['🏠', 'My Dashboard']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Cover Banner */}
        <View style={styles.coverContainer}>
          <View style={styles.coverBg}>
            {/* Gradient-like layered background */}
            <View style={styles.coverLayer1} />
            <View style={styles.coverLayer2} />

            {/* Update Profile Picture button */}
            <TouchableOpacity style={styles.updatePicBtn}>
              <Text style={styles.updatePicText}>Update Profile Picture</Text>
            </TouchableOpacity>
          </View>

          {/* Profile info row overlapping cover bottom */}
          <View style={styles.profileInfoRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={36} color="#fff" />
              </View>
            </View>
            <View style={styles.profileNameCol}>
              <Text style={styles.profileFullName}>Christian Paul Mendoza</Text>
              <Text style={styles.profileSection}>BSIT BA-3103</Text>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'Personal Info' && (
            <PersonalInfoTab
              firstname={firstname}
              middleInitial={middleInitial}
              lastname={lastname}
              section={section}
              yearLevel={yearLevel}
              email={email}
              setFirstname={setFirstname}
              setMiddleInitial={setMiddleInitial}
              setLastname={setLastname}
              setSection={setSection}
              setYearLevel={setYearLevel}
              setEmail={setEmail}
            />
          )}
          {activeTab === 'Download Qr Code' && <QrCodeTab />}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppLayout>
  );
}

/* ─── Personal Info Tab ─────────────────────────────────── */
function PersonalInfoTab({
  firstname, middleInitial, lastname, section, yearLevel, email,
  setFirstname, setMiddleInitial, setLastname, setSection, setYearLevel, setEmail,
}: any) {
  return (
    <View style={styles.card}>
      {/* About Me header */}
      <View style={styles.aboutMeRow}>
        <Text style={styles.aboutMeLabel}>About Me</Text>
        <View style={styles.editIconBox}>
          <Ionicons name="pencil" size={14} color="#fff" />
        </View>
      </View>

      {/* Row: Firstname / Middle Initial / Lastname */}
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 2 }]}>
          <Text style={styles.fieldLabel}>Firstname</Text>
          <TextInput
            style={styles.fieldInput}
            value={firstname}
            onChangeText={setFirstname}
          />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Middle Initial</Text>
          <TextInput
            style={styles.fieldInput}
            value={middleInitial}
            onChangeText={setMiddleInitial}
          />
        </View>
        <View style={[styles.formGroup, { flex: 2 }]}>
          <Text style={styles.fieldLabel}>Lastname</Text>
          <TextInput
            style={styles.fieldInput}
            value={lastname}
            onChangeText={setLastname}
          />
        </View>
      </View>

      {/* Row: Section / Year Level */}
      <View style={styles.formRow}>
        <View style={[styles.formGroup, { flex: 2 }]}>
          <Text style={styles.fieldLabel}>Section</Text>
          <TextInput
            style={styles.fieldInput}
            value={section}
            onChangeText={setSection}
          />
        </View>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.fieldLabel}>Year Level</Text>
          <TextInput
            style={styles.fieldInput}
            value={yearLevel}
            onChangeText={setYearLevel}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Email */}
      <View style={styles.formGroup}>
        <Text style={styles.fieldLabel}>Email</Text>
        <TextInput
          style={styles.fieldInput}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Update Profile Button */}
      <View style={styles.updateBtnRow}>
        <TouchableOpacity style={styles.updateBtn}>
          <Text style={styles.updateBtnText}>Update Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── QR Code Tab ────────────────────────────────────────── */
function QrCodeTab() {
  return (
    <View style={styles.card}>
      <View style={styles.qrContainer}>
        <View style={styles.qrPlaceholder}>
          <Ionicons name="qr-code-outline" size={100} color="#17a2b8" />
        </View>
        <Text style={styles.qrName}>Christian Paul Mendoza</Text>
        <Text style={styles.qrSection}>BSIT BA-3103 | 22-03592</Text>
        <TouchableOpacity style={styles.downloadQrBtn}>
          <Ionicons name="download-outline" size={16} color="#fff" />
          <Text style={styles.downloadQrText}>Download QR Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },

  // Cover
  coverContainer: {
    marginBottom: 0,
  },
  coverBg: {
    height: 170,
    backgroundColor: '#6b8e5e',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  coverLayer1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#4a7c59',
    opacity: 0.7,
  },
  coverLayer2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#c8a84b',
    opacity: 0.35,
  },
  updatePicBtn: {
    backgroundColor: '#17a2b8',
    paddingHorizontal: 16,
    paddingVertical: 10,
    margin: 14,
    borderRadius: 4,
  },
  updatePicText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  profileInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  avatarWrap: {
    marginTop: -28,
    marginRight: 12,
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#6c8096',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileNameCol: {
    flex: 1,
    paddingBottom: 4,
  },
  profileFullName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#222',
  },
  profileSection: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
    marginBottom: 0,
  },
  tabItem: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#17a2b8',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#17a2b8',
    fontWeight: '600',
  },

  // Tab content
  tabContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  aboutMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  aboutMeLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  editIconBox: {
    width: 26,
    height: 26,
    backgroundColor: '#17a2b8',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Form
  formRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 0,
  },
  formGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
    fontWeight: '500',
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14,
    color: '#333',
    backgroundColor: '#fff',
  },
  updateBtnRow: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  updateBtn: {
    backgroundColor: '#17a2b8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },
  updateBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // QR
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    borderWidth: 2,
    borderColor: '#17a2b8',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fffe',
  },
  qrName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  qrSection: {
    fontSize: 13,
    color: '#666',
  },
  downloadQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#17a2b8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 8,
  },
  downloadQrText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
