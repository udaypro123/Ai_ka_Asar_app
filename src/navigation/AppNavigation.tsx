import { NavigationContainer } from '@react-navigation/native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { checkAuth } from '../store/slices/authSlice';
import { DrawerLogoutButton } from '../components/common/DrawerLogoutButton';
import { colors } from '../theme';
import { navigationRef } from './navigationRef';
import type {
  AdminDrawerParamList,
  AuthStackParamList,
  HrDrawerParamList,
  OnboardingStackParamList,
  RootStackParamList,
  UserDrawerParamList,
} from './types';
import { useAppRouter } from './useAppRouter';
import LoginScreen from '../../app/(auth)/login';
import HowItWorksScreen from '../../app/(auth)/how-it-works';
import RegisterScreen from '../../app/(auth)/register';
import ForgotPasswordScreen from '../../app/(auth)/forgot-password';
import ResetPasswordScreen from '../../app/(auth)/reset-password';
import VerifyEmailScreen from '../../app/(auth)/verify-email';
import WelcomeScreen from '../../app/(onboarding)/welcome';
import AssessmentScreen from '../../app/(onboarding)/assessment';
import DashboardScreen from '../../app/(tabs)/index';
import CommunityScreen from '../../app/(tabs)/community';
import ProfileScreen from '../../app/(tabs)/profile';
import UsersScreen from '../../app/(tabs)/users';
import AdminPanelScreen from '../../app/(tabs)/admin';
import AdminDashboardScreen from '../../app/(admin)/index';
import AdminUsersScreen from '../../app/(admin)/users';
import AdminProfileScreen from '../../app/(admin)/profile';
import HrDashboardScreen from '../../app/(hr)/index';
import HrCandidatesScreen from '../../app/(hr)/candidates';
import HrProfileScreen from '../../app/(hr)/profile';
import UserHomeScreen from '../../app/(user)/index';

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const UserDrawer = createDrawerNavigator<UserDrawerParamList>();
const AdminDrawer = createDrawerNavigator<AdminDrawerParamList>();
const HrDrawer = createDrawerNavigator<HrDrawerParamList>();

const DashboardDrawerIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="speedometer-outline" color={color} size={size} />
);
const CommunityDrawerIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="people-outline" color={color} size={size} />
);
const ProfileDrawerIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="person-circle-outline" color={color} size={size} />
);
const UsersDrawerIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="people-circle-outline" color={color} size={size} />
);
const AdminDrawerIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="settings-outline" color={color} size={size} />
);

function BootstrapScreen() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const router = useAppRouter();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || !user) {
      router.replace('/(auth)/login');
    } else if (!user.roles?.length) {
      router.replace('/(onboarding)/welcome');
    } else if (user.roles.some((role) => role === 'ADMIN' || role === 'SUPER_ADMIN')) {
      router.replace('/(admin)');
    } else if (user.roles.includes('HR')) {
      router.replace('/(hr)');
    } else {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, router, user]);

  return (
    <View style={styles.loading}>
      <Image source={require('../../assets/icon3.png')} style={styles.splash} resizeMode="contain" />
    </View>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="login" component={LoginScreen} />
      <AuthStack.Screen name="how-it-works" component={HowItWorksScreen} />
      <AuthStack.Screen name="register" component={RegisterScreen} />
      <AuthStack.Screen name="forgot-password" component={ForgotPasswordScreen} />
      <AuthStack.Screen name="reset-password" component={ResetPasswordScreen} />
      <AuthStack.Screen name="verify-email" component={VerifyEmailScreen} />
    </AuthStack.Navigator>
  );
}

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="welcome" component={WelcomeScreen} />
      <OnboardingStack.Screen name="assessment" component={AssessmentScreen} />
    </OnboardingStack.Navigator>
  );
}

function DrawerContent(props: DrawerContentComponentProps) {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <View style={styles.drawer}>
      <DrawerContentScrollView
        {...props}
        style={styles.drawerScroll}
        contentContainerStyle={styles.drawerScrollContent}
      >
        <View style={styles.drawerHeader}>
          <View style={styles.drawerIdentityRow}>
            <Image source={require('../../assets/icon3.png')} style={styles.drawerIcon} />
            <View style={styles.drawerIdentity}>
              <Text style={styles.drawerEyebrow}>AIMARG WORKSPACE</Text>
              <Text numberOfLines={1} style={styles.drawerName}>
                {user?.name || 'Welcome'}
              </Text>
              <Text style={styles.drawerEmail} numberOfLines={1}>{user?.email || 'Your career companion'}</Text>
              <Text style={styles.drawerRole}>{user?.roles?.[0] || 'USER'}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.drawerSectionLabel}>MENU</Text>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.drawerLogout}>
        <DrawerLogoutButton />
      </View>
    </View>
  );
}

