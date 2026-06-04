/**
 * Deep-linking configuration.
 *
 * Scheme: vroom://   Universal links: https://app.vroom.uz/...
 * Primary targets are order detail and live tracking, which push
 * notifications route to.
 */
import type { LinkingOptions } from '@react-navigation/native';
import { DEEP_LINK_SCHEME } from '@vroom/constants';
import type { RootStackParamList } from './types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [`${DEEP_LINK_SCHEME}://`, 'https://app.vroom.uz'],
  config: {
    screens: {
      Auth: {
        screens: {
          Welcome: 'welcome',
          PhoneEntry: 'auth/phone',
          OtpVerify: 'auth/otp',
          ProfileSetup: 'auth/setup',
        },
      },
      App: {
        screens: {
          HomeTab: {
            screens: {
              Home: 'home',
              SetDestination: 'ride/destination',
              ChooseVehicle: 'ride/vehicle',
              ConfirmRide: 'ride/confirm',
              Searching: 'ride/searching',
              LiveTracking: 'track/:tripId',
              ParcelDetails: 'delivery/parcel',
              PickupDropoff: 'delivery/route',
              ConfirmDelivery: 'delivery/confirm',
            },
          },
          ActivityTab: {
            screens: {
              History: 'activity',
              OrderDetail: 'order/:orderId',
            },
          },
          PaymentsTab: {
            screens: {
              Methods: 'payments',
              Wallet: 'payments/wallet',
              Promos: 'payments/promos',
            },
          },
          ProfileTab: {
            screens: {
              Profile: 'profile',
              Settings: 'profile/settings',
            },
          },
        },
      },
    },
  },
};
