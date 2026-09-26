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
import { DrawerLogoutButton } from '../../src/components/common/DrawerLogoutButton';

function CustomDrawerContent(props: any) {
  const { user } = useAppSelector((state) => state.auth);

  const role = user?.roles?.[0] || 'HR';

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileSection}>
        <Image
          source={require('../../assets/icon1.png')}
          style={styles.profileImage}
        />

        <Text style={styles.name}>
          {user?.name || 'HR User'}
        </Text>

        <Text style={styles.role}>
          {role}
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Drawer Menu */}
      <View style={styles.menu}>
        <DrawerItem
          label="Dashboard"
          icon="grid-outline"
          onPress={() => props.navigation.navigate('index')}
        />

        <DrawerItem
          label="Candidates"
          icon="people-outline"
          onPress={() => props.navigation.navigate('candidates')}
        />

        {/* <DrawerItem
          label="Messages"
          icon="chatbubbles-outline"
          onPress={() => props.navigation.navigate('messages')}
        /> */}

        <DrawerItem
          label="Profile"
          icon="person-outline"
          onPress={() => props.navigation.navigate('profile')}
        />
      </View>

      <View style={styles.logoutSection}>
        <DrawerLogoutButton />
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

export default function HRLayout() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  const isHR = user?.roles?.includes('HR');
  const isAdmin = user?.roles?.some((role) => role === 'ADMIN' || role === 'SUPER_ADMIN');

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/(auth)/login');
    } else if (!isHR) {
      router.replace((isAdmin ? '/(admin)' : '/(tabs)') as any);
    }
  }, [isAdmin, isAuthenticated, isHR, isLoading, router]);

  if (isLoading || !isAuthenticated || !isHR) {
    return null;
  }

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
          title: 'HR Dashboard',
        }}
      />

      <Drawer.Screen
        name="candidates"
        options={{
          title: 'Candidates',
        }}
      />

      <Drawer.Screen
        name="messages"
        options={{
          title: 'Messages',
        }}
      />

      <Drawer.Screen
        name="profile"
        options={{
          title: 'Profile',
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

  logoutSection: {
    marginTop: 'auto',
    paddingHorizontal: 12,
    paddingBottom: 24,
    marginBottom: 20,
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