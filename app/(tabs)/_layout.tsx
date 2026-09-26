import { Drawer } from 'expo-router/drawer';
import { Text, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { DrawerLogoutButton } from '../../src/components/common/DrawerLogoutButton';
import { colors, typography, spacing } from '../../src/theme';

const tabRoutePaths: Record<string, Href> = {
  community: '/(tabs)/community',
  impact: '/(tabs)/impact',
  career: '/(tabs)/career',
  skills: '/(tabs)/skills',
  profile: '/(tabs)/profile',
};

type DrawerIconName =
  | 'grid-outline'
  | 'people-outline'
  | 'trending-up-outline'
  | 'briefcase-outline'
  | 'star-outline'
  | 'person-outline'
  | 'bar-chart-outline';

function DrawerContent(props: any) {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN');
  const isHR = user?.roles?.includes('HR');

  const menuItems: { name: string; title: string; icon: DrawerIconName }[] = [
    { name: 'index', title: 'Dashboard', icon: 'grid-outline' },
    { name: 'community', title: 'Community', icon: 'people-outline' },
    { name: 'impact', title: 'Impact', icon: 'trending-up-outline' },
    { name: 'career', title: 'Career', icon: 'briefcase-outline' },
    { name: 'skills', title: 'Skills', icon: 'star-outline' },
    { name: 'profile', title: 'Profile', icon: 'person-outline' },
  ];

  if (isAdmin || isHR) {
    menuItems.push({ name: 'users', title: 'Manage Users', icon: 'people-outline' });

  }

  if (isAdmin) {
    menuItems.push({ name: 'admin', title: 'Admin Panel', icon: 'bar-chart-outline' });
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
      const destination = tabRoutePaths[route];
      if (destination) router.navigate(destination);
    }
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
              <Ionicons name={item.icon} size={22} color="#0047ec" />
              <Text style={styles.itemText}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <DrawerLogoutButton />
        <View style={styles.footer}>
          <Text style={styles.footerText}>Version 1.0.0</Text>
        </View>
      </View>
    </ScrollView>
  );
}

export default function TabsLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roles?.some((role) => role === 'ADMIN' || role === 'SUPER_ADMIN');
  const isHR = user?.roles?.includes('HR');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (isAdmin) {
      router.replace('/(admin)');
    } else if (isHR) {
      router.replace('/(hr)');
    }
  }, [isAdmin, isAuthenticated, isHR, isLoading, router]);

  if (isLoading || !isAuthenticated || isAdmin || isHR) return null;

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
    flexGrow: 1,
    backgroundColor: '#ffffff',
    paddingTop: 0,
    paddingHorizontal: 0,
  },
  header: {
    backgroundColor: '#0047ec',
    alignItems: 'center',
    paddingTop: 55,
    paddingBottom: 25,
  },
  logoContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoCircle: {
    width: 75,
    height: 75,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  diveder: {
    width: '100%',
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0047ec',
  },
  appName: {
    fontSize: 19,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    paddingTop: 15,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
  itemBorder: {
    borderBottomColor: '#e2e8f0',
    borderBottomWidth: 1,
  },
  itemText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
  bottomSection: {
    marginTop: 'auto',
    paddingHorizontal: 12,
    paddingBottom: spacing.md,
  },
  footer: {
    paddingVertical: spacing.xs,
    alignItems: 'center',
    marginBottom: 40,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: '#64748b',
  },
});
