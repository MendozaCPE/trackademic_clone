import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { updateMe } from '@/services/api';

const TABS = ['Personal Info', 'QR Code'] as const;
type Tab = typeof TABS[number];

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('Personal Info');
  const [saving,    setSaving]    = useState(false);

  // Editable fields
  const [firstname,     setFirstname]     = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastname,      setLastname]      = useState('');
  const [section,       setSection]       = useState('');
  const [yearLevel,     setYearLevel]     = useState('');
  const [email,         setEmail]         = useState('');

  useEffect(() => {
    if (user) {
      setFirstname(user.first_name     ?? '');
      setMiddleInitial(user.middle_initial ?? '');
      setLastname(user.last_name       ?? '');
      setSection(user.section          ?? '');
      setYearLevel(String(user.year_level ?? ''));
      setEmail(user.email              ?? '');
    }
  }, [user]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateMe({
        first_name:     firstname,
        middle_initial: middleInitial,
        last_name:      lastname,
        section,
        year_level:     parseInt(yearLevel) || 0,
        email,
      });
      if (user) {
        refreshUser({
          ...user,
          first_name:     firstname,
          middle_initial: middleInitial,
          last_name:      lastname,
          section,
          year_level:     parseInt(yearLevel) || 0,
          email,
        });
      }
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const fullName = user ? `${user.first_name} ${user.last_name}` : '';
  const srCode   = user?.sr_code ?? '';

  return (
    <AppLayout>
      <ScrollView style={S.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Cover + avatar ── */}
        <View style={S.coverContainer}>
          <View style={S.coverBg}>
            <View style={S.coverLayer1} />
            <View style={S.coverLayer2} />
            <TouchableOpacity style={S.updatePicBtn}>
              <Ionicons name="camera-outline" size={15} color="#fff" />
              <Text style={S.updatePicText}>Update Profile Picture</Text>
            </TouchableOpacity>
          </View>
          <View style={S.profileInfoRow}>
            <View style={S.avatarWrap}>
              <View style={S.avatarCircle}>
                <Ionicons name="person" size={36} color="#fff" />
              </View>
            </View>
            <View style={S.profileNameCol}>
              <Text style={S.profileFullName}>{fullName}</Text>
              <Text style={S.profileSub}>{user?.section ?? ''}  ·  Year {user?.year_level ?? ''}</Text>
              <Text style={S.profileSrCode}>SR Code: {srCode}</Text>
            </View>
          </View>
        </View>

        {/* ── Tab bar ── */}
        <View style={S.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[S.tabItem, activeTab === tab && S.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Ionicons
                name={tab === 'Personal Info' ? 'person-outline' : 'qr-code-outline'}
                size={15}
                color={activeTab === tab ? '#17a2b8' : '#888'}
                style={{ marginRight: 5 }}
              />
              <Text style={[S.tabText, activeTab === tab && S.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Tab content ── */}
        <View style={S.tabContent}>
          {activeTab === 'Personal Info' && (
            <PersonalInfoTab
              firstname={firstname}       setFirstname={setFirstname}
              middleInitial={middleInitial} setMiddleInitial={setMiddleInitial}
              lastname={lastname}         setLastname={setLastname}
              section={section}           setSection={setSection}
              yearLevel={yearLevel}       setYearLevel={setYearLevel}
              email={email}               setEmail={setEmail}
              srCode={srCode}
              username={user?.username ?? ''}
              role={user?.role ?? 'student'}
              saving={saving}
              onSave={handleUpdate}
            />
          )}
          {activeTab === 'QR Code' && (
            <QrCodeTab
              srCode={srCode}
              fullName={fullName}
              section={user?.section ?? ''}
              email={user?.email ?? ''}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </AppLayout>
  );
}

// ── Personal Info Tab ─────────────────────────────────────────────────────────
function PersonalInfoTab({
  firstname, setFirstname,
  middleInitial, setMiddleInitial,
  lastname, setLastname,
  section, setSection,
  yearLevel, setYearLevel,
  email, setEmail,
  srCode, username, role,
  saving, onSave,
}: any) {
  return (
    <View style={S.card}>
      <View style={S.sectionHeader}>
        <Ionicons name="person-circle-outline" size={18} color="#17a2b8" />
        <Text style={S.sectionTitle}>About Me</Text>
        <View style={S.editBadge}><Ionicons name="pencil" size={12} color="#fff" /></View>
      </View>

      {/* Read-only info */}
      <View style={S.readOnlyRow}>
        <View style={S.readOnlyItem}>
          <Text style={S.roLabel}>SR Code</Text>
          <Text style={S.roValue}>{srCode}</Text>
        </View>
        <View style={S.readOnlyItem}>
          <Text style={S.roLabel}>Username</Text>
          <Text style={S.roValue}>{username}</Text>
        </View>
        <View style={S.readOnlyItem}>
          <Text style={S.roLabel}>Role</Text>
          <Text style={[S.roValue, S.roleBadge]}>{role.charAt(0).toUpperCase() + role.slice(1)}</Text>
        </View>
      </View>

      <View style={S.divider} />

      {/* Name row */}
      <View style={S.formRow}>
        <View style={[S.formGroup, { flex: 2 }]}>
          <Text style={S.fieldLabel}>First Name</Text>
          <TextInput style={S.fieldInput} value={firstname} onChangeText={setFirstname} />
        </View>
        <View style={[S.formGroup, { flex: 1 }]}>
          <Text style={S.fieldLabel}>M.I.</Text>
          <TextInput style={S.fieldInput} value={middleInitial} onChangeText={setMiddleInitial} maxLength={3} />
        </View>
        <View style={[S.formGroup, { flex: 2 }]}>
          <Text style={S.fieldLabel}>Last Name</Text>
          <TextInput style={S.fieldInput} value={lastname} onChangeText={setLastname} />
        </View>
      </View>

      {/* Section / Year */}
      <View style={S.formRow}>
        <View style={[S.formGroup, { flex: 2 }]}>
          <Text style={S.fieldLabel}>Section</Text>
          <TextInput style={S.fieldInput} value={section} onChangeText={setSection} />
        </View>
        <View style={[S.formGroup, { flex: 1 }]}>
          <Text style={S.fieldLabel}>Year Level</Text>
          <TextInput
            style={S.fieldInput} value={yearLevel}
            onChangeText={setYearLevel} keyboardType="numeric" maxLength={1}
          />
        </View>
      </View>

      {/* Email */}
      <View style={S.formGroup}>
        <Text style={S.fieldLabel}>Email Address</Text>
        <TextInput
          style={S.fieldInput} value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none"
        />
      </View>

      {/* Save button */}
      <TouchableOpacity
        style={[S.saveBtn, saving && S.saveBtnDisabled]}
        onPress={onSave}
        disabled={saving}
      >
        {saving
          ? <ActivityIndicator color="#fff" size="small" />
          : <>
              <Ionicons name="checkmark-circle-outline" size={16} color="#fff" />
              <Text style={S.saveBtnText}>Update Profile</Text>
            </>
        }
      </TouchableOpacity>
    </View>
  );
}

// ── QR Code Tab ───────────────────────────────────────────────────────────────
function QrCodeTab({ srCode, fullName, section, email }: {
  srCode: string; fullName: string; section: string; email: string;
}) {
  // QR content — JSON with all student identity info
  const qrValue = JSON.stringify({
    sr_code:  srCode,
    name:     fullName,
    section,
    email,
    system:   'Trackademic',
  });

  return (
    <View style={S.card}>
      <View style={S.sectionHeader}>
        <Ionicons name="qr-code-outline" size={18} color="#17a2b8" />
        <Text style={S.sectionTitle}>Student QR Code</Text>
      </View>

      <Text style={S.qrSubtitle}>
        Scan this QR code to identify this student. Generated from SR Code <Text style={{ fontWeight: '700', color: '#17a2b8' }}>{srCode}</Text>.
      </Text>

      {/* QR code */}
      <View style={S.qrWrapper}>
        <View style={S.qrCard}>
          {srCode ? (
            <QRCode
              value={qrValue}
              size={200}
              color="#1a2e4a"
              backgroundColor="#fff"
              logo={{ uri: 'data:image/png;base64,iVBORw0KGgo=' }}
              logoSize={0}
              quietZone={12}
            />
          ) : (
            <View style={S.qrPlaceholder}>
              <Ionicons name="qr-code-outline" size={80} color="#ccc" />
              <Text style={{ color: '#aaa', marginTop: 8, fontSize: 13 }}>No SR Code</Text>
            </View>
          )}
        </View>

        {/* Student info below QR */}
        <View style={S.qrInfoBox}>
          <Text style={S.qrName}>{fullName}</Text>
          <Text style={S.qrDetail}>{section}</Text>
          <Text style={S.qrDetail}>{email}</Text>
          <View style={S.qrSrCodeBadge}>
            <Text style={S.qrSrCodeText}>{srCode}</Text>
          </View>
        </View>
      </View>

      {/* What data is encoded */}
      <View style={S.encodedBox}>
        <Text style={S.encodedTitle}>Encoded Information</Text>
        <View style={S.encodedRow}>
          <Ionicons name="card-outline"   size={14} color="#17a2b8" />
          <Text style={S.encodedText}>SR Code: {srCode}</Text>
        </View>
        <View style={S.encodedRow}>
          <Ionicons name="person-outline" size={14} color="#17a2b8" />
          <Text style={S.encodedText}>Name: {fullName}</Text>
        </View>
        <View style={S.encodedRow}>
          <Ionicons name="school-outline" size={14} color="#17a2b8" />
          <Text style={S.encodedText}>Section: {section}</Text>
        </View>
        <View style={S.encodedRow}>
          <Ionicons name="mail-outline"   size={14} color="#17a2b8" />
          <Text style={S.encodedText}>Email: {email}</Text>
        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  scroll: { flex: 1 },

  // Cover
  coverContainer: { marginBottom: 0 },
  coverBg: { height: 160, backgroundColor: '#6b8e5e', justifyContent: 'flex-end', alignItems: 'flex-end', overflow: 'hidden' },
  coverLayer1: { ...StyleSheet.absoluteFillObject, backgroundColor: '#2c5364', opacity: 0.8 },
  coverLayer2: { ...StyleSheet.absoluteFillObject, backgroundColor: '#c8a84b', opacity: 0.3 },
  updatePicBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#17a2b8', paddingHorizontal: 14,
    paddingVertical: 9, margin: 14, borderRadius: 6,
  },
  updatePicText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Profile info row
  profileInfoRow: {
    flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingBottom: 16, paddingTop: 8,
    borderBottomWidth: 1, borderBottomColor: '#e8e8e8',
  },
  avatarWrap: { marginTop: -30, marginRight: 14 },
  avatarCircle: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: '#2c3e50',
    borderWidth: 4, borderColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },
  profileNameCol: { flex: 1, paddingBottom: 4 },
  profileFullName: { fontSize: 17, fontWeight: '700', color: '#1a2e4a', marginBottom: 2 },
  profileSub:    { fontSize: 12, color: '#666', marginBottom: 2 },
  profileSrCode: { fontSize: 12, color: '#17a2b8', fontWeight: '600' },

  // Tab bar
  tabBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e8e8e8',
  },
  tabItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabItemActive:  { borderBottomColor: '#17a2b8' },
  tabText:        { fontSize: 13, color: '#777', fontWeight: '500' },
  tabTextActive:  { color: '#17a2b8', fontWeight: '700' },
  tabContent:     { paddingHorizontal: 14, paddingTop: 14 },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 10, padding: 18,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 3,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 7 },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: '#1a2e4a', flex: 1 },
  editBadge: {
    width: 22, height: 22, borderRadius: 4, backgroundColor: '#17a2b8',
    justifyContent: 'center', alignItems: 'center',
  },

  // Read-only row
  readOnlyRow: {
    flexDirection: 'row', gap: 8, marginBottom: 14,
    backgroundColor: '#f8f9fa', borderRadius: 8, padding: 12,
  },
  readOnlyItem: { flex: 1 },
  roLabel: { fontSize: 10, color: '#999', fontWeight: '600', textTransform: 'uppercase', marginBottom: 3 },
  roValue: { fontSize: 13, color: '#333', fontWeight: '600' },
  roleBadge: { color: '#17a2b8' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginBottom: 14 },

  // Form
  formRow:    { flexDirection: 'row', gap: 10 },
  formGroup:  { marginBottom: 14 },
  fieldLabel: { fontSize: 12, color: '#666', fontWeight: '600', marginBottom: 5 },
  fieldInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 6,
    paddingHorizontal: 10, paddingVertical: Platform.OS === 'ios' ? 10 : 8,
    fontSize: 14, color: '#333', backgroundColor: '#fafafa',
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, backgroundColor: '#17a2b8', borderRadius: 6,
    paddingVertical: 12, marginTop: 4,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // QR Code tab
  qrSubtitle: { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 20 },
  qrWrapper:  { alignItems: 'center', marginBottom: 20 },
  qrCard: {
    padding: 20, backgroundColor: '#fff', borderRadius: 12,
    borderWidth: 1, borderColor: '#e8e8e8',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 4,
  },
  qrPlaceholder: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
  qrInfoBox:    { alignItems: 'center', marginTop: 16, gap: 3 },
  qrName:       { fontSize: 16, fontWeight: '700', color: '#1a2e4a' },
  qrDetail:     { fontSize: 12, color: '#888' },
  qrSrCodeBadge:{
    marginTop: 6, backgroundColor: '#17a2b8',
    paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20,
  },
  qrSrCodeText: { color: '#fff', fontSize: 13, fontWeight: '700', letterSpacing: 1 },

  // Encoded info box
  encodedBox: {
    backgroundColor: '#f0fbfd', borderRadius: 8, padding: 14,
    borderWidth: 1, borderColor: '#bee5eb',
  },
  encodedTitle: { fontSize: 12, fontWeight: '700', color: '#17a2b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  encodedRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  encodedText:  { fontSize: 13, color: '#444' },
});
