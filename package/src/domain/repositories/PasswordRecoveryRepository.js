export class PasswordRecoveryRepository {
    async requestPasswordReset(_payload) {
        throw new Error("PasswordRecoveryRepository.requestPasswordReset() not implemented");
    }

    async verifyRecoveryCode(_payload) {
        throw new Error("PasswordRecoveryRepository.verifyRecoveryCode() not implemented");
    }

    async updatePassword(_payload) {
        throw new Error("PasswordRecoveryRepository.updatePassword() not implemented");
    }
}
