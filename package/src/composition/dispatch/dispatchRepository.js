import apiClient from "../../infra/http/apiClient";
import { DispatchMessageRepositoryImpl } from "../../data/repositories/DispatchMessageRepositoryApiImpl";

export const dispatchRepository =
    new DispatchMessageRepositoryImpl(apiClient);
