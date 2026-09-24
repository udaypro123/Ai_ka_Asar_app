import { Drawer } from 'expo-router/drawer';
import { Text, View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useAppSelector } from '../../src/store/hooks';
import { colors, typography, spacing, borderRadius } from '../../src/theme';

function DrawerContent(props: any) {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('SUPER_ADMIN') || user?.roles?.includes('HR');

  const items = [
    { name: 'index', title: 'Dashboard', icon: '🏠' },
    { name: 'users', title: 'Community', icon: '👥' },
    ...(isAdmin ? [{ name: 'admin', title: 'Admin Panel', icon: '📊' }] : []),
    { name: 'impact', title: 'Impact', icon: '📈' },
    { name: 'career', title: 'Career', icon: '💼' },
    { name: 'skills', title: 'Skills', icon: '⭐' },
    { name: 'profile', title: 'Profile', icon: '👤' },
  ];

  const navigate = (route: string) => {
    const path = route === 'index' ? '(user)' : '(user)/' + route;
    router.replace(path as any);
    props.navigation?.closeDrawer?.();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>AI</Text>
          </View>
          <Text style={styles.appName}>Ai ka Asar</Text>
        </View>
      </View>
      <View style={styles.diveder}>
      </View>


      <View style={styles.section}>
        {/* <Text style={styles.sectionTitle}>Menu</Text> */}
        <View style={styles.card}>
          {items.map((item, index) => (
            <Pressable
              key={item.name}
              style={[
                styles.item,
                index !== items.length - 1 && styles.itemBorder,
              ]}
              onPress={() => navigate(item.name)}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.itemText}>{item.title}</Text>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>›</Text>
              </View>
            </Pressable>
          ))}
        </View>
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
      router.replace('(auth)/login' as any);
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
      <Drawer.Screen
        name="index"
        options={{
          title: 'Dashboard',
          headerTitle: 'My Dashboard',
        }}
      />
      <Drawer.Screen
        name="users"
        options={{
          title: 'Community',
          headerTitle: 'Community Posts',
        }}
      />
      <Drawer.Screen
        name="admin"
        options={{
          title: 'Admin Panel',
          headerTitle: 'Admin Dashboard',
        }}
      />
      <Drawer.Screen
        name="impact"
        options={{
          title: 'Impact',
          headerTitle: 'AI Impact',
        }}
      />
      <Drawer.Screen
        name="career"
        options={{
          title: 'Career',
          headerTitle: 'Career Journey',
        }}
      />
      <Drawer.Screen
        name="skills"
        options={{
          title: 'Skills',
          headerTitle: 'Skills Analysis',
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
        }}
      />
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
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
    width: "100%",
    height: 5,
    borderRadius: 36,
    backgroundColor: "white",
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: "white",
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.white,
  },
  appName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: "white",
    marginBottom: spacing.xs,
    marginLeft: 25
  },
  tagline: {
    fontSize: typography.fontSize.sm,
    color: colors.auth.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: "white",
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  card: {
    backgroundColor: "#ffffff08",
    // borderLeftColor:"#ffffff60",
    borderWidth: 1,
    borderColor: "#ffffff08",
    overflow: 'hidden',
    // elevation: 6,
    // shadowColor: colors.auth.glow,
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.25,
    // shadowRadius: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  itemBorder: {
    borderBottomColor: "#ffffff0c",
    borderBottomWidth: 3,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: "#ffffff08",
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: "#ffffff28",
  },
  icon: {
    fontSize: 18,
  },
  itemText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: "white",
  },
  arrowContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 20,
    color: "white",
    fontWeight: '300',
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
