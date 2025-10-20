import React, { useCallback, useMemo, useRef, useState } from 'react';
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
  ImageBackground,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MaterialCommunityIcons,
  Feather,
  Ionicons,
  AntDesign,
} from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import ConfirmLogoutModal from '../../components/ConfirmLogoutModal';
import { useAuth } from '../../context/AuthContext';

const Row = ({
  iconPack = 'Feather',
  icon,
  tint = '#8B8B8B',
  title,
  onPress,
  valueRight,
}) => {
  const IconPack = { Feather, Ionicons, MaterialCommunityIcons, AntDesign }[
    iconPack
  ];
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 4,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: '#F5F6FA',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
          }}
        >
          <IconPack name={icon} size={20} color={tint} />
        </View>
        <Text style={{ fontSize: 16, fontWeight: '500', color: '#333' }}>
          {title}
        </Text>
      </View>
      {valueRight ?? <Feather name="chevron-right" size={20} color="#C6C6C6" />}
    </TouchableOpacity>
  );
};

const Section = ({ children }) => (
  <View
    style={{
      marginTop: 16,
      backgroundColor: '#f5f5f5',
      borderRadius: 16,
      overflow: 'hidden',
    }}
  >
    {children}
  </View>
);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, refreshProfile, signOut } = useAuth();

  const [refreshing, setRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isLoggingOut = useRef(false);

  const formatLabel = useCallback(
    (value) =>
      (value || '')
        .toString()
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase()),
    []
  );

  const isGuest = Boolean(user?.is_guest);
  const displayName = useMemo(() => {
    if (!user) {
      return 'Loading...';
    }
    if (user.name) {
      return user.name;
    }
    const composed = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(' ');
    if (composed) {
      return composed;
    }
    if (user.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  }, [user]);
  const primaryEmail = user?.email || (isGuest ? 'guest@local.dev' : '');
  const roleChipLabel = useMemo(() => {
    if (isGuest) {
      return 'Guest';
    }
    return user?.role ? formatLabel(user.role) : null;
  }, [formatLabel, isGuest, user?.role]);
  const statusChipLabel = useMemo(() => {
    if (isGuest) {
      return null;
    }
    const status = user?.status;
    if (!status || status.toLowerCase() === 'active') {
      return null;
    }
    return formatLabel(status);
  }, [formatLabel, isGuest, user?.status]);
  const phoneNumber = user?.phone?.trim() ? user.phone.trim() : null;
  const avatarSource = useMemo(() => {
    if (user?.avatar) {
      return { uri: user.avatar };
    }
    return {
      uri: 'https://media.istockphoto.com/id/2014684899/vector/placeholder-avatar-female-person-default-woman-avatar-image-gray-profile-anonymous-face.jpg?s=612x612&w=0&k=20&c=D-dk9ek0_jb19TiMVNVmlpvYVrQiFiJmgGmiLB5yE4w=',
    };
  }, [user?.avatar]);
  const creditPointsValue = useMemo(() => {
    const raw = user?.credit_points ?? user?.creditPoints ?? 0;
    const numeric =
      typeof raw === 'number'
        ? raw
        : typeof raw === 'string'
          ? parseFloat(raw)
          : Number(raw || 0);
    return Number.isFinite(numeric) ? numeric : 0;
  }, [user?.creditPoints, user?.credit_points]);
  const creditPointsDisplay = useMemo(
    () =>
      creditPointsValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [creditPointsValue]
  );

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true;
      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => sub.remove();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      if (isGuest) {
        return () => {};
      }
      let isActive = true;
      setSyncing(true);
      refreshProfile()
        .catch((error) => {
          if (!isActive) {
            return;
          }
          console.error('Profile sync failed:', error);
          Alert.alert(
            'Profile Update Failed',
            error?.message || 'Unable to sync your profile right now.'
          );
        })
        .finally(() => {
          if (isActive) {
            setSyncing(false);
          }
        });
      return () => {
        isActive = false;
      };
    }, [isGuest, refreshProfile])
  );

  const handleRefresh = useCallback(async () => {
    if (isGuest) {
      Alert.alert(
        'Guest Mode',
        'Sign in or create an account to sync your profile and credit points.'
      );
      return;
    }
    setRefreshing(true);
    try {
      await refreshProfile();
    } catch (error) {
      console.error('Profile refresh failed:', error);
      Alert.alert(
        'Profile Update Failed',
        error?.message || 'Unable to refresh your profile right now.'
      );
    } finally {
      setRefreshing(false);
    }
  }, [isGuest, refreshProfile]);

  const handleCreditPress = useCallback(() => {
    if (isGuest) {
      Alert.alert(
        'Earn Credit Points',
        'Sign in to start earning credits from your purchases.'
      );
      return;
    }
    Alert.alert(
      'Credit Points',
      `You currently have ${creditPointsDisplay} points available. Use them at checkout to reduce your total.`
    );
  }, [creditPointsDisplay, isGuest]);

  const requestOrToggleCamera = () => {
    if (!cameraAllowed) {
      Alert.alert('Camera Permission', 'Simulating permission prompt', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Allow', onPress: () => setCameraAllowed(true) },
      ]);
    } else {
      Alert.alert('Revoke Permission?', 'Simulating revoking camera access', [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => setCameraAllowed(false),
        },
      ]);
    }
  };

  const requestOrToggleLocation = () => {
    if (!locationAllowed) {
      Alert.alert('Location Permission', 'Simulating permission prompt', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Allow', onPress: () => setLocationAllowed(true) },
      ]);
    } else {
      Alert.alert('Revoke Permission?', 'Simulating revoking location access', [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: () => setLocationAllowed(false),
        },
      ]);
    }
  };

  const confirmLogoutAndNavigate = useCallback(async () => {
    if (isLoggingOut.current) {
      return;
    }
    isLoggingOut.current = true;
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      Alert.alert(
        'Logout Failed',
        error?.message ||
          'We could not reach the server. Returning to the login screen.'
      );
    } finally {
      setShowLogoutConfirm(false);
      router.replace('/login');
      isLoggingOut.current = false;
    }
  }, [router, signOut]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f9f9f9' }}>
      {/* Header */}
      <ImageBackground
        source={require('../../../assets/drop_1.png')}
        resizeMode="cover"
        style={{
          width: '100%',
          paddingTop: insets.top + 50,
          paddingBottom: 14,
          paddingHorizontal: 14,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'rgba(254,192,117,0.5)',
          }}
        />
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="black" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 30,
              fontFamily: 'Roboto_700Bold',
              color: 'black',
            }}
          >
            Profile
          </Text>
          <Ionicons name="person-outline" size={26} color="black" />
        </View>
      </ImageBackground>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#F07F13"
            colors={['#F07F13']}
            enabled={!isGuest}
          />
        }
      >
        {/* Avatar */}
        <View
          style={{
            backgroundColor: '#fff',
            borderRadius: 16,
            padding: 16,
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 16,
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowRadius: 6,
            elevation: 3,
          }}
        >
          <Image
            source={avatarSource}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#F3F4F6',
            }}
          />
          <View style={{ marginLeft: 16, flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>
              {displayName}
            </Text>
            {primaryEmail ? (
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 4 }}>
                {primaryEmail}
              </Text>
            ) : null}
            {phoneNumber ? (
              <Text style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>
                {phoneNumber}
              </Text>
            ) : null}
            {roleChipLabel || statusChipLabel || syncing ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8,
                }}
              >
                {roleChipLabel ? (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: '#FEF3C7',
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#B45309',
                        fontWeight: '600',
                      }}
                    >
                      {roleChipLabel}
                    </Text>
                  </View>
                ) : null}
                {statusChipLabel ? (
                  <View
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      backgroundColor: '#FFE4E6',
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        color: '#BE123C',
                        fontWeight: '600',
                      }}
                    >
                      {statusChipLabel}
                    </Text>
                  </View>
                ) : null}
                {syncing || refreshing ? (
                  <ActivityIndicator
                    size="small"
                    color="#F07F13"
                    style={{
                      marginLeft: roleChipLabel || statusChipLabel ? 4 : 0,
                    }}
                  />
                ) : null}
              </View>
            ) : null}
          </View>
        </View>

        {/* Credit Points */}
        <TouchableOpacity
          onPress={handleCreditPress}
          activeOpacity={0.9}
          style={{
            backgroundColor: '#F07F13',
            borderRadius: 16,
            padding: 16,
            marginBottom: -5,
            opacity: isGuest ? 0.6 : 1,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons
                name="star-circle"
                size={28}
                color="#fff"
              />
              <Text
                style={{
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: 16,
                  marginLeft: 8,
                }}
              >
                Credit Points
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 20 }}>
                {creditPointsDisplay}
              </Text>
              <Text style={{ color: '#fff', fontSize: 14, marginLeft: 4 }}>
                pts
              </Text>
              <Feather
                name="chevron-right"
                size={18}
                color="#fff"
                style={{ marginLeft: 6 }}
              />
            </View>
          </View>
          <Text style={{ color: '#fff', marginTop: 4, fontSize: 12 }}>
            {isGuest
              ? 'Sign in to start earning rewards on your orders.'
              : 'Use points at checkout to save on your next order.'}
          </Text>
        </TouchableOpacity>

        {/* Sections */}
        <Section>
          <Row
            iconPack="Feather"
            icon="user"
            tint="#F07F13"
            title="Personal Info"
            onPress={() => router.push('/screens/PersonalInfo')}
          />
          <Row
            iconPack="Feather"
            icon="message-circle"
            tint="#6ED3C7"
            title="Share Feedback"
            onPress={() => router.push('/screens/Feedback')}
          />
        </Section>

        <Section>
          <Row
            iconPack="AntDesign"
            icon="questioncircleo"
            tint="#FF6F61"
            title="FAQs"
            onPress={() => router.push('/screens/FAQs')}
          />

          {/* Settings */}
          <Row
            iconPack="Feather"
            icon="settings"
            tint="#8B5CF6"
            title="Settings"
            onPress={() => setSettingsExpanded((prev) => !prev)}
            valueRight={
              <Feather
                name={settingsExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#C6C6C6"
              />
            }
          />

          {settingsExpanded && (
            <View style={{ marginTop: 8, paddingHorizontal: 8 }}>
              {/* Notifications */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#6B7280',
                  marginVertical: 6,
                }}
              >
                App Preferences
              </Text>
              <Row
                iconPack="Feather"
                icon="bell"
                tint="#10B981"
                title="Notifications"
                onPress={() => setPushEnabled((prev) => !prev)}
                valueRight={
                  <Switch value={pushEnabled} onValueChange={setPushEnabled} />
                }
              />

              {/* Permissions */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#6B7280',
                  marginVertical: 6,
                }}
              >
                Permissions
              </Text>
              <Row
                iconPack="Feather"
                icon="camera"
                tint="#F59E0B"
                title="Camera Permission"
                onPress={requestOrToggleCamera}
                valueRight={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                        marginRight: 6,
                        backgroundColor: cameraAllowed ? '#DCFCE7' : '#FEE2E2',
                      }}
                    >
                      <Text
                        style={{
                          color: cameraAllowed ? '#166534' : '#991B1B',
                          fontSize: 12,
                        }}
                      >
                        {cameraAllowed ? 'Allowed' : 'Not allowed'}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#C6C6C6" />
                  </View>
                }
              />
              <Row
                iconPack="Feather"
                icon="map-pin"
                tint="#0EA5E9"
                title="Location Permission"
                onPress={requestOrToggleLocation}
                valueRight={
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                      style={{
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                        marginRight: 6,
                        backgroundColor: locationAllowed
                          ? '#DCFCE7'
                          : '#FEE2E2',
                      }}
                    >
                      <Text
                        style={{
                          color: locationAllowed ? '#166534' : '#991B1B',
                          fontSize: 12,
                        }}
                      >
                        {locationAllowed ? 'Allowed' : 'Not allowed'}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#C6C6C6" />
                  </View>
                }
              />

              {/* Account & Security */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#6B7280',
                  marginVertical: 6,
                }}
              >
                Account & Security
              </Text>
              <Row
                iconPack="Feather"
                icon="credit-card"
                tint="#F59E0B"
                title="Payment Methods"
                onPress={() => router.push('/screens/PaymentMethods')}
              />
              <Row
                iconPack="Feather"
                icon="archive"
                tint="#3B82F6"
                title="Order History"
                onPress={() => router.push('/screens/OrderHistory')}
              />

              {/* Optional Extras */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#6B7280',
                  marginVertical: 6,
                }}
              >
                Extras
              </Text>
              <Row
                iconPack="Feather"
                icon="heart"
                tint="#F472B6"
                title="Dietary Preferences"
                onPress={() => router.push('/screens/DietaryPreferences')}
              />
            </View>
          )}
        </Section>

        <Section>
          <Row
            iconPack="Feather"
            icon="info"
            tint="#3B82F6"
            title="About"
            onPress={() =>
              Linking.openURL('https://www.facebook.com/jseph.andrade')
            }
          />
          <Row
            iconPack="Feather"
            icon="file-text"
            tint="#9CA3AF"
            title="Legal & Policies"
            onPress={() =>
              Linking.openURL('https://www.facebook.com/jseph.andrade')
            }
          />
        </Section>

        <Section>
          <Row
            iconPack="Feather"
            icon="log-out"
            tint="#EF4444"
            title="Log Out"
            onPress={() => setShowLogoutConfirm(true)}
          />
        </Section>
      </ScrollView>

      {/* Logout Modal */}
      <ConfirmLogoutModal
        visible={showLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={confirmLogoutAndNavigate}
      />
    </View>
  );
}
