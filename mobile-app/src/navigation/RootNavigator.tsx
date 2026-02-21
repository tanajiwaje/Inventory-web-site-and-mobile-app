import { View, ActivityIndicator } from 'react-native';

import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { useAuth } from '../auth/useAuth';

export const RootNavigator = () => {
  const { token, ready } = useAuth();

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return token ? <AppNavigator /> : <AuthNavigator />;
};
