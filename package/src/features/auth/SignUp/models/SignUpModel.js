import { signUp } from "../../../../composition/authSession";

export const postSignUp = async ({
  email,
  password,
  first_name,
  last_name,
}) => {
  try {
    const result = await signUp({
      email,
      password,
      first_name,
      last_name,
    });

    if (!result?.ok) {
      throw new Error(result?.error?.message || "Sign up failed");
    }

    return { success: true, data: result.value };
  } catch (error) {
    return { success: false, error: error.message || "Sign up failed" };
  }
};
