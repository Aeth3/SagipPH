export class AuthRepository {
  /** @returns {Promise<{ user: Object, session: Object }>} */
  async signIn(_credentials) {
    throw new Error("AuthRepository.signIn() not implemented");
  }

  /** @returns {Promise<{ user: Object, session: Object | null }>} */
  async signUp(_payload) {
    throw new Error("AuthRepository.signUp() not implemented");
  }

  /** @returns {Promise<void>} */
  async signOut() {
    throw new Error("AuthRepository.signOut() not implemented");
  }

  /** @returns {Promise<Object | null>} */
  async getCurrentUser() {
    throw new Error("AuthRepository.getCurrentUser() not implemented");
  }

  /**
   * @param {string} _refreshToken
   * @returns {Promise<{ access_token: string, refresh_token: string }>}
   */
  async refreshSession(_refreshToken) {
    throw new Error("AuthRepository.refreshSession() not implemented");
  }
}
