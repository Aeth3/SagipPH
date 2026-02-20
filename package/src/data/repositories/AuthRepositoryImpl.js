import { supabase } from "../../infra/supabase/supabaseClient";
import { AuthRepository } from "../../domain/repositories/AuthRepository";
import { createSession } from "../../domain/entities/Session";
import { createUser } from "../../domain/entities/User";
import {
  validateSupabaseAuthResponse,
  extractSupabaseUserMetadata,
} from "../../contracts/api/supabaseAuth.contract";
import { isNetworkError } from "../../contracts/errors/ApiErrors";

const mapSupabaseUser = (user) => {
  if (!user) return null;

  const metadata = extractSupabaseUserMetadata(user);

  return createUser({
    id: user.id,
    email: user.email,
    first_name: metadata.first_name,
    last_name: metadata.last_name,
    raw_user_meta_data: metadata,
  });
};

const normalizeNetworkError = (error) => {
  if (!isNetworkError(error)) return null;

  return new Error(
    "Unable to reach Supabase. Check emulator internet, SUPABASE_URL/SUPABASE_KEY in .env, then rebuild with Metro cache reset."
  );
};

export class AuthRepositoryImpl extends AuthRepository {
  async signInWithPassword({ email, password }) {
    try {
      const response = await supabase.auth.signInWithPassword({ email, password });

      // Validate response structure according to contract
      const validation = validateSupabaseAuthResponse(response);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const { data } = response;
      const user = mapSupabaseUser(data?.user);
      const session = createSession({
        access_token: data?.session?.access_token,
        refresh_token: data?.session?.refresh_token,
        user,
      });

      return { user, session };
    } catch (error) {
      const networkError = normalizeNetworkError(error);
      if (networkError) throw networkError;
      throw error;
    }
  }

  async signUp({ email, password, first_name, last_name }) {
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name,
            last_name,
          },
        },
      });

      // Validate response structure according to contract
      const validation = validateSupabaseAuthResponse(response);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const { data } = response;
      const user = mapSupabaseUser(data?.user);
      const session = data?.session
        ? createSession({
          access_token: data?.session?.access_token,
          refresh_token: data?.session?.refresh_token,
          user,
        })
        : null;

      return { user, session };
    } catch (error) {
      const networkError = normalizeNetworkError(error);
      if (networkError) throw networkError;
      throw error;
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message || "Sign out failed");
      }
    } catch (error) {
      const networkError = normalizeNetworkError(error);
      if (networkError) throw networkError;
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw new Error(error.message || "Could not load current user");
      }

      return mapSupabaseUser(data?.user) || null;
    } catch (error) {
      const networkError = normalizeNetworkError(error);
      if (networkError) throw networkError;
      throw error;
    }
  }

  async requestPasswordReset({ email }) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        throw new Error(error.message || "Could not request password reset");
      }
    } catch (error) {
      const networkError = normalizeNetworkError(error);
      if (networkError) throw networkError;
      throw error;
    }
  }

  async verifyRecoveryCode({ email, code }) {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "recovery",
      });

      if (error) {
        throw new Error(error.message || "Invalid recovery code");
      }
    } catch (error) {
      const networkError = normalizeNetworkError(error);
      if (networkError) throw networkError;
      throw error;
    }
  }

  async updatePassword({ password }) {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw new Error(error.message || "Could not update password");
      }
    } catch (error) {
      const networkError = normalizeNetworkError(error);
      if (networkError) throw networkError;
      throw error;
    }
  }
}

