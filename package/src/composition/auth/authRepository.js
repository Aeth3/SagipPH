import { DEMO_MODE } from "@env";
import { AuthRepositoryMockImpl } from "../../data/repositories/AuthRepositoryMockImpl";
import { AuthRepositoryApiImpl } from "../../data/repositories/AuthRepositoryApiImpl";

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") return value;
  const normalized = String(value ?? "").trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

export const IS_DEMO_MODE = normalizeBoolean(DEMO_MODE);

const authRepositoryMock = new AuthRepositoryMockImpl();
const authRepositoryApi = new AuthRepositoryApiImpl();

export const authRepository = IS_DEMO_MODE
  ? authRepositoryMock
  : authRepositoryApi;
