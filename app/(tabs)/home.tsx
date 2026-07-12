import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppLayout from '@/components/AppLayout';

const announcements = [
  {
    id: 1,
    title: 'Greetings: logo',
    date: 'November 14, 2023 5:57 PM',
    content: '<link rel="icon" href="logoko.jpg" type="image/x-icon">',
  },
  {
    id: 2,
    title: 'Greetings: Good Evening!',
    date: 'August 20, 2023 10:06 PM',
    content: 'Keep Safe....',
  },
  {
    id: 3,
    title: 'Greetings: Welcome To Trackademic System:',
    date: 'August 17, 2023 11:40 PM',
    content: `Welcome Back, Future IT Professionals!!

Hi everyone!
Panibagong semester na naman—fresh start, new challenges, at syempre bagong learnings.

As IT students, hindi lang tayo basta nag-aaral ng codes o systems. We're training ourselves to solve real-world problems, to innovate, and to think like future developers, engineers, and tech leaders. ⚡

This school year, let's push ourselves to:
✅ Explore beyond the basics
✅ Collaborate and share ideas
✅ Fail fast, learn faster
✅ And most of all... enjoy the journey!

Remember, the best projects and skills come from consistency and teamwork. Kaya ready na ba kayo? Let's code, create, and conquer this school year together!!!`,
  },
];

export default function HomeScreen() {
  return (
    <AppLayout title="Home" breadcrumb={['🏠', 'My Dashboard']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.avatarLarge}>
            <Ionicons name="person" size={36} color="#fff" />
          </View>
          <View style={styles.welcomeText}>
            <Text style={styles.welcomeName}>Welcome back, Christian Paul Mendoza!</Text>
            <Text style={styles.welcomeSub}>
              Glad to see you again. Check your classes, updates, and performance below.
            </Text>
          </View>
        </View>

        {/* Announcement Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.announcementIcon}>📣</Text>
            <Text style={styles.sectionTitle}>Announcement Section</Text>
          </View>

          {announcements.map((item) => (
            <View key={item.id} style={styles.announcementCard}>
              <Text style={styles.announcementTitle}>{item.title}</Text>
              <Text style={styles.announcementDate}>{item.date}</Text>
              <Text style={styles.announcementContent}>{item.content}</Text>
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
  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 14,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6c8096',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    flex: 1,
  },
  welcomeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  announcementIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  announcementCard: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#17a2b8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  announcementTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#17a2b8',
    marginBottom: 3,
  },
  announcementDate: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  announcementContent: {
    fontSize: 13,
    color: '#444',
    lineHeight: 19,
  },
});
