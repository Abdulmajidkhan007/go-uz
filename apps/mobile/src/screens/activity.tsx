/**
 * Activity — order history list and order detail.
 */
import React from 'react';
import { FlatList } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Order } from '@vroom/types';
import { getOrderStatePresentation } from '@vroom/ui';
import { useApi } from '../app/providers/ApiContext';
import { useTheme } from '../app/providers/ThemeContext';
import type { ActivityStackParamList } from '../navigation/types';
import {
  AppText,
  Card,
  EmptyState,
  ErrorState,
  ListRow,
  LoadingState,
  Screen,
} from '../components/ui';

type Props<S extends keyof ActivityStackParamList> = NativeStackScreenProps<
  ActivityStackParamList,
  S
>;

export function HistoryScreen({ navigation }: Props<'History'>): React.JSX.Element {
  const { useOrders } = useApi();
  const orders = useOrders();

  if (orders.isPending) return <Screen><LoadingState /></Screen>;
  if (orders.isError) {
    return <Screen><ErrorState message="Couldn't load your history." onRetry={() => orders.refetch()} /></Screen>;
  }
  if (orders.data.items.length === 0) {
    return (
      <Screen>
        <EmptyState title="No trips yet" caption="Your rides and deliveries will appear here." />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <FlatList<Order>
        data={orders.data.items}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <ListRow
            title={item.kind === 'ride' ? 'Ride' : 'Delivery'}
            subtitle={item.refId}
            trailing={item.state}
            onPress={() =>
              navigation.navigate('OrderDetail', {
                orderId: item.id,
                kind: item.kind,
                refId: item.refId,
              })
            }
          />
        )}
      />
    </Screen>
  );
}

export function OrderDetailScreen({ route }: Props<'OrderDetail'>): React.JSX.Element {
  const { colors } = useTheme();
  const { kind, refId, orderId } = route.params;

  return (
    <Screen scroll>
      <AppText variant="title">{kind === 'ride' ? 'Ride details' : 'Delivery details'}</AppText>
      <Card>
        <AppText variant="caption" muted>Order</AppText>
        <AppText variant="body">{orderId}</AppText>
      </Card>
      <Card>
        <AppText variant="caption" muted>Reference</AppText>
        <AppText variant="body">{refId}</AppText>
      </Card>
      <AppText variant="caption" muted>
        Receipts and the full payment breakdown render here once the order completes.
      </AppText>
      <Card style={{ backgroundColor: colors.surfaceElevated }}>
        <AppText variant="caption" muted>Tip</AppText>
        <AppText variant="body">Repeat this order from the action menu.</AppText>
      </Card>
    </Screen>
  );
}

// Re-exported for typed status chips elsewhere.
export { getOrderStatePresentation };
