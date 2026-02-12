import { ok, fail } from "package/src/shared/result";
export default function makeCreateLoan({ loanRepository }) {
    return async (data) => {
        try {
            const loan = await loanRepository.createLoan(data);
            return ok(loan);
        } catch (error) {
            return fail("LOAN_CREATION_ERROR", error?.message || "Failed to create loan");
        }
    }
}