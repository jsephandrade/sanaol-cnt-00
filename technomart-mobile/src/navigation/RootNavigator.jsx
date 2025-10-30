import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import AccountCreatedScreen from '../screens/AccountCreatedScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import FaceScanScreen from '../screens/FaceScanScreen'; // make sure this path is correct
// import FoodOrdersScreen from '../screens/FoodOrdersScreen'
import ProfileScreen from '../screens/ProfileScreen';
import PersonalInfoScreen from '../screens/PersonalInfoScreen';
import ShareFeedbackScreen from '../screens/ShareFeedbackScreen';
import FAQsScreen from '../screens/FAQsScreen';
import HomeScreen from '../screens/HomeScreen';
import AlertsScreen from '../screens/AlertsScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import CartScreen from '../screens/CartScreen';
import SearchScreen from '../screens/SearchScreen';
import MenuListScreen from '../screens/MenuListScreen';
import CustomizeItemScreen from '../screens/CustomizeItemScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderReviewScreen from '../screens/OrderReviewScreen';
import PaymentPoliciesScreen from '../screens/PaymentPoliciesScreen';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="AccountCreated" component={AccountCreatedScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="FaceScan" component={FaceScanScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Alerts" component={AlertsScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen name="PaymentPolicies" component={PaymentPoliciesScreen} />
      <Stack.Screen name="OrderReview" component={OrderReviewScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="MenuList" component={MenuListScreen} />
      <Stack.Screen name="CustomizeItem" component={CustomizeItemScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
      <Stack.Screen name="Feedback" component={ShareFeedbackScreen} />
      <Stack.Screen name="FAQs" component={FAQsScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    </Stack.Navigator>
  );
}
