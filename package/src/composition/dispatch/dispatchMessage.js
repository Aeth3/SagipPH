import { makeGetDispatchMessages } from "../../domain/usecases/dispatch/GetDispatchMessages";
import { makeMarkDispatchMessageRead } from "../../domain/usecases/dispatch/MarkDispatchMessageRead";
import { makeRetryFailedDispatchMessages } from "../../domain/usecases/dispatch/RetryFailedDispatchMessages";
import { makeSendDispatchMessage } from "../../domain/usecases/dispatch/SendDispatchMessage";
import { offlineDispatchQueue } from "../../offline/OfflineDispatchQueue";
import { dispatchRepository } from "./dispatchRepository";

export const sendDispatchMessage = makeSendDispatchMessage({ dispatchRepository });
export const getDispatchMessages = makeGetDispatchMessages({ dispatchRepository });
export const markDispatchMessageRead = makeMarkDispatchMessageRead({ dispatchRepository });
export const retryFailedDispatchMessages = makeRetryFailedDispatchMessages({ offlineDispatchQueue });
