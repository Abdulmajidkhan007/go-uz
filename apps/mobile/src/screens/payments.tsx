/**
 * Payments & wallet: methods, add card, wallet balance, promos.
 */
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { WalletTxn } from '@vroom/types';
import { formatMoney } from '@vroom/utils';
import { useApi } from '../app/providers/ApiContext';
import type { PaymentsStackParamList } from '../navigation/types';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Field,
  ListRow,
  LoadingState,
  Screen,
} from '../components/ui';

type Props<S extends keyof PaymentsStackParamList> = NativeStackScreenProps<
  PaymentsStackParamList,
  S
>;

export function MethodsScreen({ navigation }: Props<'Methods'>): React.JSX.Element {
  const { usePaymentMethods } = useApi();
  const methods = usePaymentMethods();

  return (
    <Screen scroll>
      <AppText variant="title">Payment methods</AppText>
      {methods.isPending ? <LoadingState /> : null}
      {methods.isError ? <ErrorState onRetry={() => methods.refetch()} /> : null}
      {methods.data?.map((m) => (
        <Card key={m.id}>
          <AppText variant="subtitle">
            {m.type === 'card' ? `Card ·· ${m.last4 ?? ''}` : m.type === 'wallet' ? 'Vroom wallet' : 'Cash'}
          </AppText>
          {m.isDefault ? <AppText variant="caption" muted>Default</AppText> : null}
        </Card>
      ))}
      <Button label="Add card" variant="secondary" onPress={() => navigation.navigate('AddCard')} />
      <Button label="View wallet" variant="ghost" onPress={() => navigation.navigate('Wallet')} />
    </Screen>
  );
}

export function AddCardScreen({ navigation }: Props<'AddCard'>): React.JSX.Element {
  const { useAddPaymentMethod } = useApi();
  const addCard = useAddPaymentMethod();
  const [last4, setLast4] = useState('');
  const [expiry, setExpiry] = useState('');

  function onSave(): void {
    addCard.mutate(
      { type: 'card', brand: 'visa', last4: last4 || '4242', expiry: expiry || '12/28', token: 'tok_demo' },
      { onSuccess: () => navigation.goBack() },
    );
  }

  return (
    <Screen scroll>
      <AppText variant="title">Add a card</AppText>
      <Field label="Card number (last 4)" value={last4} onChangeText={setLast4} keyboardType="number-pad" maxLength={4} />
      <Field label="Expiry (MM/YY)" value={expiry} onChangeText={setExpiry} maxLength={5} />
      <Button label="Save card" loading={addCard.isPending} onPress={onSave} />
    </Screen>
  );
}

export function WalletScreen(_props: Props<'Wallet'>): React.JSX.Element {
  const { useWallet } = useApi();
  const wallet = useWallet();

  if (wallet.isPending) return <Screen><LoadingState /></Screen>;
  if (wallet.isError || !wallet.data) {
    return <Screen><ErrorState onRetry={() => wallet.refetch()} /></Screen>;
  }

  return (
    <Screen padded={false}>
      <View style={{ padding: 20, gap: 16 }}>
        <Card>
          <AppText variant="caption" muted>Balance</AppText>
          <AppText variant="display">{formatMoney(wallet.data.balance, 'en')}</AppText>
        </Card>
        <AppText variant="subtitle">Transactions</AppText>
      </View>
      <FlatList<WalletTxn>
        data={wallet.data.transactions}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListEmptyComponent={<EmptyState title="No transactions yet" />}
        renderItem={({ item }) => (
          <ListRow
            title={item.memo ?? item.kind}
            subtitle={item.kind}
            trailing={formatMoney(item.amount, 'en')}
          />
        )}
      />
    </Screen>
  );
}

export function PromosScreen(_props: Props<'Promos'>): React.JSX.Element {
  const { useValidatePromo } = useApi();
  const [code, setCode] = useState('');
  const promo = useValidatePromo(code.trim().length >= 3 ? code.trim().toUpperCase() : null);

  return (
    <Screen scroll>
      <AppText variant="title">Promo codes</AppText>
      <Field label="Enter a code" value={code} onChangeText={setCode} autoCapitalize="characters" />
      {promo.isFetching ? <LoadingState label="Checking…" /> : null}
      {promo.data ? (
        <Card>
          <AppText variant="subtitle">{promo.data.code}</AppText>
          <AppText variant="caption" muted>
            {promo.data.kind === 'percent' ? `${promo.data.value}% off` : 'Fixed discount'} · {promo.data.status}
          </AppText>
        </Card>
      ) : null}
      {promo.isError && code.trim().length >= 3 ? (
        <AppText variant="caption" muted>That code isn't valid.</AppText>
      ) : null}
    </Screen>
  );
}
