import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import { AdminDashboard } from '../screens/AdminDashboard';
import { AdminInventoryScreen } from '../screens/AdminInventoryScreen';
import { AdminInventoryTransactionsScreen } from '../screens/AdminInventoryTransactionsScreen';
import { AdminInventoryStocksScreen } from '../screens/AdminInventoryStocksScreen';
import { AdminPurchaseOrdersScreen } from '../screens/AdminPurchaseOrdersScreen';
import { AdminPurchaseOrderCreateScreen } from '../screens/AdminPurchaseOrderCreateScreen';
import { AdminSalesOrdersScreen } from '../screens/AdminSalesOrdersScreen';
import { AdminSalesOrderCreateScreen } from '../screens/AdminSalesOrderCreateScreen';
import { AdminReturnsScreen } from '../screens/AdminReturnsScreen';
import { AdminAuditLogsScreen } from '../screens/AdminAuditLogsScreen';
import { AdminMoreScreen } from '../screens/AdminMoreScreen';
import { AdminUsersScreen } from '../screens/AdminUsersScreen';
import { AdminCompanySettingsScreen } from '../screens/AdminCompanySettingsScreen';
import { AdminSuppliersScreen } from '../screens/AdminSuppliersScreen';
import { AdminCustomersScreen } from '../screens/AdminCustomersScreen';
import { AdminLocationsScreen } from '../screens/AdminLocationsScreen';
import { SellerDashboard } from '../screens/SellerDashboard';
import { SellerPurchaseOrdersScreen } from '../screens/SellerPurchaseOrdersScreen';
import { SellerProfileScreen } from '../screens/SellerProfileScreen';
import { BuyerDashboard } from '../screens/BuyerDashboard';
import { BuyerSalesOrdersScreen } from '../screens/BuyerSalesOrdersScreen';
import { BuyerSalesOrderCreateScreen } from '../screens/BuyerSalesOrderCreateScreen';
import { BuyerProfileScreen } from '../screens/BuyerProfileScreen';
import { colors, radius } from '../theme/tokens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({
  name,
  focused
}: {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}) => (
  <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
    <Ionicons
      name={name}
      size={18}
      color={focused ? colors.primary : colors.textMuted}
    />
  </View>
);

const AdminInventoryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminInventoryHome" component={AdminInventoryScreen} options={{ title: 'Inventory' }} />
    <Stack.Screen
      name="AdminInventoryTransactions"
      component={AdminInventoryTransactionsScreen}
      options={{ title: 'Transactions' }}
    />
    <Stack.Screen
      name="AdminInventoryStocks"
      component={AdminInventoryStocksScreen}
      options={{ title: 'Stock by Location' }}
    />
  </Stack.Navigator>
);

const AdminPurchaseStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminPurchaseOrdersList" component={AdminPurchaseOrdersScreen} options={{ title: 'Purchase Orders' }} />
    <Stack.Screen
      name="AdminPurchaseOrderCreate"
      component={AdminPurchaseOrderCreateScreen}
      options={{ title: 'New Purchase Order' }}
    />
  </Stack.Navigator>
);

const AdminSalesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminSalesOrdersList" component={AdminSalesOrdersScreen} options={{ title: 'Sales Orders' }} />
    <Stack.Screen
      name="AdminSalesOrderCreate"
      component={AdminSalesOrderCreateScreen}
      options={{ title: 'New Sales Order' }}
    />
  </Stack.Navigator>
);

const AdminMoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminMoreHome" component={AdminMoreScreen} options={{ title: 'Admin Tools' }} />
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'User Onboarding' }} />
    <Stack.Screen name="AdminCompanySettings" component={AdminCompanySettingsScreen} options={{ title: 'Company Settings' }} />
    <Stack.Screen name="AdminSuppliers" component={AdminSuppliersScreen} options={{ title: 'Suppliers' }} />
    <Stack.Screen name="AdminCustomers" component={AdminCustomersScreen} options={{ title: 'Customers' }} />
    <Stack.Screen name="AdminLocations" component={AdminLocationsScreen} options={{ title: 'Locations' }} />
    <Stack.Screen name="AdminReturns" component={AdminReturnsScreen} options={{ title: 'Returns' }} />
    <Stack.Screen name="AdminAuditLogs" component={AdminAuditLogsScreen} options={{ title: 'Audit Logs' }} />
  </Stack.Navigator>
);

