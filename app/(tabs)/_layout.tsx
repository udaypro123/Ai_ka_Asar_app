import { Drawer } from 'expo-router/drawer';
import { Text, View, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../src/store/hooks';
import { logout } from '../../src/store/slices/authSlice';
import { colors, typography, spacing, borderRadius } from '../../src/theme';

function DrawerContent(props: any) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN');
  const isHR = user?.roles?.includes('HR');

  const menuItems = [
    { name: 'index', title: 'Dashboard', icon: '🏠' },
    { name: 'community', title: 'Community', icon: '👥' },
    { name: 'impact', title: 'Impact', icon: '📈' },
    { name: 'career', title: 'Career', icon: '💼' },
    { name: 'skills', title: 'Skills', icon: '⭐' },
    { name: 'profile', title: 'Profile', icon: '👤' },
  ];

  if (isAdmin || isHR) {
    menuItems.push({ name: 'users', title: 'Manage Users', icon: '👥' });

  }

  if (isAdmin) {
    menuItems.push({ name: 'admin', title: 'Admin Panel', icon: '📊' });
  }

  const navigate = (route: string) => {
    props.navigation?.closeDrawer();
    if (route === 'index') {
      router.navigate('/(tabs)');
    } else if (route === 'admin') {
      router.navigate('/(admin)');
    } else if (route === 'users') {
      router.navigate('/(tabs)/users');
    } else {
      router.navigate('/(tabs)/' + route);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          dispatch(logout());
          router.replace('(auth)/login');
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.appName}>{user?.name || 'User'}</Text>
        </View>
      </View>
      <View style={styles.diveder} />

      <View style={styles.section}>
        <View style={styles.card}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.name}
              style={[
                styles.item,
                index !== menuItems.length - 1 && styles.itemBorder,
              ]}
              onPress={() => navigate(item.name)}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.itemText}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('(auth)/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <Drawer
      drawerContent={DrawerContent}
      screenOptions={{
        headerShown: true,
        headerStyle: styles.headerBar,
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.6)',
        sceneStyle: {
          backgroundColor: colors.auth.bgStart,
        },
      }}
    >
      <Drawer.Screen name="index" options={{ title: 'Dashboard' }} />
      <Drawer.Screen name="community" options={{ title: 'Community' }} />
      <Drawer.Screen name="impact" options={{ title: 'Impact' }} />
      <Drawer.Screen name="career" options={{ title: 'Career' }} />
      <Drawer.Screen name="skills" options={{ title: 'Skills' }} />
      <Drawer.Screen name="profile" options={{ title: 'Profile' }} />
      <Drawer.Screen name="users" options={{ title: 'Manage Users' }} />
      <Drawer.Screen name="admin" options={{ title: 'Admin Panel' }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    backgroundColor: colors.auth.bgStart,
    borderBottomColor: colors.auth.cardBorder,
    borderBottomWidth: 1,
    elevation: 8,
    shadowColor: colors.auth.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  container: {
    flex: 1,
    backgroundColor: "#0854e2",
    paddingTop: 80,
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  logoCircle: {
    width: 62,
    height: 62,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.auth.primaryLight,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  diveder: {
    width: '100%',
    height: 5,
    borderRadius: 36,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  appName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: 'white',
    marginBottom: spacing.xs,
    marginLeft: 25,
  },
  section: {
    marginBottom: spacing.xl,
  },
  card: {
    backgroundColor: '#ffffff08',
    borderWidth: 1,
    borderColor: '#ffffff08',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  itemBorder: {
    borderBottomColor: '#ffffff0c',
    borderBottomWidth: 3,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: '#ffffff08',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: '#ffffff28',
  },
  icon: {
    fontSize: 18,
  },
  itemText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: 'white',
  },
  logoutButton: {
    backgroundColor: '#ef4444',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  logoutText: {
    color: 'white',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.auth.textTertiary,
  },
});
