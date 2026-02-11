import CreateAccount from "../../../../app/pages/Auth/CreateAccount"
import { useSignUpController } from "./controllers/SignUpController";

export default function SignUpScreen() {
  const {
    handleSignUp,
    handleHaveAccount,
    loading,
    modalInfo,
    handleConfirm,
  } = useSignUpController();

  return (
    <CreateAccount
      handleSignUp={handleSignUp}
      handleHaveAccount={handleHaveAccount}
      loading={loading}
      modalInfo={modalInfo}
      handleConfirm={handleConfirm}
    />
  );
}
