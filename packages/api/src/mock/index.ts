export { createMockClient } from './mockClient.js';
export * from './fixtures.js';
export { simulateLatency, setFailureInjection, shouldInjectFailure, withLatencyAndFailure } from './latency.js';
export { store, resetStore } from './store.js';
export {
  registerTrip,
  registerDelivery,
  registerPayment,
  getProgressedTrip,
  getProgressedDelivery,
  getProgressedPayment,
  isTripTerminal,
  isDeliveryTerminal,
  TRIP_THRESHOLDS,
  DELIVERY_THRESHOLDS,
  PAYMENT_THRESHOLDS,
} from './ticker.js';
