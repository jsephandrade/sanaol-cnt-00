import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useMenuCategories, useMenuItems } from '../../api/hooks';

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return '₱--';
  }
  return `₱${amount.toFixed(2)}`;
};

const CategoryChip = ({ label, active, count, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.categoryChip,
      active ? styles.categoryChipActive : styles.categoryChipInactive,
    ]}
    activeOpacity={0.85}
  >
    <Text
      style={[
        styles.categoryChipText,
        active
          ? styles.categoryChipTextActive
          : styles.categoryChipTextInactive,
      ]}
      numberOfLines={1}
    >
      {label}
    </Text>
    {typeof count === 'number' && count >= 0 ? (
      <View
        style={[
          styles.categoryBadge,
          active ? styles.categoryBadgeActive : styles.categoryBadgeInactive,
        ]}
      >
        <Text
          style={[
            styles.categoryBadgeText,
            active
              ? styles.categoryBadgeTextActive
              : styles.categoryBadgeTextInactive,
          ]}
        >
          {count}
        </Text>
      </View>
    ) : null}
  </TouchableOpacity>
);

const MenuCard = ({ item, onAdd }) => (
  <View style={styles.menuCard}>
    <View style={styles.menuImageWrapper}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.menuImage} />
      ) : (
        <LinearGradient
          colors={['#f97316', '#fb923c']}
          style={styles.menuImageFallback}
        >
          <Feather name="image" size={28} color="rgba(255,255,255,0.9)" />
        </LinearGradient>
      )}
    </View>
    <View style={styles.menuInfo}>
      <Text style={styles.menuTitle} numberOfLines={1}>
        {item.name}
      </Text>
      {item.description ? (
        <Text style={styles.menuDescription} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}
      <View style={styles.menuFooter}>
        <Text style={styles.menuPrice}>{formatCurrency(item.price)}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAdd}
          activeOpacity={0.85}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  const [openDropdown, setOpenDropdown] = useState(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: categoriesRaw = [],
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useMenuCategories();

  const totalItemsAcrossCategories = useMemo(
    () =>
      categoriesRaw.reduce(
        (total, category) => total + Number(category.itemCount || 0),
        0
      ),
    [categoriesRaw]
  );

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);
    return () => clearTimeout(handle);
  }, [search]);

  const queryParams = useMemo(() => {
    const params = {
      limit: 200,
      available: true,
    };
    if (selectedCategory) {
      params.category = selectedCategory;
    }
    if (debouncedSearch) {
      params.search = debouncedSearch;
    }
    return params;
  }, [selectedCategory, debouncedSearch]);

  const {
    data: menuData,
    isLoading: itemsLoading,
    isRefetching: itemsRefetching,
    error: itemsError,
    refetch: refetchMenu,
  } = useMenuItems(queryParams, {
    keepPreviousData: true,
  });

  const menuItems = menuData?.items ?? [];

  const isLoading = categoriesLoading || itemsLoading;
  const isRefetching = itemsRefetching;

  const greetingName = useMemo(() => {
    const displayName = user?.name || '';
    if (displayName.trim()) {
      return displayName.trim().split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'There';
  }, [user?.email, user?.name]);

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }, []);

  const handleCategoryPress = useCallback((categoryName) => {
    setSelectedCategory((current) =>
      current === categoryName ? null : categoryName
    );
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchCategories(), refetchMenu()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchCategories, refetchMenu]);

  const toggleDropdown = useCallback((target) => {
    setOpenDropdown((current) => (current === target ? null : target));
  }, []);

  const closeDropdowns = useCallback(() => setOpenDropdown(null), []);

  const renderCategoryRow = useCallback(() => {
    if (categoriesLoading) {
      return (
        <View style={styles.categoryLoadingRow}>
          <ActivityIndicator size="small" color="#f97316" />
          <Text style={styles.categoryLoadingText}>Loading categories...</Text>
        </View>
      );
    }

    if (categoriesError) {
      return (
        <View style={styles.categoryLoadingRow}>
          <Feather name="alert-circle" size={16} color="#ef4444" />
          <Text style={styles.categoryLoadingText}>
            Unable to load categories right now.
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryScrollContent}
      >
        <CategoryChip
          label="All"
          active={!selectedCategory}
          count={totalItemsAcrossCategories}
          onPress={() => setSelectedCategory(null)}
        />
        {categoriesRaw.map((category) => (
          <CategoryChip
            key={category.id || category.name}
            label={category.name || 'Uncategorized'}
            count={
              typeof category.itemCount === 'number'
                ? category.itemCount
                : undefined
            }
            active={selectedCategory === category.name}
            onPress={() => handleCategoryPress(category.name)}
          />
        ))}
      </ScrollView>
    );
  }, [
    categoriesError,
    categoriesLoading,
    categoriesRaw,
    handleCategoryPress,
    selectedCategory,
    totalItemsAcrossCategories,
  ]);

  const renderMenuItem = useCallback(
    ({ item }) => <MenuCard item={item} onAdd={() => router.push('/cart')} />,
    [router]
  );

  const listEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyState}>
        {isLoading ? (
          <ActivityIndicator size="large" color="#f97316" />
        ) : itemsError ? (
          <>
            <Feather name="alert-triangle" size={28} color="#ef4444" />
            <Text style={styles.emptyTitle}>Something went wrong</Text>
            <Text style={styles.emptyBody}>
              {itemsError.message || 'Unable to load menu items right now.'}
            </Text>
          </>
        ) : (
          <>
            <Feather name="coffee" size={28} color="#f97316" />
            <Text style={styles.emptyTitle}>Nothing matches yet</Text>
            <Text style={styles.emptyBody}>
              Try a different search term or choose another category.
            </Text>
          </>
        )}
      </View>
    ),
    [isLoading, itemsError]
  );

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <FlatList
          data={menuItems}
          keyExtractor={(item) => item.id}
          renderItem={renderMenuItem}
          ListHeaderComponent={
            <>
              <View style={styles.heroWrapper}>
                <LinearGradient
                  colors={['#f97316', '#fb923c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.heroCard}
                >
                  <View style={styles.heroTopRow}>
                    <View style={styles.heroTextGroup}>
                      <Text
                        style={[
                          styles.heroEyebrow,
                          { fontFamily: 'Roboto_400Regular' },
                        ]}
                      >
                        Good {greetingTime},
                      </Text>
                      <Text
                        style={[
                          styles.heroTitle,
                          { fontFamily: 'Roboto_700Bold' },
                        ]}
                      >
                        {greetingName}!
                      </Text>
                      <Text style={styles.heroSubtitle}>
                        Ready to place your next order?
                      </Text>
                    </View>
                    <View style={styles.heroIconGroup}>
                      <TouchableOpacity
                        style={styles.heroIconButton}
                        onPress={() => toggleDropdown('notifications')}
                        activeOpacity={0.85}
                      >
                        <Feather name="bell" size={22} color="#fff" />
                        {notifications.length > 0 ? (
                          <View style={styles.heroNotificationBadge}>
                            <Text style={styles.heroNotificationText}>
                              {notifications.length}
                            </Text>
                          </View>
                        ) : null}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.heroIconButton, { marginLeft: 12 }]}
                        onPress={() => toggleDropdown('settings')}
                        activeOpacity={0.85}
                      >
                        <Feather name="settings" size={22} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.searchBar}>
                    <Feather name="search" size={18} color="#9ca3af" />
                    <TextInput
                      value={search}
                      onChangeText={setSearch}
                      placeholder="Search dishes, drinks, or snacks"
                      placeholderTextColor="#cbd5e1"
                      style={styles.searchInput}
                      returnKeyType="search"
                    />
                  </View>
                </LinearGradient>
              </View>

              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontFamily: 'Roboto_700Bold' },
                  ]}
                >
                  Browse categories
                </Text>
                <Text style={styles.sectionCaption}>
                  Tap to filter the menu instantly.
                </Text>
              </View>
              {renderCategoryRow()}

              <View style={styles.sectionHeader}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { fontFamily: 'Roboto_700Bold' },
                  ]}
                >
                  Fresh picks for you
                </Text>
                <Text style={styles.sectionCaption}>
                  Items update in real-time from the kitchen.
                </Text>
              </View>
            </>
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={listEmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing || isRefetching}
              onRefresh={handleRefresh}
              tintColor="#f97316"
              colors={['#f97316']}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          showsVerticalScrollIndicator={false}
        />

        {openDropdown ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDropdowns} />
        ) : null}

        {openDropdown === 'notifications' ? (
          <View style={[styles.dropdownContainer, { top: 120, right: 24 }]}>
            <View style={styles.dropdown}>
              <Text style={styles.dropdownTitle}>Latest updates</Text>
              {notifications.length === 0 ? (
                <Text style={styles.dropdownEmpty}>No notifications yet.</Text>
              ) : (
                notifications.map((item, index) => (
                  <Text key={index} style={styles.dropdownItemText}>
                    {item.message}
                  </Text>
                ))
              )}
            </View>
          </View>
        ) : null}

        {openDropdown === 'settings' ? (
          <View style={[styles.dropdownContainer, { top: 120, right: 20 }]}>
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownRow}
                onPress={() => {
                  closeDropdowns();
                  router.push('/profile');
                }}
              >
                <Feather name="user" size={16} color="#f97316" />
                <Text style={styles.dropdownRowText}>Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownRow}
                onPress={() => {
                  closeDropdowns();
                  router.push('/screens/Settings');
                }}
              >
                <Feather name="sliders" size={16} color="#f97316" />
                <Text style={styles.dropdownRowText}>App Settings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownRow}
                onPress={() => {
                  closeDropdowns();
                  router.push('/screens/FAQs');
                }}
              >
                <Feather name="help-circle" size={16} color="#f97316" />
                <Text style={styles.dropdownRowText}>Help & FAQs</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownRow}
                onPress={() => {
                  closeDropdowns();
                  router.push('/screens/Feedback');
                }}
              >
                <Feather name="message-circle" size={16} color="#f97316" />
                <Text style={styles.dropdownRowText}>Send Feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dropdownRow, styles.dropdownRowDestructive]}
                onPress={() => {
                  closeDropdowns();
                  router.push('/login');
                }}
              >
                <Feather name="log-out" size={16} color="#ef4444" />
                <Text style={[styles.dropdownRowText, { color: '#ef4444' }]}>
                  Log out
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff7ed' },
  container: { flex: 1 },
  heroWrapper: { paddingHorizontal: 16, paddingTop: 8 },
  heroCard: {
    borderRadius: 28,
    padding: 20,
    shadowColor: 'rgba(249, 115, 22, 0.35)',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroTextGroup: { flex: 1, paddingRight: 16 },
  heroEyebrow: { color: '#fff', fontSize: 16, opacity: 0.85 },
  heroTitle: { color: '#fff', fontSize: 28, marginTop: 2 },
  heroSubtitle: { color: '#fff', fontSize: 14, marginTop: 6, opacity: 0.85 },
  heroIconGroup: { flexDirection: 'row' },
  heroIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroNotificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 8,
    minWidth: 16,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroNotificationText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  searchBar: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  searchInput: {
    marginLeft: 10,
    flex: 1,
    fontSize: 15,
    color: '#1f2937',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: { fontSize: 20, color: '#0f172a' },
  sectionCaption: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 4,
  },
  categoryScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 4,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
  },
  categoryChipInactive: {
    backgroundColor: 'rgba(254, 215, 170, 0.6)',
  },
  categoryChipActive: {
    backgroundColor: '#f97316',
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: 120,
  },
  categoryChipTextInactive: { color: '#78350f' },
  categoryChipTextActive: { color: '#fff' },
  categoryBadge: {
    marginLeft: 8,
    minWidth: 22,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeInactive: { backgroundColor: 'rgba(120,53,15,0.12)' },
  categoryBadgeActive: { backgroundColor: 'rgba(255,255,255,0.28)' },
  categoryBadgeText: { fontSize: 12, fontWeight: '700' },
  categoryBadgeTextInactive: { color: '#78350f' },
  categoryBadgeTextActive: { color: '#fff' },
  categoryLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  categoryLoadingText: {
    marginLeft: 10,
    color: '#64748b',
    fontSize: 13,
  },
  listContent: {
    paddingBottom: 32,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: 'rgba(15, 23, 42, 0.12)',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 3,
  },
  menuImageWrapper: {
    height: 170,
    backgroundColor: '#fff7ed',
  },
  menuImage: { width: '100%', height: '100%' },
  menuImageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: { padding: 16 },
  menuTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  menuDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 6,
    lineHeight: 18,
  },
  menuFooter: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuPrice: { fontSize: 18, fontWeight: '700', color: '#f97316' },
  addButton: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  itemSeparator: { height: 20 },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  emptyBody: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  dropdownContainer: {
    position: 'absolute',
    zIndex: 20,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    width: 220,
    shadowColor: 'rgba(15, 23, 42, 0.18)',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  dropdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  dropdownEmpty: { fontSize: 13, color: '#64748b', paddingVertical: 6 },
  dropdownItemText: {
    fontSize: 13,
    color: '#0f172a',
    paddingVertical: 6,
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  dropdownRowDestructive: { marginTop: 4 },
  dropdownRowText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '600',
  },
});
