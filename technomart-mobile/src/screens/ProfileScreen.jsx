// screens/ProfileScreen.jsx
import React, { useEffect, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Switch,
  Linking,
  Alert,
  BackHandler,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather, Ionicons, AntDesign } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import ConfirmLogoutModal from '../components/ConfirmLogoutModal';
import BottomNavigation from '../components/BottomNavigation';
import { useCart } from '../context/CartContext';
import * as ImagePicker from 'expo-image-picker';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=800&auto=format&fit=crop';

const Row = ({
  iconPack = 'Feather',
  icon,
  tint = '#8B8B8B',
  title,
  onPress,
  valueRight,
  accessibilityLabel,
}) => {
  const IconPack = { Feather, Ionicons, MaterialCommunityIcons, AntDesign }[iconPack];
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between px-4 py-4"
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}>
      <View className="flex-row items-center">
        <View
          className="mr-3 h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: '#F5F6FA' }}
          accessible={false}>
          <IconPack name={icon} size={18} color={tint} />
        </View>
        <Text className="text-[15px] text-text">{title}</Text>
      </View>

      {valueRight ?? <Feather name="chevron-right" size={18} color="#C6C6C6" />}
    </TouchableOpacity>
  );
};

const Section = ({ children }) => <View className="mt-4 rounded-2xl bg-[#f5f5f5]">{children}</View>;

