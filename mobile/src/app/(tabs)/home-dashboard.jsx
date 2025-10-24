// app/(tabs)/home-dashboard.jsx
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  LogOut,
  User,
  Settings as Gear,
  HelpCircle,
  MessageCircle,
} from 'lucide-react-native';

import Header from '../../components/Header';
import CategoryItem from '../../components/CategoryItem';
import Recommended from '../../components/Recommended';
import { useNotifications } from '../../context/NotificationContext';
import { useMenuCategories, useMenuItems } from '../../api/hooks';

const CATEGORY_IMAGES = {
  combomeals: require('../../../assets/choices/combo.png'),
  meals: require('../../../assets/choices/meals.png'),
  snacks: require('../../../assets/choices/snacks.png'),
  drinks: require('../../../assets/choices/drinks.png'),
};

const FALLBACK_CATEGORY_IMAGE = require('../../../assets/choices/meals.png');

export default function HomeDashboardScreen() {
  const [fontsLoaded] = useFonts({ Roboto_700Bold });
  const router = useRouter();
  const { notifications } = useNotifications();

  const [openDropdown, setOpenDropdown] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: categoriesRaw = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    isFetching: categoriesFetching,
    refetch: refetchCategories,
  } = useMenuCategories();

  const {
    data: menuData,
    isLoading: itemsLoading,
    error: itemsError,
    isFetching: itemsFetching,
    refetch: refetchItems,
  } = useMenuItems({ limit: 100, archived: false }, { keepPreviousData: true });

  const menuItems = useMemo(() => menuData?.items || [], [menuData?.items]);
  const isSyncing = categoriesFetching || itemsFetching;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([refetchCategories(), refetchItems()])
      .catch(() => {})
      .finally(() => setRefreshing(false));
  }, [refetchCategories, refetchItems]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([refetchCategories(), refetchItems()]).catch(() => {});
    }, [refetchCategories, refetchItems])
  );

  const categoriesData = useMemo(() => {
    if (categoriesRaw.length) {
      return categoriesRaw.slice(0, 12).map((category, index) => {
        const key = (category.name || '').toLowerCase();
        const image =
          CATEGORY_IMAGES[key] !== undefined
            ? CATEGORY_IMAGES[key]
            : FALLBACK_CATEGORY_IMAGE;
        const itemCount =
          typeof category.itemCount === 'number'
            ? category.itemCount
            : menuItems.filter(
                (item) =>
                  !item.archived && (item.category || '').toLowerCase() === key
              ).length;
        return {
          id: category.id || `category-${index}`,
          title: category.name || 'Category',
          image,
          raw: category,
          itemCount,
        };
      });
    }

    if (!menuItems.length) {
      return [];
    }

    const derived = new Map();
    menuItems.forEach((item) => {
      if (item.archived) return;
      const name = (item.category || 'Menu').trim();
      if (!name) return;
      const key = name.toLowerCase();
      if (!derived.has(key)) {
        derived.set(key, {
          id: `derived-${key}`,
          title: name,
          raw: { name },
          itemCount: 0,
        });
      }
      derived.get(key).itemCount += 1;
    });

    return Array.from(derived.values())
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((entry) => ({
        ...entry,
        image:
          CATEGORY_IMAGES[entry.title.toLowerCase()] ?? FALLBACK_CATEGORY_IMAGE,
      }));
  }, [categoriesRaw, menuItems]);

  const recommendedItems = useMemo(() => {
    if (!menuItems.length) return [];
    return menuItems
      .filter((item) => item && !item.archived && item.available)
      .slice(0, 6);
  }, [menuItems]);

  const loadingCategories =
    (categoriesLoading || itemsLoading) && !categoriesData.length;
  const showEmptyState = !loadingCategories && categoriesData.length === 0;

  if (!fontsLoaded) return null;

  const renderCategoriesHeader = () => (
    <View className="mb-1.5 mt-3 px-2">
      <Text className="font-heading text-xl text-neutral-900">Categories</Text>
      <View
        className="mt-1 w-12 rounded-full bg-primary-500"
        style={{ height: 3 }} // NativeWind: exact 3px height requires inline style
      />
    </View>
  );

  return (
    <View className="flex-1 bg-primary-100">
      <Header onToggleDropdown={setOpenDropdown} />

      <SafeAreaView className="flex-1">
        <FlatList
          data={categoriesData}
          extraData={categoriesData.length}
          key="two-columns"
          numColumns={2}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#f97316']}
              tintColor="#f97316"
            />
          }
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 10,
          }} // NativeWind: FlatList column wrapper still requires inline style
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CategoryItem
              image={item.image}
              title={item.title}
              onPress={() =>
                router.push(
                  `/categories/${encodeURIComponent(item.raw?.name || item.title)}`
                )
              }
            />
          )}
          ListHeaderComponent={
            <View className="mb-2">
              <Recommended items={recommendedItems} />
              {renderCategoriesHeader()}
              {isSyncing && categoriesData.length > 0 ? (
                <View className="mx-2 mt-2 flex-row items-center">
                  <ActivityIndicator size="small" color="#f97316" />
                  <Text className="ml-2 text-xs text-neutral-500">
                    Syncing latest menu...
                  </Text>
                </View>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            loadingCategories ? (
              <View className="items-center justify-center py-6">
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="mt-2.5 px-4 text-center text-sm text-neutral-500">
                  Loading categories...
                </Text>
              </View>
            ) : showEmptyState ? (
              <View className="items-center justify-center py-6">
                <Text className="mt-2.5 px-4 text-center text-sm text-neutral-500">
                  {itemsError || categoriesError
                    ? 'Unable to load menu data right now. Please try again shortly.'
                    : 'No categories available yet. Check back soon!'}
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-4 px-2"
        />
      </SafeAreaView>

      {openDropdown && (
        <Pressable
          className="absolute inset-0"
          onPress={() => setOpenDropdown(null)}
        />
      )}

      {/* Notification Dropdown */}
      {openDropdown === 'notifications' && (
        <View
          className="absolute items-end"
          style={{ top: 60, right: 50, zIndex: 100 }}
        >
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 8,
              borderRightWidth: 8,
              borderBottomWidth: 10,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'white',
              marginBottom: 1,
              marginRight: 10,
            }} // NativeWind: triangle border shape requires inline style
          />
          <View
            className="w-44 rounded-lg bg-surface px-2.5 py-1.5 shadow-md"
            style={{ elevation: 5 }} // NativeWind: Android elevation requires inline style
          >
            {notifications.length === 0 ? (
              <Text className="py-2 italic text-neutral-500">
                No notifications
              </Text>
            ) : (
              notifications.map((item, index) => (
                <Text key={index} className="py-2.5 text-sm text-neutral-700">
                  {item.message}
                </Text>
              ))
            )}
          </View>
        </View>
      )}

      {/* Settings Dropdown */}
      {openDropdown === 'settings' && (
        <View
          className="absolute items-end"
          style={{ top: 60, right: 8, zIndex: 100 }}
        >
          <View
            style={{
              width: 0,
              height: 0,
              borderLeftWidth: 8,
              borderRightWidth: 8,
              borderBottomWidth: 10,
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: 'white',
              marginBottom: 1,
              marginRight: 10,
            }} // NativeWind: triangle border shape requires inline style
          />
          <View
            className="w-44 rounded-lg bg-surface px-2.5 py-1.5 shadow-md"
            style={{ elevation: 5 }} // NativeWind: Android elevation requires inline style
          >
            <TouchableOpacity
              className="flex-row items-center py-2.5"
              onPress={() => router.push('/account-profile')}
            >
              <User size={16} color="#374151" />
              <Text className="ml-2 text-sm text-neutral-700">Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-2.5"
              onPress={() => router.push('screens/Settings')}
            >
              <Gear size={16} color="#374151" />
              <Text className="ml-2 text-sm text-neutral-700">
                App Settings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-2.5"
              onPress={() => router.push('screens/FAQs')}
            >
              <HelpCircle size={16} color="#374151" />
              <Text className="ml-2 text-sm text-neutral-700">Help</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-2.5"
              onPress={() => router.push('screens/Feedback')}
            >
              <MessageCircle size={16} color="#374151" />
              <Text className="ml-2 text-sm text-neutral-700">Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center py-2.5"
              onPress={() => router.push('/account-login')}
            >
              <LogOut size={16} color="red" />
              <Text className="ml-2 text-sm text-red-500">Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
