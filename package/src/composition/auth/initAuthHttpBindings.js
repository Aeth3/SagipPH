import {
  setAccessTokenProvider,
  setClientTokenProvider,
  setOnRefreshFailed,
  setRefreshSessionProvider,
} from "../../infra/http/apiClient";

export const initAuthHttpBindings = ({
  getAccessToken,
  refreshSession,
  clearSession,
  sessionRepository,
}) => {
  setAccessTokenProvider(async () => {
    const result = await getAccessToken();
    return result?.ok ? result.value : null;
  });

  setClientTokenProvider(async () => {
    const token = await sessionRepository.getClientToken();
    if (typeof token === "string" && token.trim()) {
      return token.trim();
    }
    return null;
  });

  setRefreshSessionProvider(() => refreshSession());
  setOnRefreshFailed(async () => {
    await clearSession();
  });
};
