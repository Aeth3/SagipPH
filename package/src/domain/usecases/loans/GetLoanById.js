import { fail, ok } from "package/src/shared/result";

export const makeGetLoanById = ({ loanRepository }) => {
    return async (id) => {
        try {
            const loan = await loanRepository.getLoanById(id);
            return ok(loan);
        } catch (error) {
            return fail("LOAN_GETTING_ERROR", error?.message || "Failed to get loan by id");
        }
    }
}