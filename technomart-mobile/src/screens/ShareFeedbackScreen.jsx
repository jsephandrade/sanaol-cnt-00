// screens/ShareFeedbackScreen.jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const MAX = 500;
const MIN = 10;
const ORANGE = '#F07F13';

const Chip = ({ label, active, onPress, accessibilityLabel }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`mb-2 mr-2 rounded-full border px-3 py-1.5 ${active ? 'bg-[#FFF3E9]' : 'bg-white'}`}
    style={{
      borderColor: active ? ORANGE : '#E5E7EB',
    }}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel || label}
    accessibilityState={{ selected: !!active }}>
    <Text
      className="text-[13px]"
      style={{ color: active ? ORANGE : '#6B7280', fontWeight: active ? '600' : '500' }}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function ShareFeedbackScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [text, setText] = React.useState(() => route?.params?.message ?? '');
  const [category, setCategory] = React.useState(() => route?.params?.category ?? 'Other');
  const remaining = MAX - text.length;
  const isValid = text.trim().length >= MIN && text.length <= MAX;

  const onSend = () => {
    // TODO: integrate with your API / analytics here.
    // For now we just simulate success.
    Alert.alert('Thanks!', 'Your feedback was sent. We appreciate it.');
    navigation.goBack?.();
  };

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom }}>
      {/* Decorative background icons (same vibe as ProfileScreen) */}
      <View
        className="absolute inset-0"
        accessible={false}
        importantForAccessibility="no-hide-descendants">
        <MaterialCommunityIcons
          name="pizza"
          size={96}
          color="#FFC999"
          style={{ position: 'absolute', top: 40, left: 20, opacity: 0.15 }}
        />
        <MaterialCommunityIcons
          name="french-fries"
          size={96}
          color="#FFC999"
          style={{ position: 'absolute', top: 120, right: 20, opacity: 0.15 }}
        />
        <MaterialCommunityIcons
          name="cup"
          size={96}
          color="#FFC999"
          style={{ position: 'absolute', top: 220, left: 80, opacity: 0.15 }}
        />
      </View>

      {/* Header */}
      <View className="relative mt-5 px-4 pb-3">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack?.()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Feather name="chevron-left" size={22} color="#9AA3AF" />
          </TouchableOpacity>

          <Text className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-gray-600">
            Share Feedback
          </Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Intro / helper copy */}
          <View className="mb-3 mt-2 px-2">
            <Text className="text-[15px] text-gray-700">
              Tell us what’s working great or what we can improve. We read every message.
            </Text>
          </View>

          {/* Category chips */}
          <View className="mt-2 px-2">
            <Text className="mb-2 text-[13px] text-gray-500">Category</Text>
            <View className="flex-row flex-wrap">
              {['Bug', 'Feature', 'Other'].map((c) => (
                <Chip key={c} label={c} active={category === c} onPress={() => setCategory(c)} />
              ))}
            </View>
          </View>

          {/* Text area */}
          <View className="mt-4 rounded-2xl bg-[#f5f5f5] px-3 py-3">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="Type your feedback here..."
              placeholderTextColor="#9CA3AF"
              multiline
              maxLength={MAX}
              textAlignVertical="top"
              className="min-h-[140px] text-[15px] text-text"
              autoCapitalize="sentences"
              accessibilityLabel="Feedback input"
              returnKeyType="default"
            />

            <View className="mt-2 flex-row items-center justify-between">
              <Text
                className="text-[12px]"
                style={{ color: text.trim().length < MIN ? '#EF4444' : '#6B7280' }}
                accessibilityLiveRegion="polite">
                {text.trim().length < MIN
                  ? `At least ${MIN} characters (${MIN - text.trim().length} more to go)`
                  : 'Looks good'}
              </Text>
              <Text className="text-[12px] text-gray-500">{remaining}</Text>
            </View>
          </View>

          {/* Send button */}
          <TouchableOpacity
            className="mt-5 rounded-2xl px-5 py-4"
            style={{
              backgroundColor: isValid ? ORANGE : '#F3F4F6',
              opacity: isValid ? 1 : 1,
            }}
            onPress={onSend}
            disabled={!isValid}
            accessibilityRole="button"
            accessibilityLabel="Send feedback"
            accessibilityState={{ disabled: !isValid }}>
            <View className="flex-row items-center justify-center">
              <Feather
                name="send"
                size={18}
                color={isValid ? '#FFF' : '#9CA3AF'}
                style={{ marginRight: 8 }}
              />
              <Text
                className="text-base font-semibold"
                style={{ color: isValid ? '#FFF' : '#9CA3AF' }}>
                Send
              </Text>
            </View>
            <Text
              className="mt-1 text-center text-[12px]"
              style={{ color: isValid ? 'rgba(255,255,255,0.9)' : '#9CA3AF' }}>
              We usually respond within a few days.
            </Text>
          </TouchableOpacity>

          {/* Privacy note */}
          <View className="mt-3 px-2">
            <Text className="text-[12px] text-gray-500">
              By sending, you agree that we may use your feedback to improve the app.
            </Text>
          </View>

          <View className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
