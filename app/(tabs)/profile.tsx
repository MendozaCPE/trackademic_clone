import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Image, ActionSheetIOS, Platform,
  RefreshControl, KeyboardAvoidingView,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import QRCode from 'react-native-qrcode-svg';
import AppLayout from '@/components/AppLayout';
import { useAuth } from '@/context/AuthContext';
import { updateMe, uploadAvatar, BASE_URL, getMe } from '@/services/api';

const TABS = ['Personal Info', 'Digital ID'] as const;
type Tab = typeof TABS[number];

export default function ProfileScreen() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('Personal Info');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fresh = await getMe();
      refreshUser(fresh);
    } catch (_) {}
    finally { setRefreshing(false); }
  }, [refreshUser]);

  // Editable fields
  const [firstname, setFirstname] = useState('');
  const [middleInitial, setMiddleInitial] = useState('');
  const [lastname, setLastname] = useState('');
  const [section, setSection] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (user) {
      setFirstname(user.first_name ?? '');
      setMiddleInitial(user.middle_initial ?? '');
      setLastname(user.last_name ?? '');
      setSection(user.section ?? '');
      setYearLevel(String(user.year_level ?? ''));
      setEmail(user.email ?? '');
    }
  }, [user]);

  // ── Avatar picker ──────────────────────────────────────────────────────────
  const pickFromSource = async (source: 'camera' | 'gallery') => {
    const perm = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert('Permission required', `Please allow ${source} access in settings.`);
      return;
    }

    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1, 1], quality: 0.7 });

    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? 'image/jpeg';
    const fileName = asset.fileName ?? `avatar_${Date.now()}.jpg`;

    setUploadingAvatar(true);
    try {
      const newPath = await uploadAvatar(asset.uri, fileName, mimeType);
      if (user) refreshUser({ ...user, profile_pic: newPath });
    } catch (e: any) {
      Alert.alert('Upload Failed', e.message ?? 'Could not upload photo.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarPress = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: ['Cancel', 'Take Photo', 'Choose from Library'], cancelButtonIndex: 0 },
        (idx) => { if (idx === 1) pickFromSource('camera'); else if (idx === 2) pickFromSource('gallery'); }
      );
    } else {
      Alert.alert('Profile Photo', 'Choose an option', [
        { text: 'Take Photo',            onPress: () => pickFromSource('camera')  },
        { text: 'Choose from Library',   onPress: () => pickFromSource('gallery') },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  };

  // ── Profile update ─────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    setSaving(true);
    try {
      await updateMe({
        first_name: firstname,
        middle_initial: middleInitial,
        last_name: lastname,
        section,
        year_level: parseInt(yearLevel) || 0,
        email,
      });
      if (user) {
        refreshUser({
          ...user,
          first_name: firstname,
          middle_initial: middleInitial,
          last_name: lastname,
          section,
          year_level: parseInt(yearLevel) || 0,
          email,
        });
      }
      Alert.alert('Success', 'Academic profile updated.');
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const fullName = user ? `${user.first_name} ${user.last_name}` : '';
  const srCode = user?.sr_code ?? '';
  const avatarUrl = user?.profile_pic ? `${BASE_URL.replace('/api.php', '')}/${user.profile_pic}` : null;

  return (
    <AppLayout>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
      <ScrollView
        style={S.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#17a2b8"
            colors={['#17a2b8', '#1a2e4a']}
          />
        }
      >

        {/* ── Profile Header ── */}
        <View style={S.headerCard}>
          <View style={S.headerCover} />
          <View style={S.headerContent}>
            <View style={S.avatarContainer}>
              <View style={S.avatarBorder}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={S.avatarImage} />
                ) : (
                  <View style={S.avatarCircle}>
                    <Ionicons name="person" size={40} color="#fff" />
                  </View>
                )}
              </View>
              <TouchableOpacity style={S.editAvatarBtn} onPress={handleAvatarPress} disabled={uploadingAvatar}>
                {uploadingAvatar
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Ionicons name="camera" size={16} color="#fff" />
                }
              </TouchableOpacity>
            </View>
            
            <View style={S.headerInfo}>
              <Text style={S.headerName}>{fullName}</Text>
              <View style={S.headerBadgeRow}>
                <Text style={S.headerRoleBadge}>{user?.role?.toUpperCase() || 'STUDENT'}</Text>
                <Text style={S.headerSrCode}>{srCode}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Navigation Tabs ── */}
        <View style={S.tabWrapper}>
          <View style={S.tabBar}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[S.tabItem, activeTab === tab && S.tabItemActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[S.tabText, activeTab === tab && S.tabTextActive]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Tab Content ── */}
        <View style={S.contentPadding}>
          {activeTab === 'Personal Info' ? (
            <View style={S.card}>
              <Text style={S.sectionLabel}>Enrollment Details</Text>
              
              <View style={S.readOnlyGrid}>
                <View style={S.readOnlyItem}>
                  <Text style={S.roLabel}>Official SR Code</Text>
                  <Text style={S.roValue}>{srCode}</Text>
                </View>
                <View style={S.readOnlyItem}>
                  <Text style={S.roLabel}>Portal Username</Text>
                  <Text style={S.roValue}>@{user?.username}</Text>
                </View>
              </View>

              <View style={S.divider} />

              <Text style={S.sectionLabel}>Student Identity</Text>
              <View style={S.inputRow}>
                <View style={[S.inputGroup, { flex: 2 }]}>
                  <Text style={S.inputLabel}>First Name</Text>
                  <TextInput style={S.textInput} value={firstname} onChangeText={setFirstname} />
                </View>
                <View style={[S.inputGroup, { flex: 0.8 }]}>
                  <Text style={S.inputLabel}>M.I.</Text>
                  <TextInput style={S.textInput} value={middleInitial} onChangeText={setMiddleInitial} maxLength={2} />
                </View>
              </View>

              <View style={S.inputGroup}>
                <Text style={S.inputLabel}>Last Name</Text>
                <TextInput style={S.textInput} value={lastname} onChangeText={setLastname} />
              </View>

              <View style={S.inputRow}>
                <View style={[S.inputGroup, { flex: 2 }]}>
                  <Text style={S.inputLabel}>Section</Text>
                  <TextInput style={S.textInput} value={section} onChangeText={setSection} />
                </View>
                <View style={[S.inputGroup, { flex: 1 }]}>
                  <Text style={S.inputLabel}>Year Level</Text>
                  <TextInput style={S.textInput} value={yearLevel} onChangeText={setYearLevel} keyboardType="numeric" />
                </View>
              </View>

              <View style={S.inputGroup}>
                <Text style={S.inputLabel}>Academic Email</Text>
                <TextInput style={S.textInput} value={email} onChangeText={setEmail} keyboardType="email-address" />
              </View>

              <TouchableOpacity 
                style={[S.saveButton, saving && { opacity: 0.7 }]} 
                onPress={handleUpdate}
                disabled={saving}
              >
                {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={S.saveButtonText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={S.card}>
              <View style={S.idHeader}>
                <Ionicons name="school" size={24} color="#1a2e4a" />
                <Text style={S.idTitle}>Trackademic Virtual ID</Text>
              </View>
              
              <View style={S.qrContainer}>
                <View style={S.qrFrame}>
                  <QRCode
                    value={JSON.stringify({ sr_code: srCode, name: fullName })}
                    size={180}
                    color="#1a2e4a"
                  />
                </View>
                <Text style={S.qrHelper}>Present this code for campus attendance</Text>
              </View>

              <View style={S.idDetails}>
                <View style={S.idDetailRow}>
                  <Text style={S.idDetailLabel}>SR CODE</Text>
                  <Text style={S.idDetailValue}>{srCode}</Text>
                </View>
                <View style={S.idDetailRow}>
                  <Text style={S.idDetailLabel}>SECTION</Text>
                  <Text style={S.idDetailValue}>{user?.section}</Text>
                </View>
                <View style={S.idDetailRow}>
                  <Text style={S.idDetailLabel}>STATUS</Text>
                  <Text style={[S.idDetailValue, { color: '#10b981' }]}>ENROLLED</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
      </KeyboardAvoidingView>
    </AppLayout>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  
  // Header Card
  headerCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'visible',
  },
  headerCover: {
    height: 50,
    backgroundColor: '#1a2e4a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 16,
    marginTop: -44,          // pull avatar up to straddle the cover edge
  },
  avatarContainer: { position: 'relative' },
  avatarBorder: {
    padding: 4,
    backgroundColor: '#fff',
    borderRadius: 45,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#17a2b8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1a2e4a',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerInfo: { marginLeft: 14, flex: 1, paddingTop: 48 },
  headerName: { fontSize: 18, fontWeight: '800', color: '#1a2e4a' },
  headerBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  headerRoleBadge: { fontSize: 10, fontWeight: '800', color: '#17a2b8', backgroundColor: '#f0f9fa', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  headerSrCode: { fontSize: 12, color: '#64748b', fontWeight: '600' },

  // Tabs
  tabWrapper: { paddingHorizontal: 20, marginTop: 25 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabItemActive: { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  tabText: { fontSize: 13, fontWeight: '600', color: '#64748b' },
  tabTextActive: { color: '#1a2e4a' },

  // Content
  contentPadding: { paddingHorizontal: 20, marginTop: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  
  readOnlyGrid: { flexDirection: 'column', gap: 10, marginBottom: 20 },
  readOnlyItem: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  roLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginBottom: 4 },
  roValue: { fontSize: 14, fontWeight: '700', color: '#1a2e4a' },
  
  divider: { height: 1, backgroundColor: '#f1f5f9', marginBottom: 20 },

  inputGroup: { marginBottom: 15 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 6, marginLeft: 2 },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#1a2e4a',
    fontWeight: '500',
  },
  
  saveButton: {
    backgroundColor: '#1a2e4a',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Digital ID Tab
  idHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 25 },
  idTitle: { fontSize: 16, fontWeight: '800', color: '#1a2e4a' },
  qrContainer: { alignItems: 'center', marginBottom: 30 },
  qrFrame: {
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  qrHelper: { fontSize: 12, color: '#94a3b8', marginTop: 15, fontWeight: '500' },
  idDetails: { gap: 12 },
  idDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  idDetailLabel: { fontSize: 11, fontWeight: '800', color: '#94a3b8' },
  idDetailValue: { fontSize: 13, fontWeight: '700', color: '#1a2e4a' },
});