function UserNavigator() {
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roles?.some((role) => role === 'ADMIN' || role === 'SUPER_ADMIN');
  const isHr = user?.roles?.includes('HR');

  return (
    <UserDrawer.Navigator
      drawerContent={DrawerContent}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.auth.bgStart },
        headerTintColor: colors.white,
        drawerStyle: styles.drawerPanel,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.gray600,
        drawerActiveBackgroundColor: colors.primaryLight,
        drawerLabelStyle: styles.drawerLabel,
        drawerItemStyle: styles.drawerItem,
      }}
    >
      <UserDrawer.Screen
        name="index"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          drawerIcon: DashboardDrawerIcon,
        }}
      />
      <UserDrawer.Screen
        name="community"
        component={CommunityScreen}
        options={{
          title: 'Community',
          drawerIcon: CommunityDrawerIcon,
        }}
      />
      {/* <UserDrawer.Screen name="impact" component={ImpactScreen} options={{ title: 'Impact' }} />
      <UserDrawer.Screen name="career" component={CareerScreen} options={{ title: 'Career' }} />
      <UserDrawer.Screen name="skills" component={SkillsScreen} options={{ title: 'Skills' }} /> */}
      <UserDrawer.Screen
        name="profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          drawerIcon: ProfileDrawerIcon,
        }}
      />
      <UserDrawer.Screen
        name="users"
        component={UsersScreen}
        options={{
          title: 'Manage Users',
          drawerItemStyle: isAdmin || isHr ? undefined : styles.hiddenDrawerItem,
          drawerIcon: UsersDrawerIcon,
        }}
      />
      <UserDrawer.Screen
        name="admin"
        component={AdminPanelScreen}
        options={{
          title: 'Admin Panel',
          drawerItemStyle: isAdmin ? undefined : styles.hiddenDrawerItem,
          drawerIcon: AdminDrawerIcon,
        }}
      />
      <UserDrawer.Screen
        name="userHome"
        component={UserHomeScreen}
        options={{ title: 'User Home', drawerItemStyle: styles.hiddenDrawerItem }}
      />
    </UserDrawer.Navigator>
  );
}

function AdminNavigator() {
  return (
    <AdminDrawer.Navigator
      drawerContent={DrawerContent}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.auth.bgStart },
        headerTintColor: colors.white,
        drawerStyle: styles.drawerPanel,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.gray600,
        drawerActiveBackgroundColor: colors.primaryLight,
        drawerLabelStyle: styles.drawerLabel,
        drawerItemStyle: styles.drawerItem,
      }}
    >
      <AdminDrawer.Screen
        name="index"
        component={AdminDashboardScreen}
        options={{
          title: 'Admin Dashboard',
          drawerIcon: DashboardDrawerIcon,
        }}
      />
      <AdminDrawer.Screen
        name="users"
        component={AdminUsersScreen}
        options={{
          title: 'Manage Users',
          drawerIcon: UsersDrawerIcon,
        }}
      />
      {/* <AdminDrawer.Screen name="user-detail" component={AdminUserDetailScreen} options={{ title: 'User Detail' }} /> */}
      <AdminDrawer.Screen
        name="profile"
        component={AdminProfileScreen}
        options={{
          title: 'Profile',
          drawerIcon: ProfileDrawerIcon,
        }}
      />
    </AdminDrawer.Navigator>
  );
}

function HrNavigator() {
  return (
    <HrDrawer.Navigator
      drawerContent={DrawerContent}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.auth.bgStart },
        headerTintColor: colors.white,
        drawerStyle: styles.drawerPanel,
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.gray600,
        drawerActiveBackgroundColor: colors.primaryLight,
        drawerLabelStyle: styles.drawerLabel,
        drawerItemStyle: styles.drawerItem,
      }}
    >
      <HrDrawer.Screen
        name="index"
        component={HrDashboardScreen}
        options={{
          title: 'HR Dashboard',
          drawerIcon: DashboardDrawerIcon,
        }}
      />
      <HrDrawer.Screen
        name="candidates"
        component={HrCandidatesScreen}
        options={{
          title: 'Candidates',
          drawerIcon: CommunityDrawerIcon,
        }}
      />
      <HrDrawer.Screen
        name="profile"
        component={HrProfileScreen}
        options={{
          title: 'Profile',
          drawerIcon: ProfileDrawerIcon,
        }}
      />
    </HrDrawer.Navigator>
  );
}

export default function AppNavigation() {
  return (
    <NavigationContainer ref={navigationRef}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="Bootstrap" component={BootstrapScreen} />
        <RootStack.Screen name="Auth" component={AuthNavigator} />
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        <RootStack.Screen name="User" component={UserNavigator} />
        <RootStack.Screen name="Admin" component={AdminNavigator} />
        <RootStack.Screen name="HR" component={HrNavigator} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  splash: {
    width: 240,
    height: 240,
  },
  drawer: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  drawerScroll: {
    backgroundColor: colors.gray50,
  },
  drawerScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 20,
  },
  drawerHeader: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 16,
    marginTop: 8,
    marginBottom: 22,
    elevation: 5,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  drawerIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  drawerIcon: {
    height: 56,
    width: 56,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 4,
    marginRight: 13,
  },
  drawerIdentity: {
    flex: 1,
    minWidth: 0,
  },
  drawerEyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 3,
  },
  drawerName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
  },
  drawerEmail: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    marginTop: 3,
  },
  drawerRole: {
    color: colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.7,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 14,
  },
  drawerSectionLabel: {
    color: colors.gray400,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginLeft: 12,
    marginBottom: 8,
  },
  drawerPanel: {
    width: 300,
    backgroundColor: colors.gray50,
  },
  drawerLabel: {
    marginLeft: 0,
    fontSize: 15,
    fontWeight: '600',
  },
  drawerItem: {
    marginHorizontal: 0,
    marginVertical: 3,
    borderRadius: 14,
    paddingHorizontal: 12,
    minHeight: 54,
  },
  drawerLogout: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 20,
    marginBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray200,
    backgroundColor: colors.gray50,
  },
  hiddenDrawerItem: {
    display: 'none',
  },
});
