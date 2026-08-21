import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Record'>;

export default function RecordScreen() {
  const navigation = useNavigation<Nav>();
  const [language, setLanguage] = useState('en');

  const handleRecord = () => {
    Alert.alert(
      'Record Sermon',
      'Camera recording coming soon. Use Import to test with a saved video.',
      [{ text: 'OK' }]
    );
  };

  const handleImport = () => {
    navigation.navigate('Processing', {
      videoUri: 'file:///sdcard/Download/test_sermon.mp4',
      language,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Sermon Source</Text>

      <TouchableOpacity style={styles.primaryBtn} onPress={handleRecord}>
        <Text style={styles.primaryBtnIcon}>🎥</Text>
        <Text style={styles.primaryBtnText}>Record New</Text>
        <Text style={styles.primaryBtnSub}>Open camera to record</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryBtn} onPress={handleImport}>
        <Text style={styles.secondaryBtnIcon}>📁</Text>
        <Text style={styles.secondaryBtnText}>Import from Gallery</Text>
        <Text style={styles.secondaryBtnSub}>Select existing sermon video</Text>
      </TouchableOpacity>

      <View style={styles.langSection}>
        <Text style={styles.langLabel}>Source Language</Text>
        <View style={styles.langOptions}>
          {[
            { code: 'en', label: 'English' },
            { code: 'pcm', label: 'Pidgin' },
            { code: 'yo', label: 'Yoruba' },
            { code: 'ig', label: 'Igbo' },
            { code: 'ha', label: 'Hausa' },
          ].map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.langBtn, language === lang.code && styles.langBtnActive]}
              onPress={() => setLanguage(lang.code)}
            >
              <Text style={[styles.langBtnText, language === lang.code && styles.langBtnTextActive]}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a', padding: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 30, marginTop: 20 },
  primaryBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  primaryBtnIcon: { fontSize: 36 },
  primaryBtnText: { color: '#0a0a1a', fontSize: 20, fontWeight: 'bold', marginTop: 8 },
  primaryBtnSub: { color: '#0a0a1a', fontSize: 14, opacity: 0.7, marginTop: 4 },
  secondaryBtn: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#333',
  },
  secondaryBtnIcon: { fontSize: 36 },
  secondaryBtnText: { color: '#fff', fontSize: 20, fontWeight: '600', marginTop: 8 },
  secondaryBtnSub: { color: '#888', fontSize: 14, marginTop: 4 },
  langSection: { marginTop: 10 },
  langLabel: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  langOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    borderWidth: 1,
    borderColor: '#333',
  },
  langBtnActive: { backgroundColor: '#00D9FF', borderColor: '#00D9FF' },
  langBtnText: { color: '#888', fontSize: 14 },
  langBtnTextActive: { color: '#0a0a1a', fontWeight: 'bold' },
});
