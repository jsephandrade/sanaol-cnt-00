// app/(tabs)/index.jsx
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { useRouter } from 'expo-router';
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

export default function Home() {
  const [fontsLoaded] = useFonts({ Roboto_700Bold });
  const router = useRouter();
  const { notifications } = useNotifications();

  const [openDropdown, setOpenDropdown] = useState(null);

  const { data: categoriesRaw = [], isLoading: categoriesLoading } =
    useMenuCategories();

  const { data: menuData } = useMenuItems(
    { limit: 20, available: true },
    { keepPreviousData: true }
  );

  const categoriesData = useMemo(() => {
    if (!categoriesRaw.length) {
      return [];
    }
    return categoriesRaw.slice(0, 8).map((category, index) => {
      const key = (category.name || '').toLowerCase();
      const image =
        CATEGORY_IMAGES[key] !== undefined
          ? CATEGORY_IMAGES[key]
          : FALLBACK_CATEGORY_IMAGE;
      return {
        id: category.id || `category-${index}`,
        title: category.name || 'Category',
        image,
        raw: category,
      };
    });
  }, [categoriesRaw]);

  const recommendedItems = useMemo(
    () => (menuData?.items || []).slice(0, 5),
    [menuData?.items]
  );

  const loadingCategories = categoriesLoading && !categoriesData.length;
  const showEmptyState = !loadingCategories && categoriesData.length === 0;

  if (!fontsLoaded) return null;

  const renderCategoriesHeader = () => (
    <View style={styles.sectionContainer}>
      <Text style={[styles.sectionTitle, { fontFamily: 'Roboto_700Bold' }]}>
        Categories
      </Text>
      <View style={styles.underline} />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#FFE6C7' }}>
      <Header onToggleDropdown={setOpenDropdown} />

      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={categoriesData}
          extraData={categoriesData.length}
          key="two-columns"
          numColumns={2}
          columnWrapperStyle={styles.row}
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
            <View style={{ marginBottom: 8 }}>
              <Recommended items={recommendedItems} />
              {renderCategoriesHeader()}
            </View>
          }
          ListEmptyComponent={
            loadingCategories ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f97316" />
                <Text style={styles.loadingText}>Loading categories...</Text>
              </View>
            ) : showEmptyState ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  No categories available yet. Check back soon!
                </Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 16,
            paddingHorizontal: 8,
          }}
        />
      </SafeAreaView>

      {openDropdown && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => setOpenDropdown(null)}
        />
      )}

      {/* Notification Dropdown */}
      {openDropdown === 'notifications' && (
        <View style={[styles.dropdownContainer, { top: 60, right: 50 }]}>
          <View style={styles.triangle} />
          <View style={styles.dropdown}>
            {notifications.length === 0 ? (
              <Text style={styles.emptyText}>No notifications</Text>
            ) : (
              notifications.map((item, index) => (
                <Text key={index} style={styles.dropdownItem}>
                  {item.message}
                </Text>
              ))
            )}
          </View>
        </View>
      )}

      {/* Settings Dropdown */}
      {openDropdown === 'settings' && (
        <View style={[styles.dropdownContainer, { top: 60, right: 8 }]}>
          <View style={styles.triangle} />
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => router.push('/profile')}
            >
              <User size={16} color="#374151" />
              <Text style={styles.dropdownText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => router.push('screens/Settings')}
            >
              <Gear size={16} color="#374151" />
              <Text style={styles.dropdownText}>App Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => router.push('screens/FAQs')}
            >
              <HelpCircle size={16} color="#374151" />
              <Text style={styles.dropdownText}>Help</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => router.push('screens/Feedback')}
            >
              <MessageCircle size={16} color="#374151" />
              <Text style={styles.dropdownText}>Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => router.push('/login')}
            >
              <LogOut size={16} color="red" />
              <Text style={[styles.dropdownText, { color: 'red' }]}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: { paddingHorizontal: 8, marginTop: 12, marginBottom: 6 },
  sectionTitle: { fontSize: 20, color: 'black' },
  underline: {
    height: 3,
    width: 48,
    backgroundColor: '#f97316',
    borderRadius: 3,
    marginTop: 4,
  },
  row: { justifyContent: 'space-between', marginBottom: 10 },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  dropdownContainer: {
    position: 'absolute',
    alignItems: 'flex-end',
    zIndex: 100,
  },
  dropdown: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
    width: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  triangle: {
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
  },
  emptyText: {
    paddingVertical: 8,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dropdownText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#374151',
  },
});
