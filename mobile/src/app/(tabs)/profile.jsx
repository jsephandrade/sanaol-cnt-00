import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';

import ConfirmLogoutModal from '../../components/ConfirmLogoutModal';
import { useAuth } from '../../context/AuthContext';
import { useUploadAvatar } from '../../api/hooks';

const OptionRow = ({ icon, label, onPress, trailing, tint = '#F07F13' }) => (
  <TouchableOpacity style={styles.optionRow} onPress={onPress}>
    <View style={styles.optionLeft}>
      <View style={[styles.optionIcon, { backgroundColor: `${tint}14` }]}>
        <Feather name={icon} size={18} color={tint} />
      </View>
      <Text style={styles.optionLabel}>{label}</Text>
    </View>
    {trailing ?? <Feather name="chevron-right" size={18} color="#cbd5e1" />}
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, refreshProfile, signOut, setUser } = useAuth();
  const { mutateAsync: uploadAvatar, isPending: avatarUploading } =
    useUploadAvatar();

  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isLoggingOut = useRef(false);

  const isGuest = Boolean(user?.is_guest);
  const displayName = user?.name?.trim() || '';
  const primaryEmail = user?.email?.trim() || '';

  const roleLabel = useMemo(() => {
    if (!user?.role) return null;
    return user.role
      .toString()
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [user?.role]);

  const statusLabel = useMemo(() => {
    if (!user?.status) return null;
    const normalized = user.status.toLowerCase();
    if (normalized === 'active') return null;
    return normalized
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }, [user?.status]);

  useFocusEffect(
    useCallback(() => {
      if (isGuest) {
        return () => {};
      }
      let active = true;
      setSyncing(true);
      refreshProfile()
        .catch((error) => {
          if (!active) {
            return;
          }
          Alert.alert(
            'Profile sync failed',
            error?.message || 'Unable to refresh your profile right now.'
          );
        })
        .finally(() => {
          if (active) {
            setSyncing(false);
          }
        });
      return () => {
        active = false;
      };
    }, [isGuest, refreshProfile])
  );

  const handleRefresh = useCallback(async () => {
    if (isGuest) {
      Alert.alert(
        'Guest profile',
        'Sign in to sync your profile and see account details.'
      );
      return;
    }
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch (error) {
      Alert.alert(
        'Profile sync failed',
        error?.message || 'Unable to refresh your profile right now.'
      );
    } finally {
      setRefreshing(false);
    }
  }, [isGuest, refreshProfile]);

  const handleAvatarPress = useCallback(async () => {
    if (isGuest) {
      Alert.alert('Guest profile', 'Sign in to upload a profile photo.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission needed',
        'Allow photo library access so we can update your profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    if (!asset?.uri) {
      Alert.alert('Upload failed', 'We could not read the selected image.');
      return;
    }

    try {
      const updatedUser = await uploadAvatar({
        uri: asset.uri,
        name: asset.fileName ?? `avatar-${Date.now()}.jpg`,
        type: asset.mimeType ?? 'image/jpeg',
      });
      if (updatedUser) {
        setUser?.(updatedUser);
        Alert.alert('Profile photo updated', 'Your new photo is saved.');
      }
    } catch (error) {
      Alert.alert(
        'Upload failed',
        error?.message || 'We could not update your profile picture.'
      );
    }
  }, [isGuest, uploadAvatar, setUser]);

  const confirmLogoutAndNavigate = useCallback(async () => {
    if (isLoggingOut.current) {
      return;
    }
    isLoggingOut.current = true;
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      Alert.alert(
        'Log out failed',
        error?.message || 'Unable to end your session right now.'
      );
    } finally {
      isLoggingOut.current = false;
      setShowLogoutConfirm(false);
    }
  }, [signOut, router]);

  const avatarNode = user?.avatar ? (
    <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
  ) : (
    <View style={styles.avatarFallback}>
      <Feather name="user" size={32} color="#F07F13" />
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingTop: insets.top + 24 }]}>
        <View style={styles.heroTopRow}>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={handleAvatarPress}
            activeOpacity={0.85}
          >
            {avatarNode}
            <View style={styles.avatarBadge}>
              {avatarUploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="edit-2" size={14} color="#fff" />
              )}
            </View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            {displayName ? (
              <Text style={styles.heroName}>{displayName}</Text>
            ) : (
              <Text style={styles.heroPrompt}>
                Add your name to complete your profile.
              </Text>
            )}
            {primaryEmail ? (
              <Text style={styles.heroEmail}>{primaryEmail}</Text>
            ) : null}
            <View style={styles.heroChips}>
              {roleLabel ? (
                <View style={styles.heroChip}>
                  <Text style={styles.heroChipText}>{roleLabel}</Text>
                </View>
              ) : null}
              {statusLabel ? (
                <View style={[styles.heroChip, styles.heroChipMuted]}>
                  <Text style={styles.heroChipText}>{statusLabel}</Text>
                </View>
              ) : null}
              {syncing ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{ marginLeft: 6 }}
                />
              ) : null}
            </View>
          </View>
        </View>
        {isGuest ? (
          <View style={styles.heroNotice}>
            <Feather name="info" size={16} color="#7c2d12" />
            <Text style={styles.heroNoticeText}>
              You are browsing as a guest. Sign in to access orders and loyalty
              history.
            </Text>
          </View>
        ) : null}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F07F13"
            colors={['#F07F13']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <OptionRow
            icon="user"
            label="Personal Information"
            onPress={() => router.push('/screens/PersonalInfo')}
          />
          <OptionRow
            icon="shopping-bag"
            label="Order History"
            onPress={() => router.push('/screens/OrderHistory')}
            tint="#f97316"
          />
          <OptionRow
            icon="credit-card"
            label="Payment Methods"
            onPress={() => router.push('/screens/PaymentMethods')}
            tint="#d97706"
          />
        </View>

        <View style={styles.section}>
          <OptionRow
            icon="help-circle"
            label="Help & Support"
            onPress={() => router.push('/screens/FAQs')}
            tint="#475569"
          />
          <OptionRow
            icon="shield"
            label="Account Settings"
            onPress={() => router.push('/screens/Settings')}
            tint="#0f172a"
          />
        </View>

        <View style={styles.section}>
          <OptionRow
            icon="log-out"
            label="Log Out"
            tint="#ef4444"
            onPress={() => setShowLogoutConfirm(true)}
            trailing={
              <Feather name="chevron-right" size={18} color="#ef4444" />
            }
          />
        </View>
      </ScrollView>

      <ConfirmLogoutModal
        visible={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogoutAndNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  hero: {
    backgroundColor: '#F07F13',
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: 'rgba(240, 127, 19, 0.35)',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    marginRight: 18,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: '#fff',
  },
  avatarFallback: {
    width: 88,
    height: 88,
    borderRadius: 26,
    backgroundColor: '#fff7ed',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(240,127,19,0.4)',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: '#ea580c',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff7ed',
  },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '700' },
  heroPrompt: { color: '#fff', fontSize: 18, fontWeight: '600' },
  heroEmail: { color: 'rgba(255,255,255,0.85)', marginTop: 6, fontSize: 14 },
  heroChips: { flexDirection: 'row', marginTop: 12, flexWrap: 'wrap' },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.28)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
    marginTop: 6,
  },
  heroChipMuted: { backgroundColor: 'rgba(30, 41, 59, 0.25)' },
  heroChipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  heroNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  heroNoticeText: { color: '#fff', fontSize: 13, flex: 1, lineHeight: 18 },
  content: { flex: 1, paddingHorizontal: 16 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 8,
    marginTop: 24,
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  optionLeft: { flexDirection: 'row', alignItems: 'center' },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionLabel: { fontSize: 16, fontWeight: '600', color: '#1f2937' },
});
