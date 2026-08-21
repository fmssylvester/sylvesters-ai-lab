import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import RecordScreen from './src/screens/RecordScreen';
import ProcessingScreen from './src/screens/ProcessingScreen';
import ClipsScreen from './src/screens/ClipsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  Record: undefined;
  Processing: { videoUri: string; language: string };
  Clips: { outputDir: string; clips: any[] };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: { backgroundColor: '#0a0a1a' },
          headerTintColor: '#00D9FF',
          headerTitleStyle: { fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#0a0a1a' },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Record" component={RecordScreen} options={{ title: 'Record Sermon' }} />
        <Stack.Screen name="Processing" component={ProcessingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Clips" component={ClipsScreen} options={{ title: 'Your Clips' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
