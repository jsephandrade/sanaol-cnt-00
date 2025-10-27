import React, { useMemo } from 'react';
import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BACKGROUND_PATTERN_URI = 'https://www.transparenttextures.com/patterns/soft-wallpaper.png';

const NOTIFICATIONS = [
  {
    id: 'order-ready',
    title: 'Order ready for pickup',
    message: 'Your Chicken Adobo order is ready at Counter 3.',
    time: '5 minutes ago',
    icon: 'check-circle',
    tint: '#16A34A',
    category: 'Today',
    action: 'order',
  },
  {
    id: 'new-specials',
    title: 'New weekend specials',
    message: 'Sisig rice bowls are now available with limited-time pricing.',
    time: '1 hour ago',
    icon: 'star',
    tint: '#F59E0B',
    category: 'Today',
    action: 'menu',
  },
  {
    id: 'feedback-request',
    title: 'Rate your last order',
    message: 'Share feedback on your Pork BBQ meal to help us improve.',
    time: 'Yesterday',
    icon: 'message-circle',
    tint: '#F97316',
    category: 'Earlier',
    action: 'feedback',
  },
  {
    id: 'profile-reminder',
    title: 'Complete your profile',
    message: 'Add allergy info so we can tailor future recommendations.',
    time: '2 days ago',
    icon: 'user',
    tint: '#6366F1',
    category: 'Earlier',
    action: 'profile',
  },
];

function NotificationCard({ notification, onPress }) {
  if (!notification) return null;
  const { icon, title, message, time, tint } = notification;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(notification)}
      className="mb-3 flex-row items-start rounded-[26px] border border-[#F5DFD3] bg-white p-4 shadow-sm"
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${message}`}>
      <View
        className="h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${tint}14` }}
        accessible={false}>
        <Feather name={icon} size={22} color={tint} />
      </View>
      <View className="ml-4 flex-1">
        <View className="flex-row items-start justify-between">
          <Text className="flex-1 text-sm font-semibold text-text">{title}</Text>
          <Text className="ml-3 text-[11px] font-semibold text-peach-500">{time}</Text>
        </View>
        <Text className="mt-2 text-xs leading-5 text-sub">{message}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AlertsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const sections = useMemo(() => {
    const grouped = NOTIFICATIONS.reduce((acc, notification) => {
      const key = notification.category || 'Earlier';
      if (!acc[key]) acc[key] = [];
      acc[key].push(notification);
      return acc;
    }, {});

    return ['Today', 'Earlier'].reduce((list, key) => {
      if (grouped[key]?.length) {
        list.push({ title: key, data: grouped[key] });
      }
      return list;
    }, []);
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNotificationPress = (notification) => {
    switch (notification.action) {
      case 'order':
        navigation.navigate('OrderHistory');
        break;
      case 'menu':
        navigation.navigate('MenuList', { initialView: 'menu' });
        break;
      case 'feedback':
        navigation.navigate('Feedback', {
          category: 'Experience',
          message: 'Sharing feedback from alerts',
        });
        break;
      case 'profile':
        navigation.navigate('PersonalInfo');
        break;
      default:
        navigation.navigate('Home');
        break;
    }
  };

  return (
    <ImageBackground
      source={{ uri: BACKGROUND_PATTERN_URI }}
      resizeMode="repeat"
      className="flex-1">
      <View className="flex-1 bg-white/90">
        <LinearGradient
          colors={['rgba(255, 222, 197, 0.95)', 'rgba(255, 193, 150, 0.95)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-b-[36px]"
          style={{ paddingTop: insets.top + 18 }}>
          <View className="px-5 pb-6">
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handleBack}
                className="h-11 w-11 items-center justify-center rounded-full bg-white/80"
                accessibilityRole="button"
                accessibilityLabel="Go back">
                <Feather name="chevron-left" size={22} color="#6B4F3A" />
              </TouchableOpacity>
              <Text className="ml-3 text-lg font-semibold text-[#6B4F3A]">Alerts</Text>
              <View className="ml-auto flex-row items-center rounded-full bg-white/70 px-3 py-1.5">
                <MaterialCommunityIcons name="bell-ring" size={18} color="#F97316" />
                <Text className="ml-2 text-xs font-semibold text-[#6B4F3A]">Stay updated</Text>
              </View>
            </View>

            <View className="mt-5 rounded-3xl bg-white/75 p-4">
              <Text className="text-sm font-semibold text-text">You&apos;re all caught up!</Text>
              <Text className="mt-1 text-xs leading-5 text-sub">
                Tap a notification to revisit the related page or manage your campus meals faster.
              </Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
          className="flex-1 px-5 pt-6">
          {sections.map((section) => (
            <View key={section.title} className="mb-8">
              <View className="mb-4 flex-row items-center">
                <View className="h-[1px] flex-1 bg-[#F5DFD3]" />
                <Text className="mx-3 text-xs font-semibold uppercase tracking-widest text-sub">
                  {section.title}
                </Text>
                <View className="h-[1px] flex-1 bg-[#F5DFD3]" />
              </View>
              {section.data.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={handleNotificationPress}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}
