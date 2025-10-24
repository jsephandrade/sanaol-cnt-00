import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCart } from '../../context/CartContext';
import {
  useFonts,
  Roboto_700Bold,
  Roboto_400Regular,
} from '@expo-google-fonts/roboto';

export default function OrderTrackingScreen() {
  const [fontsLoaded] = useFonts({
    Roboto_700Bold,
    Roboto_400Regular,
  });

  const router = useRouter();
  const { cart } = useCart();

  if (!fontsLoaded) return null;

  const todaysOrders = cart.filter((item) => item.status === 'ongoing');
  const historyOrders = cart.filter((item) => item.status === 'completed');

  const renderGroupedCard = (items, title, isHistory = false) => (
    <View style={styles.card}>
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>
          {title} • Order ID: D{Math.floor(Math.random() * 9999)}
        </Text>
      </View>

      {items.map((item, idx) => (
        <View key={idx} style={styles.itemRow}>
          <Image source={item.image} style={styles.itemImage} />
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {item.size && (
              <Text style={styles.itemDetail}>Size: {item.size}</Text>
            )}
            {item.customize && (
              <Text style={styles.itemDetail}>Customize: {item.customize}</Text>
            )}
            <Text style={styles.itemDetail}>Qty: {item.quantity}</Text>
          </View>
          <Text style={styles.price}>₱{item.price}</Text>
        </View>
      ))}

      {!isHistory && (
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            router.push({
              pathname: '/orderStatus',
              params: { order: JSON.stringify(items) },
            })
          }
        >
          <Ionicons name="document-text-outline" size={16} color="red" />
          <Text style={styles.detailsText}>Order Details</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/drop_1.png')}
        resizeMode="cover"
        style={styles.topBackground}
      >
        <View style={styles.overlay} />
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={26} color="black" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>My Orders</Text>
          <Ionicons name="receipt-outline" size={26} color="black" />
        </View>
      </ImageBackground>

      <FlatList
        data={historyOrders}
        keyExtractor={(item, index) => 'history-' + index}
        renderItem={({ item }) => renderGroupedCard([item], 'History', true)}
        ListHeaderComponent={
          <>
            {todaysOrders.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Today’s Order</Text>
                {renderGroupedCard(todaysOrders, 'Ongoing')}
              </>
            )}
            {historyOrders.length > 0 && (
              <Text style={[styles.sectionTitle, { marginTop: 18 }]}>
                History
              </Text>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        }
        contentContainerStyle={{ flexGrow: 1, padding: 14 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd' },

  topBackground: {
    width: '100%',
    paddingBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(254,192,117,0.5)',
  },
  topBar: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: { fontSize: 30, fontFamily: 'Roboto_700Bold', color: 'black' },

  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Roboto_700Bold',
    color: '#374151',
    marginBottom: 10,
    marginLeft: 6,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
    overflow: 'hidden',
  },
  headerBar: {
    backgroundColor: '#b91c1c',
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  headerText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#f1f1f1',
  },
  itemImage: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  itemDetail: { fontSize: 14, color: '#555' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#111' },

  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#eee',
    marginLeft: 10,
  },
  detailsText: { color: 'red', fontSize: 14, marginLeft: 4, fontWeight: '600' },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 5, // ensures it's visually aligned like CartScreen
  },

  emptyText: {
    marginTop: 5,
    fontSize: 18,
    fontFamily: 'Roboto_400Regular',
    color: '#999',
  },
});
