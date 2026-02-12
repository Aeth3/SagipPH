import { fail, ok } from "package/src/shared/result";

export const makeGetLoans = ({ loanRepository }) => {
    return async () => {
        try {
            const loans = await loanRepository.getLoans();
            return ok(loans);
        } catch (error) {
            return fail("LOAN_GETTING_ERROR", error?.message || "Failed to get loans");
        }
    }
}