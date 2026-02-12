import { ok, fail } from "package/src/shared/result";

export const makeUpdateLoan = ({ loanRepository }) => {
    return async (id, loanData) => {
        try {
            const updatedLoan = await loanRepository.updateLoan(id, loanData);
            return ok(updatedLoan);
        } catch (error) {
            return fail("LOAN_UPDATE_ERROR", error?.message || "Failed to update loan");
        }
    }
}