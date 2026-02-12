/**
 * Domain contract for auth operations.
 * Outer layers must provide a concrete implementation.
 */
export class AuthRepository {
  /**
   * @returns {Promise<{user: Object, session: Object}>}
   */
  async signInWithPassword(_credentials) {
    throw new Error("AuthRepository.signInWithPassword() not implemented");
  }

  /**
   * @returns {Promise<{user: Object, session: Object|null}>}
   */
  async signUp(_payload) {
    throw new Error("AuthRepository.signUp() not implemented");
  }

  /**
   * @returns {Promise<void>}
   */
  async signOut() {
    throw new Error("AuthRepository.signOut() not implemented");
  }

  /**
   * @returns {Promise<Object|null>}
   */
  async getCurrentUser() {
    throw new Error("AuthRepository.getCurrentUser() not implemented");
  }

  /**
   * @returns {Promise<void>}
   */
  async requestPasswordReset(_payload) {
    throw new Error("AuthRepository.requestPasswordReset() not implemented");
  }

  /**
   * @returns {Promise<void>}
   */
  async verifyRecoveryCode(_payload) {
    throw new Error("AuthRepository.verifyRecoveryCode() not implemented");
  }

  /**
   * @returns {Promise<void>}
   */
  async updatePassword(_payload) {
    throw new Error("AuthRepository.updatePassword() not implemented");
  }
  async sendOtp(_payload) {
    throw new Error('AuthRepository.sendOtp() not implemented');
  }

  async verifyOtp(_payload) {
    throw new Error('AuthRepository.verifyOtp() not implemented');
  }
}


