import React from 'react';
import {
  Alert,
  Image,
  ImageBackground,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { RECOMMENDED_ITEMS, MENU_ITEMS } from '../utils/menuData';
import { useCart } from '../context/CartContext';
import BottomNavigation from '../components/BottomNavigation';

const HERO_CATEGORIES = [
  { key: 'hotMeals', label: 'Hot Meals', icon: 'food-steak', tint: '#F97316' },
  { key: 'snacks', label: 'Snacks', icon: 'food-croissant', tint: '#F59E0B' },
  { key: 'drinks', label: 'Drinks', icon: 'cup', tint: '#FB7185' },
  { key: 'desserts', label: 'Desserts', icon: 'ice-cream', tint: '#34D399' },
];

const PICNIC_PATTERN_URI = 'https://www.transparenttextures.com/patterns/red-oxford.png';
const HERO_PATTERN_URI = 'https://www.transparenttextures.com/patterns/diamonds.png';

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { totalItems } = useCart();
  const cartHasItems = totalItems > 0;
  const handleMenu = () => {
    navigation.navigate('Profile');
  };

  const handleTabPress = (key) => {
    if (key === 'home') return;
    if (key === 'profile') {
      navigation.navigate('Profile');
      return;
    }
    if (key === 'history') {
      navigation.navigate('OrderHistory');
      return;
    }
    if (key === 'cart') {
      navigation.navigate('Cart');
      return;
    }
    if (key === 'alerts') {
      navigation.navigate('Alerts');
      return;
    }
    Alert.alert('Coming soon', 'This section will be available in a future update.');
  };

  return (
    <ImageBackground source={{ uri: PICNIC_PATTERN_URI }} resizeMode="repeat" className="flex-1">
      <View className="flex-1 bg-white/85">
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}>
          <LinearGradient
            colors={['rgba(255, 208, 160, 0.95)', 'rgba(255, 176, 102, 0.95)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="overflow-hidden rounded-b-[36px]"
            style={{ paddingTop: insets.top + 24 }}>
            <ImageBackground
              source={{ uri: HERO_PATTERN_URI }}
              resizeMode="repeat"
              className="rounded-b-[36px]">
              <View className="px-5 pb-7">
                <View
                  className="absolute inset-0"
                  accessible={false}
                  importantForAccessibility="no-hide-descendants">
                  <MaterialCommunityIcons
                    name="pizza"
                    size={96}
                    color="#FFD4B4"
                    style={{ position: 'absolute', top: 16, left: -8, opacity: 0.25 }}
                  />
                  <MaterialCommunityIcons
                    name="french-fries"
                    size={96}
                    color="#FFD4B4"
                    style={{ position: 'absolute', top: 50, right: -12, opacity: 0.2 }}
                  />
                  <MaterialCommunityIcons
                    name="cup"
                    size={96}
                    color="#FFD4B4"
                    style={{ position: 'absolute', top: 140, left: 60, opacity: 0.18 }}
                  />
                </View>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={handleMenu}
                    className="h-12 w-12 items-center justify-center rounded-full bg-white/70"
                    accessibilityRole="button"
                    accessibilityLabel="Open menu">
                    <Feather name="menu" size={22} color="#6B4F3A" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    className="mx-3 flex-1 flex-row items-center rounded-full bg-white/95 px-4 py-3 shadow-sm"
                    onPress={() => navigation.navigate('Search')}
                    accessibilityRole="search"
                    accessibilityLabel="Search dishes">
                    <Feather name="search" size={18} color="#7B4B32" />
                    <Text className="ml-3 flex-1 text-sm text-[#7B4B32]">Search food</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('Profile')}
                    className="h-12 w-12 items-center justify-center rounded-full bg-white/70"
                    accessibilityRole="button"
                    accessibilityLabel="Open profile">
                    <Feather name="user" size={22} color="#6B4F3A" />
                  </TouchableOpacity>
                </View>

                <View className="mt-6 flex-row justify-between">
                  {HERO_CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      onPress={() => navigation.navigate('MenuList', { filter: cat.key })}
                      className="mx-1 flex-1 items-center rounded-2xl bg-white/85 px-3 py-4"
                      accessibilityRole="button"
                      accessibilityLabel={cat.label}>
                      <View
                        className="h-12 w-12 items-center justify-center rounded-2xl"
                        style={{ backgroundColor: `${cat.tint}1A` }}
                        accessible={false}>
                        <MaterialCommunityIcons name={cat.icon} size={24} color={cat.tint} />
                      </View>
                      <Text className="mt-3 text-center text-xs font-semibold text-text">
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ImageBackground>
          </LinearGradient>

          <View className="px-5">
            <View
              className="absolute inset-0"
              accessible={false}
              importantForAccessibility="no-hide-descendants">
              <MaterialCommunityIcons
                name="noodles"
                size={90}
                color="#FEDDC1"
                style={{ position: 'absolute', top: -10, left: -14, opacity: 0.18 }}
              />
              <MaterialCommunityIcons
                name="cookie"
                size={90}
                color="#FEDDC1"
                style={{ position: 'absolute', top: 40, right: -20, opacity: 0.15 }}
              />
              <MaterialCommunityIcons
                name="cup"
                size={90}
                color="#FEDDC1"
                style={{ position: 'absolute', top: 120, left: 40, opacity: 0.12 }}
              />
            </View>
            <View className="mb-3 mt-6 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-text">Recommended for you</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('MenuList', { initialView: 'recommended' })}
                accessibilityRole="button"
                accessibilityLabel="See all recommended dishes">
                <Text className="text-sm font-medium text-peach-500">See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingVertical: 8 }}>
              {RECOMMENDED_ITEMS.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  className="mr-4 w-[172px] rounded-[26px] border border-[#F5DFD3] bg-white p-[14px] shadow-lg"
                  style={{ elevation: 2, shadowColor: '#F97316' }}
                  onPress={() => navigation.navigate('CustomizeItem', { item })}
                  accessibilityRole="button"
                  accessibilityLabel={`View ${item.title}`}>
                  <Image
                    source={{ uri: item.image }}
                    className="h-28 w-full rounded-2xl"
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                  <Text className="mt-3 text-sm font-semibold text-text">{item.title}</Text>
                  <Text className="mt-1 text-xs text-sub">{item.description}</Text>
                  <View className="mt-2 flex-row items-center">
                    <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
                    <Text className="ml-1 text-xs font-medium text-text">
                      {item.rating.toFixed(1)} ({item.reviews})
                    </Text>
                  </View>
                  <Text className="mt-2 text-sm font-semibold text-peach-500">₱{item.price}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View className="mb-3 mt-6 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-text">Menu Items</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('MenuList', { initialView: 'menu' })}
                accessibilityRole="button"
                accessibilityLabel="See all categories">
                <Text className="text-sm font-medium text-peach-500">See all</Text>
              </TouchableOpacity>
            </View>

            {MENU_ITEMS.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="mb-3 flex-row items-center rounded-[26px] border border-[#F5DFD3] bg-white p-[14px] shadow"
                style={{ elevation: 1, shadowColor: '#F97316' }}
                onPress={() => navigation.navigate('CustomizeItem', { item })}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.title}`}>
                <Image
                  source={{ uri: item.image }}
                  className="h-16 w-16 rounded-2xl"
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
                <View className="ml-4 flex-1">
                  <Text className="text-sm font-semibold text-text">{item.title}</Text>
                  <View className="mt-1 flex-row items-center">
                    <MaterialCommunityIcons name="star" size={14} color="#FBBF24" />
                    <Text className="ml-1 text-xs text-sub">
                      {item.rating.toFixed(1)} ({item.reviews} reviews)
                    </Text>
                  </View>
                </View>
                <Text className="text-base font-semibold text-peach-500">₱{item.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <BottomNavigation
          activeKey="home"
          cartHasItems={cartHasItems}
          onTabPress={handleTabPress}
        />
      </View>
    </ImageBackground>
  );
}
