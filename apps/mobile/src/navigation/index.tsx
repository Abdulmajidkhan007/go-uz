/**
 * Navigation tree.
 *
 * RootNavigator switches between the Auth stack and the authenticated App tabs
 * based on the persisted session. Each tab owns a native-stack so deep links
 * and back gestures behave natively.
 */
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../app/providers/ThemeContext';
import { useAuthStore } from '../stores/authStore';
import type {
  ActivityStackParamList,
  AppTabParamList,
  AuthStackParamList,
  HomeStackParamList,
  PaymentsStackParamList,
  ProfileStackParamList,
  RootStackParamList,
} from './types';
import {
  OtpVerifyScreen,
  PhoneEntryScreen,
  ProfileSetupScreen,
  WelcomeScreen,
} from '../screens/auth';
import { HomeScreen } from '../screens/home';
import {
  ChooseVehicleScreen,
  ConfirmRideScreen,
  SearchingScreen,
  SetDestinationScreen,
} from '../screens/ride';
import {
  ConfirmDeliveryScreen,
  ParcelDetailsScreen,
  PickupDropoffScreen,
} from '../screens/delivery';
import { LiveTrackingScreen } from '../screens/tracking';
import { HistoryScreen, OrderDetailScreen } from '../screens/activity';
import { AddCardScreen, MethodsScreen, PromosScreen, WalletScreen } from '../screens/payments';
import { AddressesScreen, ProfileScreen, SettingsScreen } from '../screens/profile';
import {
  FaqScreen,
  NewTicketScreen,
  TicketThreadScreen,
  TicketsScreen,
} from '../screens/support';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ActivityStack = createNativeStackNavigator<ActivityStackParamList>();
const PaymentsStack = createNativeStackNavigator<PaymentsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tabs = createBottomTabNavigator<AppTabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function AuthNavigator(): React.JSX.Element {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
      <AuthStack.Screen name="PhoneEntry" component={PhoneEntryScreen} options={{ title: 'Sign in' }} />
      <AuthStack.Screen name="OtpVerify" component={OtpVerifyScreen} options={{ title: 'Verify' }} />
      <AuthStack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ title: 'Profile' }} />
    </AuthStack.Navigator>
  );
}

function HomeNavigator(): React.JSX.Element {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="SetDestination" component={SetDestinationScreen} options={{ title: 'Destination' }} />
      <HomeStack.Screen name="ChooseVehicle" component={ChooseVehicleScreen} options={{ title: 'Choose a ride' }} />
      <HomeStack.Screen name="ConfirmRide" component={ConfirmRideScreen} options={{ title: 'Confirm' }} />
      <HomeStack.Screen name="Searching" component={SearchingScreen} options={{ title: 'Finding a driver' }} />
      <HomeStack.Screen name="LiveTracking" component={LiveTrackingScreen} options={{ title: 'Tracking' }} />
      <HomeStack.Screen name="ParcelDetails" component={ParcelDetailsScreen} options={{ title: 'New delivery' }} />
      <HomeStack.Screen name="PickupDropoff" component={PickupDropoffScreen} options={{ title: 'Route' }} />
      <HomeStack.Screen name="ConfirmDelivery" component={ConfirmDeliveryScreen} options={{ title: 'Confirm' }} />
    </HomeStack.Navigator>
  );
}

function ActivityNavigator(): React.JSX.Element {
  return (
    <ActivityStack.Navigator>
      <ActivityStack.Screen name="History" component={HistoryScreen} options={{ title: 'Activity' }} />
      <ActivityStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order' }} />
    </ActivityStack.Navigator>
  );
}

function PaymentsNavigator(): React.JSX.Element {
  return (
    <PaymentsStack.Navigator>
      <PaymentsStack.Screen name="Methods" component={MethodsScreen} options={{ title: 'Payments' }} />
      <PaymentsStack.Screen name="AddCard" component={AddCardScreen} options={{ title: 'Add card' }} />
      <PaymentsStack.Screen name="Wallet" component={WalletScreen} options={{ title: 'Wallet' }} />
      <PaymentsStack.Screen name="Promos" component={PromosScreen} options={{ title: 'Promos' }} />
    </PaymentsStack.Navigator>
  );
}

function ProfileNavigator(): React.JSX.Element {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <ProfileStack.Screen name="Addresses" component={AddressesScreen} options={{ title: 'Saved places' }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      <ProfileStack.Screen name="Tickets" component={TicketsScreen} options={{ title: 'Support' }} />
      <ProfileStack.Screen name="TicketThread" component={TicketThreadScreen} options={{ title: 'Ticket' }} />
      <ProfileStack.Screen name="NewTicket" component={NewTicketScreen} options={{ title: 'New request' }} />
      <ProfileStack.Screen name="FAQ" component={FaqScreen} options={{ title: 'FAQ' }} />
    </ProfileStack.Navigator>
  );
}

type TabIconName = React.ComponentProps<typeof Ionicons>['name'];
const TAB_ICONS: Record<keyof AppTabParamList, TabIconName> = {
  HomeTab: 'home',
  ActivityTab: 'time',
  PaymentsTab: 'card',
  ProfileTab: 'person',
};

function AppNavigator(): React.JSX.Element {
  const { colors } = useTheme();
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={TAB_ICONS[route.name]} color={color} size={size} />
        ),
      })}
    >
      <Tabs.Screen name="HomeTab" component={HomeNavigator} options={{ title: 'Home' }} />
      <Tabs.Screen name="ActivityTab" component={ActivityNavigator} options={{ title: 'Activity' }} />
      <Tabs.Screen name="PaymentsTab" component={PaymentsNavigator} options={{ title: 'Payments' }} />
      <Tabs.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: 'Profile' }} />
    </Tabs.Navigator>
  );
}

export function RootNavigator(): React.JSX.Element {
  const session = useAuthStore((s) => s.session);
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {session === null ? (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <RootStack.Screen name="App" component={AppNavigator} />
      )}
    </RootStack.Navigator>
  );
}
