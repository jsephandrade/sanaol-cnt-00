// components/ConfirmLogoutModal.jsx
import React from 'react';
import { Modal, View, Text, TouchableOpacity, Platform } from 'react-native';

export default function ConfirmLogoutModal({ visible, onCancel, onConfirm }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className="w-11/12 max-w-md rounded-2xl bg-white p-5">
          <Text className="text-lg font-semibold text-gray-900">
            Are you sure you want to log out?
          </Text>
          <Text className="mt-1 text-[13px] text-gray-600">
            You’ll need to sign in again to access your account.
          </Text>

          <View className="mt-4 flex-row justify-end space-x-3">
            <TouchableOpacity
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel log out"
              className="rounded-xl bg-gray-100 px-4 py-2">
              <Text className="text-gray-800">Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel="Confirm log out"
              className="ml-2 rounded-xl px-4 py-2"
              style={{ backgroundColor: '#EF4444' }}>
              <Text className="font-semibold text-white">Log Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
