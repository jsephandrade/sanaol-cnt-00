import React, { useEffect, useRef, useState } from 'react';
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

  const [pushEnabled, setPushEnabled] = useState(true);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [locationAllowed, setLocationAllowed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const isLoggingOut = useRef(false);
  const creditPoints = 0.01;

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => true;
      const sub = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => sub.remove();
    }, [])
  );

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

  const confirmLogoutAndNavigate = () => {
    isLoggingOut.current = true;
    router.replace('/login');
  };

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
            source={{
              uri: 'https://media.istockphoto.com/id/2014684899/vector/placeholder-avatar-female-person-default-woman-avatar-image-gray-profile-anonymous-face.jpg?s=612x612&w=0&k=20&c=D-dk9ek0_jb19TiMVNVmlpvYVrQiFiJmgGmiLB5yE4w=',
            }}
            style={{ width: 64, height: 64, borderRadius: 32 }}
          />
          <View style={{ marginLeft: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#333' }}>
              Joseph Andrade
            </Text>
          </View>
        </View>

        {/* Credit Points */}
        <TouchableOpacity
          onPress={() => router.push('/Credits')}
          style={{
            backgroundColor: '#F07F13',
            borderRadius: 16,
            padding: 16,
            marginBottom: -5,
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
                {creditPoints}
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
            Use points at checkout to save on your next order.
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
