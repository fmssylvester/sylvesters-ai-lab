import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';
import { RootStackParamList } from '../../App';

type Route = RouteProp<RootStackParamList, 'Clips'>;

export default function ClipsScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { clips } = route.params;

  const handleShare = async (clipPath: string) => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(clipPath, {
        mimeType: 'video/mp4',
        dialogTitle: 'Share sermon clip',
      });
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Clips ({clips.length})</Text>

      {clips.map((clip, i) => (
        <View key={i} style={styles.clipCard}>
          <View style={styles.clipThumb}>
            <Text style={styles.clipPlay}>▶</Text>
            <Text style={styles.clipDuration}>{Math.round(clip.duration)}s</Text>
          </View>
          <View style={styles.clipInfo}>
            <Text style={styles.clipText} numberOfLines={2}>{clip.text}</Text>
            <Text style={styles.clipScore}>Score: {clip.score.toFixed(1)}</Text>
            <Text style={styles.clipTime}>{Math.round(clip.start)}s - {Math.round(clip.end)}s</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={() => handleShare(clip.path)}>
            <Text style={styles.shareBtnText}>📱 Share</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.homeBtnText}>← Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a1a' },
  content: { padding: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  clipCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  clipThumb: {
    width: 80,
    height: 80,
    backgroundColor: '#333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clipPlay: { color: '#00D9FF', fontSize: 24 },
  clipDuration: { color: '#888', fontSize: 10, marginTop: 4 },
  clipInfo: { flex: 1, marginLeft: 12 },
  clipText: { color: '#fff', fontSize: 14 },
  clipScore: { color: '#00D9FF', fontSize: 12, marginTop: 4 },
  clipTime: { color: '#888', fontSize: 12, marginTop: 2 },
  shareBtn: {
    backgroundColor: '#00D9FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  shareBtnText: { color: '#0a0a1a', fontSize: 12, fontWeight: 'bold' },
  homeBtn: { alignItems: 'center', padding: 20, marginTop: 10 },
  homeBtnText: { color: '#00D9FF', fontSize: 16 },
});
