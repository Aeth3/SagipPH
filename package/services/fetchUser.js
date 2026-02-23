import { getCurrentUser } from "../src/composition/authSession";

export default async function fetchUser() {
  const result = await getCurrentUser();
  if (!result?.ok) {
    console.log("failed to get user", result?.error?.message);
    return null;
  }

  const user = result.value;
  console.log("got user", user);

  return user;
}
