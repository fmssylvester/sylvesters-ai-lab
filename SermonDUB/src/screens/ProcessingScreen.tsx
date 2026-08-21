import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../App';

type Route = RouteProp<RootStackParamList, 'Processing'>;

const STAGES = [
  { key: 'extract', label: 'Extracting audio...' },
  { key: 'transcribe', label: 'Transcribing sermon...' },
  { key: 'detect', label: 'Finding highlight moments...' },
  { key: 'clip', label: 'Generating clips...' },
  { key: 'caption', label: 'Adding captions...' },
];

export default function ProcessingScreen() {
  const route = useRoute<Route>();
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 1) {
          setCurrentStage(c => {
            if (c < STAGES.length - 1) return c + 1;
            return c;
          });
          return 0;
        }
        return prev + 0.05;
      });
    }, 200);

    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#00D9FF" />
      <Text style={styles.stage}>{STAGES[currentStage].label}</Text>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(currentStage / STAGES.length + progress / STAGES.length) * 100}%` }]} />
      </View>

      <Text style={styles.progressText}>
        {Math.round((currentStage / STAGES.length + progress / STAGES.length) * 100)}%
      </Text>

      <Text style={styles.eta}>
        Estimated time: {Math.max(1, Math.round((STAGES.length - currentStage) * 8))}s
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a', justifyContent: 'center', alignItems: 'center', padding: 20 },
  stage: { color: '#fff', fontSize: 18, marginTop: 20, fontWeight: '600' },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: '#00D9FF', borderRadius: 4 },
  progressText: { color: '#00D9FF', fontSize: 16, marginTop: 12, fontWeight: 'bold' },
  eta: { color: '#888', fontSize: 14, marginTop: 8 },
});
