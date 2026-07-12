import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Backend URL ───────────────────────────────────────────────────────────────
// WiFi IP detected: 192.168.254.116  |  Docker port: 9000
// This works for Expo Go on a physical device on the same WiFi network.
// If using Android Emulator change to: http://10.0.2.2:9000/api.php
export const BASE_URL = 'http://192.168.1.10:9000/api.php';

// ── Types ─────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  sr_code: string;
  first_name: string;
  middle_initial: string;
  last_name: string;
  email: string;
  username: string;
  role: 'student' | 'teacher';
  section: string;
  year_level: number;
  profile_pic: string | null;
}

export interface ClassItem {
  id: number;
  course_name: string;
  subject_name: string;
  class_code: string;
  school_year: string;
  semester: string;
  status: 'active' | 'archived';
  instructor_name: string;
  schedules: { day: string; time_start: string; time_end: string }[];
}

export interface Announcement {
  id: number;
  title: string;
  body: string;
  poster_name: string;
  created_at: string;
}

export interface LearningMaterial {
  id: number;
  class_id: number;
  title: string;
  description: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

export interface Classmate {
  id: number;
  sr_code: string;
  first_name: string;
  middle_initial: string;
  last_name: string;
  email: string;
  profile_pic: string | null;
}

export interface AttendanceRow {
  date: string;
  time_in: string;
  status: string;
  points: number;
}

export interface PerformanceRow {
  class_code: string;
  subject_name: string;
  title: string;
  total_items: number;
  score: number;
  average: string;
}

export interface Notification {
  id: number;
  sender_name: string;
  message: string;
  is_read: number;
  created_at: string;
}

export interface ClassPost {
  id: number;
  content: string;
  author_name: string;
  author_profile_pic: string | null;
  created_at: string;
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await AsyncStorage.getItem('auth_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const url = `${BASE_URL}/${path}`;
  const res = await fetch(url, { ...options, headers });
  const json = await res.json();

  if (json.status === 'error') throw new Error(json.message);
  return json.data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function login(srCode: string, password: string) {
  const data = await apiFetch<{ token: string; user: User }>('login', {
    method: 'POST',
    body: JSON.stringify({ username: srCode, password }),
  });
  await AsyncStorage.setItem('auth_token', data.token);
  await AsyncStorage.setItem('auth_user', JSON.stringify(data.user));
  return data;
}

export async function logout() {
  try {
    await apiFetch('logout', { method: 'POST' });
  } catch (_) {}
  await AsyncStorage.removeItem('auth_token');
  await AsyncStorage.removeItem('auth_user');
}

export async function getMe(): Promise<User> {
  return apiFetch<User>('me');
}

export async function updateMe(data: Partial<User>): Promise<void> {
  await apiFetch('me', { method: 'PUT', body: JSON.stringify(data) });
}

export async function uploadAvatar(uri: string, fileName: string, mimeType: string): Promise<string> {
  const token = await AsyncStorage.getItem('auth_token');
  const form = new FormData();
  form.append('avatar', { uri, name: fileName, type: mimeType } as any);

  const res = await fetch(`${BASE_URL}/me/avatar`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: form,
  });
  const json = await res.json();
  if (json.status === 'error') throw new Error(json.message);
  return json.data.profile_pic as string;
}

// ── Announcements ─────────────────────────────────────────────────────────────
export async function getAnnouncements(): Promise<Announcement[]> {
  return apiFetch<Announcement[]>('announcements');
}

// ── Classes ───────────────────────────────────────────────────────────────────
export async function getClasses(
  school_year?: string,
  semester?: string
): Promise<ClassItem[]> {
  const params = new URLSearchParams();
  if (school_year && school_year !== 'All School Years') params.set('school_year', school_year);
  if (semester && semester !== 'All Semesters') params.set('semester', semester);
  const qs = params.toString();
  return apiFetch<ClassItem[]>(`classes${qs ? '?' + qs : ''}`);
}

export async function joinClass(class_code: string): Promise<void> {
  await apiFetch('classes/join', {
    method: 'POST',
    body: JSON.stringify({ class_code }),
  });
}

export async function getClassById(classId: number): Promise<ClassItem> {
  return apiFetch<ClassItem>(`classes/${classId}`);
}

export async function getClassPosts(classId: number): Promise<ClassPost[]> {
  return apiFetch<ClassPost[]>(`classes/${classId}/posts`);
}

export async function createClassPost(classId: number, content: string): Promise<void> {
  await apiFetch(`classes/${classId}/posts`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function getClassMaterials(classId: number): Promise<LearningMaterial[]> {
  return apiFetch<LearningMaterial[]>(`classes/${classId}/materials`);
}

export async function getClassmates(classId: number): Promise<Classmate[]> {
  return apiFetch<Classmate[]>(`classes/${classId}/classmates`);
}

export async function getAttendance(classId: number): Promise<AttendanceRow[]> {
  return apiFetch<AttendanceRow[]>(`classes/${classId}/attendance`);
}

// ── Performance ───────────────────────────────────────────────────────────────
export async function getPerformance(
  school_year?: string,
  semester?: string,
  subject?: string
): Promise<PerformanceRow[]> {
  const params = new URLSearchParams();
  if (school_year && school_year !== 'All School Years') params.set('school_year', school_year);
  if (semester && semester !== 'All Semesters') params.set('semester', semester);
  if (subject && subject !== 'All Subjects') params.set('subject', subject);
  const qs = params.toString();
  return apiFetch<PerformanceRow[]>(`performance${qs ? '?' + qs : ''}`);
}

// ── Notifications ─────────────────────────────────────────────────────────────
export async function getNotifications(): Promise<{
  notifications: Notification[];
  unread_count: number;
}> {
  return apiFetch('notifications');
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiFetch('notifications/read', { method: 'PUT' });
}

// ── Filter helpers ────────────────────────────────────────────────────────────
export async function getSchoolYears(): Promise<string[]> {
  return apiFetch<string[]>('school-years');
}

export async function getSubjects(): Promise<string[]> {
  return apiFetch<string[]>('subjects');
}

// ── Schedule ──────────────────────────────────────────────────────────────────
export interface ScheduleEntry {
  class_id: number;
  subject_name: string;
  course_name: string;
  class_code: string;
  school_year: string;
  semester: string;
  status: string;
  instructor_name: string;
  day: string;
  time_start: string;
  time_end: string;
}

export async function getSchedule(): Promise<ScheduleEntry[]> {
  return apiFetch<ScheduleEntry[]>('schedule');
}

// ── Token check (for app startup) ─────────────────────────────────────────────
export async function getStoredUser(): Promise<User | null> {
  const raw = await AsyncStorage.getItem('auth_user');
  return raw ? JSON.parse(raw) : null;
}

// ── Register ──────────────────────────────────────────────────────────────────
export async function register(data: {
  sr_code: string;
  first_name: string;
  middle_initial: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  section: string;
  year_level: number;
}): Promise<{ token: string; user: User }> {
  const result = await apiFetch<{ token: string; user: User }>('register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  await AsyncStorage.setItem('auth_token', result.token);
  await AsyncStorage.setItem('auth_user', JSON.stringify(result.user));
  return result;
}
