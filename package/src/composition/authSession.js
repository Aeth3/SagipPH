import { DEMO_MODE } from "@env";
import { authRepository as authRepositorySupabase } from "../data/repositories/AuthRepositoryImpl";
import { authRepositoryMock } from "../data/repositories/AuthRepositoryMockImpl";
import { sessionRepository } from "../data/repositories/SessionRepositoryImpl";
import { setAccessTokenProvider, setRefreshSessionProvider, setOnRefreshFailed } from "../infra/http/apiClient";
import { makeSignInWithPassword } from "../domain/usecases/SignInWithPassword";
import { makeSignUp } from "../domain/usecases/SignUp";
import { makeSignOut } from "../domain/usecases/SignOut";
import { makeGetCurrentUser } from "../domain/usecases/GetCurrentUser";
import { makeSaveSession } from "../domain/usecases/SaveSession";
import { makeGetSession } from "../domain/usecases/GetSession";
import { makeGetAccessToken } from "../domain/usecases/GetAccessToken";
import { makeClearSession } from "../domain/usecases/ClearSession";
import { makeRequestPasswordReset } from "../domain/usecases/RequestPasswordReset";
import { makeVerifyRecoveryCode } from "../domain/usecases/VerifyRecoveryCode";
import { makeUpdatePassword } from "../domain/usecases/UpdatePassword";
import { makeSendOtp } from "../domain/usecases/SendOtp";
import { makeVerifyOtp } from "../domain/usecases/VerifyOtp";
import { makeRefreshSession } from "../domain/usecases/RefreshSession";
import { authRepositoryApi } from "../data/repositories/AuthRepositoryApiImpl";

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

export const IS_DEMO_MODE = normalizeBoolean(DEMO_MODE);

const authRepository = IS_DEMO_MODE
  ? authRepositoryMock
  : authRepositoryApi;

export const signInWithPassword = makeSignInWithPassword({ authRepository });
export const signUp = makeSignUp({ authRepository });
export const signOut = makeSignOut({ authRepository });
export const getCurrentUser = makeGetCurrentUser({ authRepository });
export const saveSession = makeSaveSession({ sessionRepository });
export const getSession = makeGetSession({ sessionRepository });
export const getAccessToken = makeGetAccessToken({ sessionRepository });
export const clearSession = makeClearSession({ sessionRepository });
export const requestPasswordReset = makeRequestPasswordReset({ authRepository });
export const verifyRecoveryCode = makeVerifyRecoveryCode({ authRepository });
export const updatePassword = makeUpdatePassword({ authRepository });
export const sendOtp = makeSendOtp({ authRepository });
export const verifyOtp = makeVerifyOtp({ authRepository });
export const refreshSession = makeRefreshSession({ authRepository, sessionRepository });

setAccessTokenProvider(async () => {
  const result = await getAccessToken();
  return result?.ok ? result.value : null;
});

setRefreshSessionProvider(() => refreshSession());

setOnRefreshFailed(async () => {
  await clearSession();
});
