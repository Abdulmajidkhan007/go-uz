/**
 * Support: ticket list, ticket thread, new ticket, FAQ.
 */
import React, { useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { TicketCategory } from '@vroom/types';
import { useApi } from '../app/providers/ApiContext';
import type { ProfileStackParamList } from '../navigation/types';
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

type Props<S extends keyof ProfileStackParamList> = NativeStackScreenProps<
  ProfileStackParamList,
  S
>;

const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  { q: 'How do I cancel a ride?', a: 'Open the live tracking screen and tap Cancel ride.' },
  { q: 'Where is my parcel?', a: 'Track it in real time from Activity → your delivery.' },
  { q: 'How are fares calculated?', a: 'Distance, time and demand. You always see the estimate first.' },
];

export function TicketsScreen({ navigation }: Props<'Tickets'>): React.JSX.Element {
  const { useTickets } = useApi();
  const tickets = useTickets();

  return (
    <Screen scroll>
      <AppText variant="title">Help & support</AppText>
      {tickets.isPending ? <LoadingState /> : null}
      {tickets.isError ? <ErrorState onRetry={() => tickets.refetch()} /> : null}
      {tickets.data && tickets.data.length === 0 ? (
        <EmptyState title="No tickets" caption="Need a hand? Start a new request." />
      ) : null}
      {tickets.data?.map((t) => (
        <ListRow
          key={t.id}
          title={t.subject}
          subtitle={t.category}
          trailing={t.status}
          onPress={() => navigation.navigate('TicketThread', { ticketId: t.id })}
        />
      ))}
      <Button label="New request" onPress={() => navigation.navigate('NewTicket')} />
    </Screen>
  );
}

export function TicketThreadScreen({ route }: Props<'TicketThread'>): React.JSX.Element {
  const { ticketId } = route.params;
  const { useTickets, usePostMessage } = useApi();
  const tickets = useTickets();
  const post = usePostMessage();
  const [body, setBody] = useState('');

  const ticket = tickets.data?.find((t) => t.id === ticketId);

  if (tickets.isPending) return <Screen><LoadingState /></Screen>;
  if (!ticket) return <Screen><ErrorState message="Ticket not found." /></Screen>;

  function onSend(): void {
    if (body.trim().length === 0) return;
    post.mutate({ ticketId, body: body.trim() }, { onSuccess: () => setBody('') });
  }

  return (
    <Screen scroll>
      <AppText variant="title">{ticket.subject}</AppText>
      {ticket.messages.map((m) => (
        <Card key={m.id}>
          <AppText variant="caption" muted>{m.from === 'user' ? 'You' : 'Support'}</AppText>
          <AppText variant="body">{m.body}</AppText>
        </Card>
      ))}
      <Field label="Reply" value={body} onChangeText={setBody} placeholder="Type a message" />
      <Button label="Send" loading={post.isPending} onPress={onSend} />
    </Screen>
  );
}

export function NewTicketScreen({ navigation }: Props<'NewTicket'>): React.JSX.Element {
  const { useCreateTicket } = useApi();
  const create = useCreateTicket();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const category: TicketCategory = 'other';

  function onSubmit(): void {
    if (subject.trim().length === 0) return;
    create.mutate(
      { subject: subject.trim(), category, body: body.trim() || subject.trim() },
      { onSuccess: () => navigation.goBack() },
    );
  }

  return (
    <Screen scroll>
      <AppText variant="title">New request</AppText>
      <Field label="Subject" value={subject} onChangeText={setSubject} />
      <Field label="Describe the issue" value={body} onChangeText={setBody} placeholder="What happened?" />
      <Button label="Submit" loading={create.isPending} onPress={onSubmit} disabled={subject.trim().length === 0} />
    </Screen>
  );
}

export function FaqScreen(_props: Props<'FAQ'>): React.JSX.Element {
  return (
    <Screen scroll>
      <AppText variant="title">FAQ</AppText>
      {FAQ.map((item) => (
        <Card key={item.q}>
          <AppText variant="subtitle">{item.q}</AppText>
          <AppText variant="body" muted>{item.a}</AppText>
        </Card>
      ))}
    </Screen>
  );
}
