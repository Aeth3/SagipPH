<<<<<<< ours
import { LegacyCreateAccountPage } from "@src/legacyApp"
=======
import { LegacyCreateAccountPage } from "package/src/legacyApp"
>>>>>>> theirs
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
    <LegacyCreateAccountPage
      handleSignUp={handleSignUp}
      handleHaveAccount={handleHaveAccount}
      loading={loading}
      modalInfo={modalInfo}
      handleConfirm={handleConfirm}
    />
  );
}
