/**
 * Domain contract for session persistence.
 * Outer layers must provide a concrete implementation.
 */
export class SessionRepository {
  async saveSession(_session) {
    throw new Error("SessionRepository.saveSession() not implemented");
  }

  async getSession() {
    throw new Error("SessionRepository.getSession() not implemented");
  }

  async clearSession() {
    throw new Error("SessionRepository.clearSession() not implemented");
  }

  async getAccessToken() {
    throw new Error("SessionRepository.getAccessToken() not implemented");
  }

  async getRefreshToken() {
    throw new Error("SessionRepository.getRefreshToken() not implemented");
  }

  async saveClientToken(_token) {
    throw new Error("SessionRepository.saveClientToken() not implemented");
  }

  async getClientToken() {
    throw new Error("SessionRepository.getClientToken() not implemented");
  }

  async clearClientToken() {
    throw new Error("SessionRepository.clearClientToken() not implemented");
  }
}
