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
import RegisterScreen from '../../app/(auth)/register';
import ForgotPasswordScreen from '../../app/(auth)/forgot-password';
import ResetPasswordScreen from '../../app/(auth)/reset-password';
import VerifyEmailScreen from '../../app/(auth)/verify-email';
import WelcomeScreen from '../../app/(onboarding)/welcome';
import ProfessionScreen from '../../app/(onboarding)/profession';
import CareerProfileScreen from '../../app/(onboarding)/career-profile';
import AssessmentScreen from '../../app/(onboarding)/assessment';
import DashboardScreen from '../../app/(tabs)/index';
import CommunityScreen from '../../app/(tabs)/community';
import ImpactScreen from '../../app/(tabs)/impact';
import CareerScreen from '../../app/(tabs)/career';
import SkillsScreen from '../../app/(tabs)/skills';
import ProfileScreen from '../../app/(tabs)/profile';
import UsersScreen from '../../app/(tabs)/users';
import AdminPanelScreen from '../../app/(tabs)/admin';
import AdminDashboardScreen from '../../app/(admin)/index';
import AdminUsersScreen from '../../app/(admin)/users';
import AdminUserDetailScreen from '../../app/(admin)/user-detail';
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
      <OnboardingStack.Screen name="profession" component={ProfessionScreen} />
      <OnboardingStack.Screen name="career-profile" component={CareerProfileScreen} />
      <OnboardingStack.Screen name="assessment" component={AssessmentScreen} />
    </OnboardingStack.Navigator>
  );
}

function DrawerContent(props: DrawerContentComponentProps) {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <View style={styles.drawer}>
      <DrawerContentScrollView {...props}>
        <View style={styles.drawerHeader}>
          <Image source={require('../../assets/icon3.png')} style={styles.drawerIcon} />
          <View style={styles.drawerIdentity}>
            <Text numberOfLines={1} style={styles.drawerName}>
              {user?.name || 'AIMarg'}
            </Text>
            <Text style={styles.drawerRole}>{user?.roles?.[0] || 'USER'}</Text>
          </View>
        </View>
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
        drawerStyle: { width: 280 },
      }}
    >
      <UserDrawer.Screen name="index" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <UserDrawer.Screen name="community" component={CommunityScreen} options={{ title: 'Community' }} />
      {/* <UserDrawer.Screen name="impact" component={ImpactScreen} options={{ title: 'Impact' }} />
      <UserDrawer.Screen name="career" component={CareerScreen} options={{ title: 'Career' }} />
      <UserDrawer.Screen name="skills" component={SkillsScreen} options={{ title: 'Skills' }} /> */}
      <UserDrawer.Screen name="profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <UserDrawer.Screen
        name="users"
        component={UsersScreen}
        options={{
          title: 'Manage Users',
          drawerItemStyle: isAdmin || isHr ? undefined : styles.hiddenDrawerItem,
        }}
      />
      <UserDrawer.Screen
        name="admin"
        component={AdminPanelScreen}
        options={{
          title: 'Admin Panel',
          drawerItemStyle: isAdmin ? undefined : styles.hiddenDrawerItem,
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
        drawerStyle: { width: 280 },
      }}
    >
      <AdminDrawer.Screen name="index" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
      <AdminDrawer.Screen name="users" component={AdminUsersScreen} options={{ title: 'Manage Users' }} />
      {/* <AdminDrawer.Screen name="user-detail" component={AdminUserDetailScreen} options={{ title: 'User Detail' }} /> */}
      <AdminDrawer.Screen name="profile" component={AdminProfileScreen} options={{ title: 'Profile' }} />
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
        drawerStyle: { width: 280 },
      }}
    >
      <HrDrawer.Screen name="index" component={HrDashboardScreen} options={{ title: 'HR Dashboard' }} />
      <HrDrawer.Screen name="candidates" component={HrCandidatesScreen} options={{ title: 'Candidates' }} />
      <HrDrawer.Screen name="profile" component={HrProfileScreen} options={{ title: 'Profile' }} />
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
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    // marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 12,
    elevation: 3,
    width:"100%"
  },
  drawerIcon: {
    height: 52,
    width: 52,
    borderRadius: 26,
    backgroundColor: colors.white,
    padding: 5,
    marginRight: 12,
  },
  drawerIdentity: {
    flex: 1,
    minWidth: 0,
  },
  drawerName: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  drawerRole: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
  },
  drawerLogout: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  hiddenDrawerItem: {
    display: 'none',
  },
});
