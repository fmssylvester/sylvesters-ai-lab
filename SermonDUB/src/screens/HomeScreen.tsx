import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>SermonDUB</Text>
        <Text style={styles.subtitle}>AI sermon clips for African churches</Text>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Clips this month</Text>
        <View style={styles.statsBar}>
          {[1,2,3,4,5,6,7,8,9,10].map(i => (
            <View key={i} style={[styles.dot, i <= 2 ? styles.dotUsed : styles.dotEmpty]} />
          ))}
        </View>
        <Text style={styles.statsText}>2 of 10 used</Text>
        <TouchableOpacity style={styles.upgradeBtn}>
          <Text style={styles.upgradeText}>Upgrade to Unlimited →</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.primaryBtn}
        onPress={() => navigation.navigate('Record')}
      >
        <Text style={styles.primaryBtnText}>+ New Sermon Clip</Text>
      </TouchableOpacity>

      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Clips</Text>
        <View style={styles.clipsGrid}>
          {[
            { title: 'Psalm 23 - The Lord is my...', date: 'Mar 7' },
            { title: 'Hallelujah Breakthrough...', date: 'Mar 14' },
          ].map((clip, i) => (
            <TouchableOpacity key={i} style={styles.clipCard}>
              <View style={styles.clipThumb}>
                <Text style={styles.clipPlay}>▶</Text>
              </View>
              <Text style={styles.clipTitle} numberOfLines={1}>{clip.title}</Text>
              <Text style={styles.clipDate}>{clip.date}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        style={styles.settingsBtn}
        onPress={() => navigation.navigate('Settings')}
      >
        <Text style={styles.settingsText}>⚙ Settings</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  content: { padding: 20, paddingTop: 60 },
  header: { alignItems: 'center', marginBottom: 30 },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#00D9FF' },
  subtitle: { fontSize: 14, color: '#888', marginTop: 5 },
  statsCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statsTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  statsBar: { flexDirection: 'row', gap: 6, marginTop: 12 },
  dot: { width: 24, height: 8, borderRadius: 4 },
  dotUsed: { backgroundColor: '#00D9FF' },
  dotEmpty: { backgroundColor: '#333' },
  statsText: { color: '#888', fontSize: 12, marginTop: 8 },
  upgradeBtn: { marginTop: 12 },
  upgradeText: { color: '#00D9FF', fontSize: 14 },
  primaryBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 30,
  },
  primaryBtnText: { color: '#0a0a1a', fontSize: 18, fontWeight: 'bold' },
  recentSection: { marginBottom: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 12 },
  clipsGrid: { flexDirection: 'row', gap: 12 },
  clipCard: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 12,
  },
  clipThumb: {
    backgroundColor: '#333',
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clipPlay: { color: '#00D9FF', fontSize: 24 },
  clipTitle: { color: '#fff', fontSize: 12, marginTop: 8 },
  clipDate: { color: '#888', fontSize: 10, marginTop: 4 },
  settingsBtn: { alignItems: 'center', padding: 16 },
  settingsText: { color: '#888', fontSize: 14 },
});
