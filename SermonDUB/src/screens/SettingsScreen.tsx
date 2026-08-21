import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Free Plan</Text>
          <Text style={styles.cardDesc}>3 clips/month • Watermark • 720p</Text>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Upgrade — $10 Lifetime</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subscribeBtn}>
            <Text style={styles.subscribeBtnText}>Or $3/month for Premium</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Models</Text>
        <View style={styles.card}>
          <View style={styles.modelRow}>
            <Text style={styles.modelName}>Whisper Tiny</Text>
            <Text style={styles.modelSize}>75 MB</Text>
            <Text style={styles.modelStatus}>✓ Ready</Text>
          </View>
          <View style={styles.modelRow}>
            <Text style={styles.modelName}>NLLB-200 (Translation)</Text>
            <Text style={styles.modelSize}>472 MB</Text>
            <Text style={styles.modelStatusPending}>Download</Text>
          </View>
          <View style={styles.modelRow}>
            <Text style={styles.modelName}>Kokoro TTS</Text>
            <Text style={styles.modelSize}>82 MB</Text>
            <Text style={styles.modelStatusPending}>Download</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dubbing Languages</Text>
        <View style={styles.card}>
          {['English', 'French', 'Spanish', 'Portuguese', 'Arabic', 'Swahili', 'Yoruba', 'Igbo', 'Hausa', 'Twi'].map(lang => (
            <View key={lang} style={styles.langRow}>
              <Text style={styles.langName}>{lang}</Text>
              <Text style={styles.langStatus}>✓</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <Text style={styles.aboutText}>SermonDUB v1.0.0</Text>
          <Text style={styles.aboutText}>AI sermon clips for African churches</Text>
          <Text style={styles.aboutText}>100% offline • No cloud • No subscription</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  content: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { color: '#00D9FF', fontSize: 14, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase' },
  card: { backgroundColor: '#1a1a2e', borderRadius: 12, padding: 16 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  cardDesc: { color: '#888', fontSize: 14, marginTop: 4 },
  upgradeBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  upgradeBtnText: { color: '#0a0a1a', fontSize: 16, fontWeight: 'bold' },
  subscribeBtn: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#00D9FF',
  },
  subscribeBtnText: { color: '#00D9FF', fontSize: 14 },
  modelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modelName: { color: '#fff', fontSize: 14, flex: 1 },
  modelSize: { color: '#888', fontSize: 12, width: 60, textAlign: 'right' },
  modelStatus: { color: '#00ff88', fontSize: 12, width: 60, textAlign: 'right' },
  modelStatusPending: { color: '#00D9FF', fontSize: 12, width: 60, textAlign: 'right' },
  langRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  langName: { color: '#fff', fontSize: 14 },
  langStatus: { color: '#00ff88', fontSize: 14 },
  aboutText: { color: '#888', fontSize: 14, marginBottom: 4 },
});
