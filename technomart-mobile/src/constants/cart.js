export const RECOMMENDED_ADDONS = [
  {
    id: 'rec-1',
    title: 'Peach Lychee Tea',
    price: 65,
    image:
      'https://images.unsplash.com/photo-1484659619207-9165d119dafe?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: 'rec-2',
    title: 'Mini Churros',
    price: 85,
    image:
      'https://images.unsplash.com/photo-1509474520651-53cf07c07d2d?q=80&w=800&auto=format&fit=crop',
  },
];

export const ORDER_TYPE_OPTIONS = [
  {
    key: 'dine-in',
    title: 'DINE-IN',
    description: 'Enjoy your meal at the CTU canteen.',
    accessibilityLabel: 'Choose dine-in',
    accentColor: '#E75B4B',
    idleBorderColor: '#F4BDB2',
    circleBackground: '#FFF2EB',
    iconName: 'silverware-fork-knife',
  },
  {
    key: 'takeout',
    title: 'TAKEOUT',
    description: 'Pick up at the counter and head to class.',
    accessibilityLabel: 'Choose takeout',
    accentColor: '#E75B4B',
    idleBorderColor: '#F4BDB2',
    circleBackground: '#FFF2EB',
    iconName: 'food-takeout-box-outline',
  },
];

export const MIN_CREDIT_POINTS_TO_REDEEM = 5;
export const CREDIT_DISCOUNT_VALUE = 5;
export const CREDIT_EARN_THRESHOLD = 100;
export const CREDIT_EARN_VALUE = 0.1;
export const DEFAULT_CREDIT_POINTS = 0.01;

export const PICKUP_TIME_SLOTS_TEMPLATE = [
  { id: 'slot-0', offsetMinutes: 15 },
  { id: 'slot-1', offsetMinutes: 30 },
  { id: 'slot-2', offsetMinutes: 45 },
  { id: 'slot-3', offsetMinutes: 60 },
];
