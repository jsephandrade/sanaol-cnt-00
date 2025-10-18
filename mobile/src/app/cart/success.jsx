import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';

export default function SuccessPopup({ visible }) {
  const router = useRouter();

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        router.replace('/'); // 👈 replace this with where you want to go after success
      }, 5000); // 5 seconds

      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.popup}>
          <Image
            source={require('../../../assets/check.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <Text style={styles.successText}>Order Successful!</Text>
          <Text style={styles.subText}>Thank you for your purchase 🎉</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    backgroundColor: '#fff',
    width: '80%',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  successText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF6B00',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
  },
});
