import { loanRepository } from "../data/repositories/LoanRepositoryImpl";
import { makeGetLoans } from "../domain/usecases/loans/GetLoans";
import { makeGetLoanById } from "../domain/usecases/loans/GetLoanById";
import makeCreateLoan from "../domain/usecases/loans/createLoan";
import { makeDeleteLoan } from "../domain/usecases/loans/DeleteLoan";
import { makeUpdateLoan } from "../domain/usecases/loans/UpdateLoan";

export const getLoans = makeGetLoans({ loanRepository });
export const getLoanById = makeGetLoanById({ loanRepository });
export const createLoan = makeCreateLoan({ loanRepository });
export const deleteLoan = makeDeleteLoan({ loanRepository });
export const updateLoan = makeUpdateLoan({ loanRepository });