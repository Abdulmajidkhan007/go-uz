import type {
  ListTicketsRes,
  CreateTicketReq,
  CreateTicketRes,
  PostMessageReq,
  PostMessageRes,
} from '../contracts/support.js';
import type { ApiResult } from '../errors.js';

export interface SupportApi {
  listTickets(): ApiResult<ListTicketsRes>;
  createTicket(req: CreateTicketReq): ApiResult<CreateTicketRes>;
  postMessage(req: PostMessageReq): ApiResult<PostMessageRes>;
}
