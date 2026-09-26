import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
} from 'react-native';
import { useAppSelector } from '../../src/store/hooks';

function CustomDrawerContent(props: any) {
  const { user } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const role = user?.roles?.[0] || 'USER';

  const menuItems = [
    { name: 'index', title: 'Dashboard', icon: 'grid-outline', route: '/(tabs)' },
    { name: 'community', title: 'Community', icon: 'people-outline', route: '/(tabs)/community' },
    { name: 'impact', title: 'Impact', icon: 'trending-up-outline', route: '/(tabs)/impact' },
    { name: 'career', title: 'Career', icon: 'briefcase-outline', route: '/(tabs)/career' },
    { name: 'skills', title: 'Skills', icon: 'star-outline', route: '/(tabs)/skills' },
    { name: 'profile', title: 'Profile', icon: 'person-outline', route: '/(tabs)/profile' },
  ];

  const navigate = (route: string) => {
    props.navigation?.closeDrawer();
    router.replace(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileSection}>
        <Image
          source={require('../../assets/icon1.png')}
          style={styles.profileImage}
        />
        <Text style={styles.name}>
          {user?.name || 'User'}
        </Text>
        <Text style={styles.role}>
          {role}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <DrawerItem
            key={item.name}
            label={item.title}
            icon={item.icon}
            onPress={() => navigate(item.route)}
          />
        ))}
      </View>
    </View>
  );
}

function DrawerItem({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: any;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
      onPress={onPress}
    >
      <Ionicons
        name={icon}
        size={22}
        color="#0047ec"
      />
      <Text style={styles.menuText}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function UserLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <Drawer
      drawerContent={(props) => (
        <CustomDrawerContent {...props} />
      )}
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#0047ecc1',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontSize: 18,
          fontWeight: '600',
        },
        drawerStyle: {
          width: 280,
        },
        drawerActiveTintColor: '#0047ec',
        drawerInactiveTintColor: '#64748b',
        drawerLabelStyle: {
          fontSize: 15,
          fontWeight: '500',
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  profileSection: {
    backgroundColor: '#0047ec',
    paddingTop: 55,
    paddingBottom: 25,
    alignItems: 'center',
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#ffffff',
    marginBottom: 12,
    objectFit: 'contain',
  },
  name: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '700',
  },
  role: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
    backgroundColor: '#ffffff25',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  menu: {
    paddingTop: 15,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 5,
  },
  menuItemPressed: {
    backgroundColor: '#eff6ff',
  },
  menuText: {
    marginLeft: 15,
    fontSize: 15,
    fontWeight: '500',
    color: '#1e293b',
  },
});
