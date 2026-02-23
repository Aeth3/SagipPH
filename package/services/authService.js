import {
  signInWithPassword,
  signOut as signOutUsecase,
  signUp as signUpUsecase,
} from "../src/composition/authSession";

export const signin = async (formData) => {
  try {
    const result = await signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    if (!result?.ok) {
      throw new Error(result?.error?.message || "Login failed");
    }

    console.log("SUCCESS:", result.value);
    return { success: true, data: result.value };
  } catch (error) {
    console.log("FAILED:", error.message);
    return { success: false, error: error.message };
  }
};

export const signup = async ({ email, password, first_name, last_name }) => {
  try {
    const result = await signUpUsecase({
      email,
      password,
      first_name,
      last_name,
    });

    if (!result?.ok) {
      throw new Error(result?.error?.message || "Sign up failed");
    }

    console.log("SUCCESS:", result.value);
    return { success: true, data: result.value };
  } catch (error) {
    console.log("FAILED:", error.message);
    return { success: false, error: error.message };
  }
};

export const signout = async () => {
  try {
    const result = await signOutUsecase();
    if (!result?.ok) {
      throw new Error(result?.error?.message || "Sign out failed");
    }

    return { success: true };
  } catch (error) {
    console.error("Logout failed:", error.message);
    return { success: false, error: error.message };
  }
};
