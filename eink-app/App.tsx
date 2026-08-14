import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useSettingsStore } from './src/store/settingsStore';
import { COLOR_THEMES } from './src/constants/theme';

export default function App() {
  const { eink } = useSettingsStore();
  const theme = COLOR_THEMES[eink.colorScheme];

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
