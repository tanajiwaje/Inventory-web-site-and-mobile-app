import { AdminTabs, SellerTabs, BuyerTabs } from './Tabs';
import { useAuth } from '../auth/useAuth';

export type AppStackParamList = {
  AdminTabs: undefined;
  SellerTabs: undefined;
  BuyerTabs: undefined;
};

export const AppNavigator = () => {
  const { user } = useAuth();
  const role = user?.role;
  if (role === 'admin' || role === 'super_admin') {
    return <AdminTabs />;
  }
  if (role === 'seller') {
    return <SellerTabs />;
  }
  return <BuyerTabs />;
};
