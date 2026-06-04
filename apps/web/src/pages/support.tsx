/**
 * Support: tickets list, new ticket, FAQ.
 */
import React, { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import type { TicketCategory } from '@vroom/types';
import { useApi } from '../app/providers/api';
import { paths } from '../router/paths';
import { LoadingState, ErrorState, EmptyState } from '../components/States';

const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  { q: 'How do I cancel a ride?', a: 'Open the tracking screen and choose Cancel ride.' },
  { q: 'Where is my parcel?', a: 'Track it in real time from Activity → your delivery.' },
  { q: 'How are fares calculated?', a: 'Distance, time and demand. You always see the estimate first.' },
];

export function TicketsPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { useTickets } = useApi();
  const tickets = useTickets();

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight={700}>
            Support
          </Typography>
          <Button variant="contained" onClick={() => navigate(paths.app.support.newTicket)}>
            New request
          </Button>
        </Stack>
        {tickets.isPending ? <LoadingState /> : null}
        {tickets.isError ? <ErrorState onRetry={() => tickets.refetch()} /> : null}
        {tickets.data && tickets.data.length === 0 ? (
          <EmptyState title="No tickets" caption="Need a hand? Start a new request." />
        ) : null}
        {tickets.data && tickets.data.length > 0 ? (
          <Card variant="outlined">
            <List>
              {tickets.data.map((t) => (
                <ListItem key={t.id} secondaryAction={<Chip size="small" label={t.status} />}>
                  <ListItemText primary={t.subject} secondary={t.category} />
                </ListItem>
              ))}
            </List>
          </Card>
        ) : null}
        <Button variant="text" onClick={() => navigate(paths.app.support.faq)}>
          Read the FAQ
        </Button>
      </Stack>
    </Container>
  );
}

export function NewTicketPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { useCreateTicket } = useApi();
  const create = useCreateTicket();
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const category: TicketCategory = 'other';

  function onSubmit(): void {
    if (subject.trim().length === 0) return;
    create.mutate(
      { subject: subject.trim(), category, body: body.trim() || subject.trim() },
      { onSuccess: () => navigate(paths.app.support.tickets) },
    );
  }

  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          New request
        </Typography>
        <TextField label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <TextField
          label="Describe the issue"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          multiline
          minRows={3}
        />
        <Button variant="contained" disabled={subject.trim().length === 0 || create.isPending} onClick={onSubmit}>
          Submit
        </Button>
      </Stack>
    </Container>
  );
}

export function FaqPage(): React.JSX.Element {
  return (
    <Container maxWidth="sm">
      <Stack spacing={2}>
        <Typography variant="h4" fontWeight={700}>
          FAQ
        </Typography>
        {FAQ.map((item) => (
          <Card key={item.q} variant="outlined">
            <CardContent>
              <Typography fontWeight={700}>{item.q}</Typography>
              <Typography color="text.secondary">{item.a}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Container>
  );
}
