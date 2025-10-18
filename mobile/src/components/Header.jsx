// app/components/Header.jsx
import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
} from 'react-native';
import { Bell, Settings, Search } from 'lucide-react-native';
import { useFonts, Roboto_700Bold } from '@expo-google-fonts/roboto';
import { useNotifications } from '../context/NotificationContext';

export default function Header({ onToggleDropdown }) {
  const { notifications } = useNotifications();
  const [fontsLoaded] = useFonts({ Roboto_700Bold });
  if (!fontsLoaded) return null;

  return (
    <ImageBackground
      source={require('../../assets/drop_1.png')}
      resizeMode="cover"
      style={styles.imageBackground}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Text style={[styles.homeText, { fontFamily: 'Roboto_700Bold' }]}>
            Home
          </Text>

          <View style={styles.iconsRow}>
            {/* 🔔 Notifications */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onToggleDropdown('notifications')}
            >
              <Bell size={26} color="black" />
              {notifications.length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>
                    {notifications.length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* ⚙️ Settings */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => onToggleDropdown('settings')}
            >
              <Settings size={26} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Search size={18} color="#6B7280" />
          <TextInput
            placeholder="Search Dish"
            placeholderTextColor="#9CA3AF"
            style={styles.searchInput}
          />
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  imageBackground: {
    width: '100%',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: 'hidden',
    paddingBottom: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(254,192,117,0.5)',
  },
  container: {
    paddingTop: 30,
    paddingBottom: 18,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 18,
    marginTop: 15,
  },
  homeText: {
    fontSize: 30,
    color: 'black',
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'red',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 5,
    marginHorizontal: 13,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#374151',
  },
});
