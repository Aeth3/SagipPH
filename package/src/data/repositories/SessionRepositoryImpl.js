import { asyncStorageAdapter } from "../../infra/storage/asyncStorageAdapter";
import { SessionRepository } from "../../domain/repositories/SessionRepository";

const SESSION_KEY = "user_session";

export class SessionRepositoryImpl extends SessionRepository {
  async saveSession(session) {
    const payload = JSON.stringify(session);
    await asyncStorageAdapter.setItem(SESSION_KEY, payload);
  }

  async getSession() {
    const raw = await asyncStorageAdapter.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  async clearSession() {
    await asyncStorageAdapter.removeItem(SESSION_KEY);
  }

  async getAccessToken() {
    const session = await this.getSession();
    if (!session) return null;

    const access = session.access_token ?? session.accessToken ?? null;
    if (!access) return null;

    if (typeof access === "string") return access;
    if (typeof access === "object" && access.token) return access.token;

    return null;
  }

  async getRefreshToken() {
    const session = await this.getSession();
    if (!session) return null;

    const refresh = session.refresh_token ?? session.refreshToken ?? null;
    if (!refresh || typeof refresh !== "string") return null;

    return refresh;
  }
}

export const sessionRepository = new SessionRepositoryImpl();