export const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarItemStyle: styles.tabItem,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: styles.tabLabel
    }}
  >
    <Tab.Screen
      name="AdminDashboard"
      component={AdminDashboard}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focused={focused} /> }}
    />
    <Tab.Screen
      name="AdminInventory"
      component={AdminInventoryStack}
      options={{
        tabBarLabel: 'Inventory',
        tabBarIcon: ({ focused }) => <TabIcon name="cube-outline" focused={focused} />
      }}
    />
    <Tab.Screen
      name="AdminPurchaseOrders"
      component={AdminPurchaseStack}
      options={{
        tabBarLabel: 'Purchase',
        tabBarIcon: ({ focused }) => <TabIcon name="cart-outline" focused={focused} />
      }}
    />
    <Tab.Screen
      name="AdminSalesOrders"
      component={AdminSalesStack}
      options={{
        tabBarLabel: 'Sales',
        tabBarIcon: ({ focused }) => <TabIcon name="trending-up-outline" focused={focused} />
      }}
    />
    <Tab.Screen
      name="AdminMore"
      component={AdminMoreStack}
      options={{ tabBarLabel: 'More', tabBarIcon: ({ focused }) => <TabIcon name="menu-outline" focused={focused} /> }}
    />
  </Tab.Navigator>
);

const SellerPurchaseStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SellerPurchaseOrdersList" component={SellerPurchaseOrdersScreen} options={{ title: 'Purchase Orders' }} />
  </Stack.Navigator>
);

export const SellerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarItemStyle: styles.tabItem,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: styles.tabLabel
    }}
  >
    <Tab.Screen
      name="SellerDashboard"
      component={SellerDashboard}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focused={focused} /> }}
    />
    <Tab.Screen
      name="SellerPurchaseOrders"
      component={SellerPurchaseStack}
      options={{ tabBarLabel: 'Orders', tabBarIcon: ({ focused }) => <TabIcon name="reader-outline" focused={focused} /> }}
    />
    <Tab.Screen
      name="SellerProfile"
      component={SellerProfileScreen}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name="person-outline" focused={focused} /> }}
    />
  </Tab.Navigator>
);

const BuyerSalesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BuyerSalesOrdersList" component={BuyerSalesOrdersScreen} options={{ title: 'Sales Orders' }} />
    <Stack.Screen name="BuyerSalesOrderCreate" component={BuyerSalesOrderCreateScreen} options={{ title: 'New Sales Order' }} />
  </Stack.Navigator>
);

export const BuyerTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarStyle: styles.tabBar,
      tabBarItemStyle: styles.tabItem,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textMuted,
      tabBarLabelStyle: styles.tabLabel
    }}
  >
    <Tab.Screen
      name="BuyerDashboard"
      component={BuyerDashboard}
      options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="home-outline" focused={focused} /> }}
    />
    <Tab.Screen
      name="BuyerSalesOrders"
      component={BuyerSalesStack}
      options={{ tabBarLabel: 'Orders', tabBarIcon: ({ focused }) => <TabIcon name="receipt-outline" focused={focused} /> }}
    />
    <Tab.Screen
      name="BuyerProfile"
      component={BuyerProfileScreen}
      options={{ tabBarLabel: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name="person-outline" focused={focused} /> }}
    />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  tabBar: {
    height: 64,
    paddingBottom: 8,
    paddingTop: 6,
    borderTopColor: colors.border,
    backgroundColor: colors.surface
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  tabItem: {
    minHeight: 44
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg
  },
  iconWrapActive: {
    backgroundColor: '#dbeafe'
  }
});
