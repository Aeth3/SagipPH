import { asyncStorageAdapter } from "../../infra/storage/asyncStorageAdapter";
import { clientTokenStorageAdapter } from "../../infra/storage/clientTokenStorageAdapter";
import { SessionRepository } from "../../domain/repositories/SessionRepository";

const SESSION_KEY = "user_session";
const CLIENT_TOKEN_KEY = "client_token";

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

    const access = session.token ?? session.token ?? null;
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

  async saveClientToken(token) {
    if (typeof token !== "string" || !token.trim()) {
      throw new Error("Client token must be a non-empty string");
    }
    await clientTokenStorageAdapter.setItem(CLIENT_TOKEN_KEY, token.trim());
  }

  async getClientToken() {
    const token = await clientTokenStorageAdapter.getItem(CLIENT_TOKEN_KEY);
    if (!token || typeof token !== "string") return null;
    const normalizedToken = token.trim();
    return normalizedToken || null;
  }

  async clearClientToken() {
    await clientTokenStorageAdapter.removeItem(CLIENT_TOKEN_KEY);
  }
}

