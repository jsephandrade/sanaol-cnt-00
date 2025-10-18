import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  Dimensions,
  Animated,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const recommendedData = [
  {
    id: '1',
    image: require('../../assets/reco1.jpg'),
    title: 'Spicy Chicken',
    price: 150,
    rating: 4.5,
    reviews: 12,
  },
  {
    id: '2',
    image: require('../../assets/reco2.jpg'),
    title: 'Cheesy Burger',
    price: 120,
    rating: 4.2,
    reviews: 8,
  },
  {
    id: '3',
    image: require('../../assets/reco3.jpg'),
    title: 'Fresh Salad',
    price: 100,
    rating: 4.8,
    reviews: 15,
  },
];

export default function Recommended() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [focusedItem, setFocusedItem] = useState(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const flatListRef = useRef(null);
  const autoSlideRef = useRef(null);

  const [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });

  // Auto-slide carousel
  useEffect(() => {
    if (!focusedItem) {
      autoSlideRef.current = setInterval(() => {
        let nextIndex = (activeIndex + 1) % recommendedData.length;
        setActiveIndex(nextIndex);
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
      }, 3000);
    }
    return () => clearInterval(autoSlideRef.current);
  }, [activeIndex, focusedItem]);

  if (!fontsLoaded) return null;

  const handleLongPress = (item) => {
    clearInterval(autoSlideRef.current);
    setFocusedItem(item);

    scaleAnim.setValue(0);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleClosePopup = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setFocusedItem(null));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended for you</Text>
      <View style={styles.underline} />

      <FlatList
        ref={flatListRef}
        data={recommendedData}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        snapToInterval={width * 0.7 + 16}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 8, marginTop: 12 }}
        onScroll={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (width * 0.7 + 16)
          );
          setActiveIndex(index);
        }}
        renderItem={({ item }) => (
          <Pressable onLongPress={() => handleLongPress(item)}>
            <View style={styles.itemContainer}>
              <Image source={item.image} style={styles.image} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.gradient}
              />
              <Text style={styles.overlayText}>{item.title}</Text>
            </View>
          </Pressable>
        )}
      />

      {/* Centered Popup */}
      {focusedItem && (
        <Modal transparent visible>
          <Pressable style={styles.overlay} onPress={handleClosePopup}>
            <Animated.View
              style={[
                styles.popupCard,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim,
                },
              ]}
            >
              <Image source={focusedItem.image} style={styles.popupImage} />
              <View style={styles.popupDetails}>
                <Text style={styles.foodName}>{focusedItem.title}</Text>
                <Text style={styles.foodPrice}>₱{focusedItem.price}</Text>
                <Text style={styles.foodRating}>
                  ⭐ {focusedItem.rating} ({focusedItem.reviews} reviews)
                </Text>
              </View>
            </Animated.View>
          </Pressable>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 8, marginTop: 16 },
  title: { fontFamily: 'Roboto_700Bold', fontSize: 20, color: 'black' },
  underline: {
    height: 4,
    width: 56,
    backgroundColor: '#f97316',
    borderRadius: 4,
    marginTop: 4,
  },
  itemContainer: {
    width: width * 0.7,
    height: width * 0.45,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  image: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', bottom: 0, width: '100%', height: '40%' },
  overlayText: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    color: '#fff',
    fontFamily: 'Roboto_700Bold',
    fontSize: 18,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    width: width * 0.8,
    alignItems: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  popupImage: {
    width: '100%',
    height: width * 0.5,
    borderRadius: 16,
    marginBottom: 16,
  },
  popupDetails: { alignItems: 'center' },
  foodName: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  foodPrice: { fontSize: 18, color: '#f59e0b', marginBottom: 4 },
  foodRating: { fontSize: 16, color: '#6b7280' },
});
