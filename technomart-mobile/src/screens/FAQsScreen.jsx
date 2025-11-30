// screens/FAQsScreen.jsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Feather, AntDesign } from '@expo/vector-icons';

const isFabricEnabled = global?.nativeFabricUIManager != null;

if (
  Platform.OS === 'android' &&
  !isFabricEnabled &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Section = ({ children }) => <View className="mt-4 rounded-2xl bg-[#f5f5f5]">{children}</View>;

const QAItem = ({ id, question, answer, expanded, onToggle }) => {
  return (
    <View className="px-4">
      <TouchableOpacity
        className="flex-row items-center justify-between py-4"
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          onToggle?.(id);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${expanded ? 'Hide' : 'Show'} answer: ${question}`}
        accessibilityState={{ expanded }}>
        <View className="flex-1 pr-4">
          <Text className="text-[15px] font-medium text-text">{question}</Text>
        </View>
        <Feather name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color="#C6C6C6" />
      </TouchableOpacity>

      {expanded ? (
        <View className="pb-4" accessible accessibilityLabel={`Answer: ${answer}`}>
          <Text className="text-[14px] leading-5 text-gray-600">{answer}</Text>
        </View>
      ) : null}

      <View className="h-[1px] bg-gray-200" />
    </View>
  );
};

const DEFAULT_FAQS = [
  {
    id: 'order-tracking',
    q: 'How do I track my order?',
    a: 'Go to Profile > Orders to see real-time status. Tap an order to view courier details and a live map when available.',
  },
  {
    id: 'credits',
    q: 'What are Credit Points and how do I use them?',
    a: "You earn points from promos and completed orders. At checkout, toggle 'Use Points' to apply them to your subtotal.",
  },
  {
    id: 'refunds',
    q: 'How do refunds work?',
    a: "Refunds are issued back to your original payment method within 3-5 business days after approval. You'll get an email once processed.",
  },
  {
    id: 'notifications',
    q: "I'm not receiving notifications. What should I check?",
    a: 'In Profile > Notifications, ensure the toggle is on. Then, enable notifications for this app in your device Settings.',
  },
  {
    id: 'support',
    q: 'How do I contact support?',
    a: "Open Profile > Share Feedback to submit an issue, or tap 'Contact Support' below for quick help.",
  },
];

export default function FAQsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = React.useState('');
  const [expandedId, setExpandedId] = React.useState(null);

  const data = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEFAULT_FAQS;
    return DEFAULT_FAQS.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <View
      className="flex-1 bg-white"
      style={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom }}>
      {/* Decorative background icons (consistent with ProfileScreen) */}
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

          {/* Centered Title */}
          <Text className="absolute left-1/2 -translate-x-1/2 text-base font-semibold text-gray-600">
            FAQs
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {/* Search */}
        <View className="mt-3 flex-row items-center rounded-xl bg-[#f5f5f5] px-3 py-2">
          <Feather name="search" size={18} color="#9AA3AF" />
          <TextInput
            className="ml-2 flex-1 text-[14px] text-gray-700"
            placeholder="Search FAQs"
            placeholderTextColor="#9AA3AF"
            value={query}
            onChangeText={setQuery}
            accessibilityLabel="Search FAQs"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Clear search">
              <AntDesign name="closecircleo" size={16} color="#C6C6C6" />
            </TouchableOpacity>
          )}
        </View>

        {/* FAQ List */}
        <Section>
          {data.length === 0 ? (
            <View className="items-center px-6 py-10">
              <MaterialCommunityIcons name="magnify" size={28} color="#C6C6C6" />
              <Text className="mt-2 text-center text-[14px] text-gray-500">
                No results. Try a different keyword.
              </Text>
            </View>
          ) : (
            data.map((item, idx) => (
              <QAItem
                key={item.id}
                id={item.id}
                question={item.q}
                answer={item.a}
                expanded={expandedId === item.id}
                onToggle={(id) => setExpandedId((prev) => (prev === id ? null : id))}
              />
            ))
          )}
        </Section>

        {/* Quick actions */}
        <View className="mt-5" />
        <TouchableOpacity
          className="rounded-2xl px-5 py-4"
          style={{ backgroundColor: '#F07F13' }}
          accessibilityRole="button"
          accessibilityLabel="Contact Support"
          onPress={() => navigation.navigate?.('Feedback')}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="lifebuoy" size={22} color="#FFF" />
              <Text className="ml-2 text-base font-semibold text-white">Contact Support</Text>
            </View>
            <Feather name="chevron-right" size={18} color="#FFF" />
          </View>
          <Text className="mt-1 text-[12px] text-white/85">
            {"Didn't find what you need? We're here to help."}
          </Text>
        </TouchableOpacity>

        <View className="h-6" />
      </ScrollView>
    </View>
  );
}
