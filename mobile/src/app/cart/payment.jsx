// app/(tabs)/PaymentPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Image,
  Modal,
  Animated,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import { Ionicons } from '@expo/vector-icons';
import { confirmPayment } from '../../api/api'; // API function

export default function PaymentPage() {
  const router = useRouter();
  const { orderType, total, selectedTime, orderId } = useLocalSearchParams();
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showSuccess) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [showSuccess]);

  let [fontsLoaded] = useFonts({ Roboto_400Regular, Roboto_700Bold });
  if (!fontsLoaded) return null;

  if (!orderType || !total || !selectedTime || !orderId) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Missing order details. Go back to the cart.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Back to Cart</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handlePaymentSelect = async (method) => {
    setSelectedPayment(method);

    if (method === 'gcash') {
      const gcashLink = `gcash://pay?amount=${total}&note=Order${orderId}`;
      const supported = await Linking.canOpenURL(gcashLink);

      if (!supported) {
        Alert.alert('GCash not installed', 'Please install GCash to proceed.');
        return;
      }

      Linking.openURL(gcashLink);
      setLoading(true);

      // Simulate polling/payment confirmation after GCash
      setTimeout(async () => {
        try {
          const res = await confirmPayment(orderId, method);
          setLoading(false);
          if (res.success) {
            setShowSuccess(true);
            setTimeout(() => {
              setShowSuccess(false);
              router.push('/(tabs)/orders');
            }, 5000);
          } else {
            Alert.alert(
              'Payment Failed',
              res.message || 'GCash payment not confirmed.'
            );
          }
        } catch (err) {
          setLoading(false);
          Alert.alert('Error', 'Failed to confirm payment. Try again.');
        }
      }, 5000); // adjust delay or implement real polling
    } else if (method === 'counter') {
      try {
        const res = await confirmPayment(orderId, method);
        if (res.success) {
          setShowSuccess(true);
          setTimeout(() => {
            setShowSuccess(false);
            router.push('/(tabs)/orders');
          }, 5000);
        } else {
          Alert.alert(
            'Payment Failed',
            res.message || 'Cannot confirm counter payment.'
          );
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to confirm counter payment. Try again.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={require('../../../assets/drop_1.png')}
        resizeMode="cover"
        style={styles.headerBackground}
      >
        <View style={styles.overlay} />
        <View style={styles.headerContainer}>
          <View style={styles.headerTopRow}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment Page</Text>
            <Ionicons name="card-outline" size={26} color="black" />
          </View>
        </View>
      </ImageBackground>

      {/* Receipt */}
      <View style={styles.receiptCard}>
        <Text style={styles.receiptHeader}>Order Receipt</Text>
        <View style={styles.line} />
        <View style={styles.receiptRow}>
          <Text style={styles.label}>Order Type</Text>
          <Text style={styles.value}>{orderType.toUpperCase()}</Text>
        </View>
        <View style={styles.receiptRow}>
          <Text style={styles.label}>Pickup Time</Text>
          <Text style={styles.value}>{selectedTime}</Text>
        </View>
        <View style={styles.line} />
        <View style={styles.receiptRow}>
          <Text style={[styles.label, { fontWeight: 'bold' }]}>Total</Text>
          <Text style={[styles.value, { fontWeight: 'bold' }]}>
            ₱{parseFloat(total).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Payment Buttons */}
      <TouchableOpacity
        style={[
          styles.paymentBtn,
          selectedPayment === 'gcash' ? styles.selectedBtn : {},
        ]}
        onPress={() => handlePaymentSelect('gcash')}
      >
        <Image
          source={require('../../../assets/gcash.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.paymentText}>Pay with GCash</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.paymentBtn,
          selectedPayment === 'counter' ? styles.selectedBtn : {},
        ]}
        onPress={() => handlePaymentSelect('counter')}
      >
        <Image
          source={require('../../../assets/cash.png')}
          style={styles.icon}
          resizeMode="contain"
        />
        <Text style={styles.paymentText}>Pay at Counter</Text>
      </TouchableOpacity>

      {loading && (
        <Text style={{ textAlign: 'center', marginTop: 10, color: '#f97316' }}>
          Waiting for payment confirmation...
        </Text>
      )}

      {/* Success Popup */}
      <Modal transparent visible={showSuccess} animationType="none">
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.successBox, { opacity: fadeAnim }]}>
            <View style={styles.checkCircle}>
              <Ionicons name="checkmark" size={50} color="#22c55e" />
            </View>
            <Text style={styles.successTitle}>Payment Successful!</Text>
            <Text style={styles.successMessage}>
              Thank you for your order! {'\n'}
              We’ll have it ready for pickup at{' '}
              <Text style={{ fontFamily: 'Roboto_700Bold', color: '#f97316' }}>
                {selectedTime}
              </Text>
            </Text>
            <View style={styles.divider} />
            <Text style={styles.redirectText}>
              Redirecting to your Orders...
            </Text>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// Styles remain unchanged
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fdfdfd' },
  headerBackground: {
    width: '100%',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    paddingBottom: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(254,192,117,0.5)',
  },
  headerContainer: { paddingTop: 50, paddingBottom: 12, paddingHorizontal: 12 },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 28, fontFamily: 'Roboto_700Bold', color: '#1F2937' },
  receiptCard: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 16,
    marginVertical: 20,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  receiptHeader: {
    fontSize: 20,
    fontFamily: 'Roboto_700Bold',
    marginBottom: 12,
    color: '#333',
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: { fontSize: 16, fontFamily: 'Roboto_400Regular', color: '#555' },
  value: { fontSize: 16, fontFamily: 'Roboto_700Bold', color: '#333' },
  line: { borderBottomColor: '#ccc', borderBottomWidth: 1, marginVertical: 8 },
  paymentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '85%',
    paddingVertical: 14,
    borderRadius: 16,
    justifyContent: 'center',
    marginVertical: 8,
    alignSelf: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  selectedBtn: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
    borderWidth: 2,
  },
  paymentText: {
    color: '#333',
    fontFamily: 'Roboto_700Bold',
    fontSize: 16,
    marginLeft: 12,
  },
  icon: { width: 60, height: 40 },
  errorText: {
    fontSize: 18,
    color: '#C00F0C',
    fontFamily: 'Roboto_700Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#f97316',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e67e22',
    alignSelf: 'center',
  },
  backBtnText: { color: '#fff', fontFamily: 'Roboto_700Bold', fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successBox: {
    backgroundColor: '#fff',
    padding: 26,
    borderRadius: 24,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  checkCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 5,
    borderColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  successTitle: {
    fontSize: 22,
    fontFamily: 'Roboto_700Bold',
    color: '#16a34a',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Roboto_400Regular',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 22,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  redirectText: {
    fontSize: 14,
    fontFamily: 'Roboto_400Regular',
    color: '#6b7280',
    textAlign: 'center',
  },
});