export default function ProfileScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const lockNavigation = route?.params?.lockNavigation ?? false;
  const { totalItems } = useCart();
  const cartHasItems = totalItems > 0;

  // Existing state
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const creditPoints = 0.01;
  const [avatarUri, setAvatarUri] = React.useState(DEFAULT_AVATAR);

  // Local inline Settings state (no extra navigation)
  const [settingsExpanded, setSettingsExpanded] = React.useState(true);
  const [theme, setTheme] = React.useState('System'); // "System" | "Light" | "Dark"
  const [cameraAllowed, setCameraAllowed] = React.useState(false);

  // NEW: show/hide confirm modal
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);

  // Flag to allow leaving this screen ONLY when logging out
  const isLoggingOut = useRef(false);

  const handleBottomTabPress = (key) => {
    if (key === 'profile') return;
    if (lockNavigation) return;
    if (key === 'home') {
      navigation.navigate('Home');
      return;
    }
    if (key === 'cart') {
      navigation.navigate('Cart');
      return;
    }
    if (key === 'history') {
      navigation.navigate('OrderHistory');
      return;
    }
    if (key === 'alerts') {
      navigation.navigate('Alerts');
      return;
    }
    Alert.alert('Coming soon', 'This section will be available in a future update.');
  };

  const handlePickAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission needed',
          'We need access to your photos to update your profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled) {
        const uri = result.assets?.[0]?.uri;
        if (uri) setAvatarUri(uri);
      }
    } catch (err) {
      console.warn('Avatar selection failed', err);
      Alert.alert('Upload failed', "We couldn't update your photo. Please try again.");
    }
  };

  // Disable gestures & header back (prevents iOS swipe-back, etc.)
  useLayoutEffect(() => {
    if (!lockNavigation) return;
    navigation?.setOptions?.({
      gestureEnabled: false,
      headerBackVisible: false,
    });
  }, [navigation, lockNavigation]);

  // Intercept any attempt to leave this screen (back, gesture, programmatic)
  useEffect(() => {
    if (!lockNavigation) return undefined;
    const sub = navigation.addListener('beforeRemove', (e) => {
      // Allow if we are logging out (we call replace('Login'))
      if (isLoggingOut.current) return;
      // Block all other attempts to leave Profile
      e.preventDefault();
    });
    return sub;
  }, [navigation, lockNavigation]);

  // Block Android hardware back button
  useFocusEffect(
    React.useCallback(() => {
      if (!lockNavigation) return undefined;
      const onBackPress = () => true; // consume/back blocked
      const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => sub.remove();
    }, [lockNavigation])
  );

  const cycleTheme = () => {
    setTheme((prev) => (prev === 'System' ? 'Light' : prev === 'Light' ? 'Dark' : 'System'));
  };

  const requestOrToggleCamera = () => {
    if (!cameraAllowed) {
      Alert.alert(
        'Camera Permission',
        'Simulating a camera permission prompt here. Replace with your permission request logic.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Allow', onPress: () => setCameraAllowed(true) },
        ]
      );
    } else {
      Alert.alert('Revoke Permission?', 'This will simulate revoking camera access.', [
        { text: 'Keep', style: 'cancel' },
        { text: 'Revoke', style: 'destructive', onPress: () => setCameraAllowed(false) },
      ]);
    }
  };

  // Called only after user confirms in the modal
  const confirmLogoutAndNavigate = () => {
    isLoggingOut.current = true;
    // Clear any auth/session state here if needed...
    navigation.replace?.('Login');
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom }}>
      {/* Decorative background icons (like in SignUpScreen) */}
      <View
        className="absolute inset-0"
        accessible={false}
        importantForAccessibility="no-hide-descendants">
        <MaterialCommunityIcons
          name="pizza"
          size={96}
          color="#FFC999"
          style={{ position: 'absolute', top: 40, left: 20, opacity: 0.15 }}
        />
        <MaterialCommunityIcons
          name="french-fries"
          size={96}
          color="#FFC999"
          style={{ position: 'absolute', top: 120, right: 20, opacity: 0.15 }}
        />
        <MaterialCommunityIcons
          name="cup"
          size={96}
          color="#FFC999"
          style={{ position: 'absolute', top: 220, left: 80, opacity: 0.15 }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 140 }}
        showsVerticalScrollIndicator={false}>
        {/* Profile hero */}
        <LinearGradient
          colors={['#FFE6D4', '#FFF7EE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHero}>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={handlePickAvatar}
              style={styles.avatarWrapper}
              accessibilityRole="button"
              accessibilityLabel="Update profile photo">
              <Image
                source={{ uri: avatarUri }}
                style={styles.avatarImage}
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
              <View style={styles.avatarBadge}>
                <Feather name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <View className="ml-4 flex-1">
              <Text className="text-xl font-semibold text-text">Joseph Andrade</Text>
              <View className="mt-1 flex-row items-center">
                <MaterialCommunityIcons name="map-marker" size={14} color="#F07F13" />
                <Text className="ml-1 text-xs text-sub">TechnoMart Campus</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate?.('PersonalInfo')}
                style={styles.heroActionButton}
                className="mt-3 flex-row items-center self-start"
                accessibilityRole="button"
                accessibilityLabel="Edit personal information">
                <Feather name="edit-2" size={14} color="#452B1A" />
                <Text style={styles.heroActionText}>Edit profile</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        {/* Credit Points */}
        <TouchableOpacity
          className="mt-4 rounded-2xl px-5 py-4 pb-5 pt-5"
          style={{ backgroundColor: '#F07F13' }}
          accessibilityRole="button"
          accessibilityLabel="Credit points"
          onPress={() => navigation.navigate?.('Credits')}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="star-circle" size={24} color="#FFF" />
              <Text className="ml-2 text-base font-semibold text-white">Credit Points</Text>
            </View>
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-extrabold text-white">{creditPoints}</Text>
              <Text className="ml-1 text-white/90">pts</Text>
              <Feather name="chevron-right" size={18} color="#FFF" style={{ marginLeft: 6 }} />
            </View>
          </View>
          <Text className="mt-1 text-[12px] text-white/85">Use points at checkout to save on</Text>
          <Text className="text-[12px] text-white/85">your next order.</Text>
        </TouchableOpacity>

        {/* Personal / Feedback */}
        <Section>
          <Row
            iconPack="Feather"
            icon="user"
            tint="#F07F13"
            title="Personal Info"
            onPress={() => navigation.navigate?.('PersonalInfo')}
          />
          <View className="mx-4 h-[1px] bg-gray-200" />
          <Row
            iconPack="Feather"
            icon="message-circle"
            tint="#6ED3C7"
            title="Share Feedback"
            onPress={() => navigation.navigate?.('Feedback')}
          />
        </Section>

        {/* FAQs + Inline Settings */}
        <Section>
          <Row
            iconPack="AntDesign"
            icon="questioncircleo"
            tint="#FF6F61"
            title="FAQs"
            onPress={() => navigation.navigate?.('FAQs')}
          />
          <View className="mx-4 h-[1px] bg-gray-200" />

          {/* Settings (inline, expandable) */}
          <Row
            iconPack="Feather"
            icon="settings"
            tint="#8B5CF6"
            title="Settings"
            onPress={() => setSettingsExpanded((v) => !v)}
            valueRight={
              <Feather
                name={settingsExpanded ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#C6C6C6"
              />
            }
          />

          {settingsExpanded && (
            <View className="pb-2">
              {/* Appearance */}
              <View className="mx-4 h-[1px] bg-gray-200" />
              <Row
                iconPack="Feather"
                icon="moon"
                tint="#7C3AED"
                title="Appearance"
                onPress={cycleTheme}
                valueRight={
                  <View className="rounded-md px-2 py-1" style={{ backgroundColor: '#EDE9FE' }}>
                    <Text className="text-xs text-[#5B21B6]">{theme}</Text>
                  </View>
                }
              />

              {/* Notifications */}
              <View className="mx-4 h-[1px] bg-gray-200" />
              <Row
                iconPack="Feather"
                icon="bell"
                tint="#10B981"
                title="Notifications"
                onPress={() => setPushEnabled((v) => !v)}
                valueRight={
                  <Switch
                    value={pushEnabled}
                    onValueChange={setPushEnabled}
                    accessibilityLabel="Toggle push notifications"
                  />
                }
              />

              {/* Camera Permission */}
              <View className="mx-4 h-[1px] bg-gray-200" />
              <Row
                iconPack="Feather"
                icon="camera"
                tint="#F59E0B"
                title="Camera Permission"
                onPress={requestOrToggleCamera}
                valueRight={
                  <View className="flex-row items-center">
                    <View
                      className="mr-2 rounded-md px-2 py-[2px]"
                      style={{ backgroundColor: cameraAllowed ? '#DCFCE7' : '#FEE2E2' }}>
                      <Text
                        className="text-xs"
                        style={{ color: cameraAllowed ? '#166534' : '#991B1B' }}>
                        {cameraAllowed ? 'Allowed' : 'Not allowed'}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#C6C6C6" />
                  </View>
                }
              />
            </View>
          )}
        </Section>

        {/* About + Legal & Policies (before Log Out) */}
        <Section>
          <Row
            iconPack="Feather"
            icon="info"
            tint="#3B82F6"
            title="About"
            onPress={() => Linking.openURL('https://www.facebook.com/jseph.andrade')}
          />

          <View className="mx-4 h-[1px] bg-gray-200" />
          <Row
            iconPack="Feather"
            icon="file-text"
            tint="#9CA3AF"
            title="Legal & Policies"
            onPress={() => Linking.openURL('https://www.facebook.com/jseph.andrade')}
          />
        </Section>

        {/* Log Out — tap to open modal (separate component) */}
        <Section>
          <Row
            iconPack="Feather"
            icon="log-out"
            tint="#EF4444"
            title="Log Out"
            onPress={() => setShowLogoutConfirm(true)}
            accessibilityLabel="Log out"
          />
        </Section>

        <View className="h-6" />
      </ScrollView>

      <BottomNavigation
        activeKey="profile"
        cartHasItems={cartHasItems}
        onTabPress={handleBottomTabPress}
        disableAll={lockNavigation}
      />

      {/* Confirmation Modal */}
      <ConfirmLogoutModal
        visible={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogoutAndNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  profileHero: {
    marginTop: 20,
    borderRadius: 32,
    padding: 20,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F07F13',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionButton: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  heroActionText: {
    color: '#452B1A',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
});
