import { CLIENT_NAME } from "@env";
import { authRepository, IS_DEMO_MODE } from "./authRepository";
import { sessionRepository } from "./sessionRepository";
import { initAuthHttpBindings } from "./initAuthHttpBindings";
import { makeSignInWithPassword } from "../../domain/usecases/SignInWithPassword";
import { makeSignUp } from "../../domain/usecases/SignUp";
import { makeSignOut } from "../../domain/usecases/SignOut";
import { makeGetCurrentUser } from "../../domain/usecases/GetCurrentUser";
import { makeSaveSession } from "../../domain/usecases/SaveSession";
import { makeGetSession } from "../../domain/usecases/GetSession";
import { makeGetAccessToken } from "../../domain/usecases/GetAccessToken";
import { makeClearSession } from "../../domain/usecases/ClearSession";
import { makeRequestPasswordReset } from "../../domain/usecases/RequestPasswordReset";
import { makeVerifyRecoveryCode } from "../../domain/usecases/VerifyRecoveryCode";
import { makeUpdatePassword } from "../../domain/usecases/UpdatePassword";
import { makeSendOtp } from "../../domain/usecases/SendOtp";
import { makeVerifyOtp } from "../../domain/usecases/VerifyOtp";
import { makeRefreshSession } from "../../domain/usecases/RefreshSession";
import { makeGetClientToken } from "../../domain/usecases/GetClientToken";
import { makeRegisterUser } from "../../domain/usecases/RegisterUser";
import { makeLoginUser } from "../../domain/usecases/LoginUser";
import { makeVerifyPhoneNumber } from "../../domain/usecases/VerifyPhoneNumber";
export { IS_DEMO_MODE };

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
export const getClientToken = makeGetClientToken({ authRepository, sessionRepository, name: CLIENT_NAME });
export const registerUser = makeRegisterUser({ authRepository });
export const loginUser = makeLoginUser({ authRepository });
export const verifyPhoneNumber = makeVerifyPhoneNumber();
initAuthHttpBindings({
  getAccessToken,
  refreshSession,
  clearSession,
  sessionRepository,
});
