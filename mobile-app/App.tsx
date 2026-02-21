import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/auth/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { UIProvider } from './src/ui/UIContext';
import { ToastHost } from './src/components/ToastHost';
import { NotificationCenter } from './src/components/NotificationCenter';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <UIProvider>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
            <NotificationCenter />
            <ToastHost />
          </NavigationContainer>
        </UIProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
