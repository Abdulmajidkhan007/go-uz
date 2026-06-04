import type { PaymentMethodId } from '@vroom/types';
import type {
  ListPaymentMethodsRes,
  AddPaymentMethodReq,
  AddPaymentMethodRes,
  DeletePaymentMethodRes,
  GetPaymentReq,
  GetPaymentRes,
  GetWalletRes,
} from '../contracts/payments.js';
import type { ApiResult } from '../errors.js';

export interface PaymentsApi {
  listPaymentMethods(): ApiResult<ListPaymentMethodsRes>;
  addPaymentMethod(req: AddPaymentMethodReq): ApiResult<AddPaymentMethodRes>;
  deletePaymentMethod(id: PaymentMethodId): ApiResult<DeletePaymentMethodRes>;
  getPayment(req: GetPaymentReq): ApiResult<GetPaymentRes>;
  getWallet(): ApiResult<GetWalletRes>;
}
