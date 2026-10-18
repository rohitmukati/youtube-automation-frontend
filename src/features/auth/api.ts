import { api, bffApi, publicApi } from "@/lib/api/client";
import type { LoginValues, SignupValues } from "@/features/auth/schemas";
import type { MessageResponse, SessionPayload, User } from "@/types/api";

export const authApi = {
  async login(values: LoginValues): Promise<SessionPayload> {
    const { data } = await bffApi.post<SessionPayload>("/api/auth/login", {
      email: values.email,
      password: values.password,
    });
    return data;
  },

  async signup(values: SignupValues): Promise<SessionPayload> {
    const { data } = await bffApi.post<SessionPayload>("/api/auth/signup", {
      name: values.name,
      email: values.email,
      password: values.password,
      phone: values.phone ? values.phone : null,
    });
    return data;
  },

  async logout(): Promise<void> {
    await bffApi.post("/api/auth/logout");
  },

  async me(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    const { data } = await publicApi.post<MessageResponse>("/auth/forgot-password", { email });
    return data;
  },

  async resetPassword(payload: {
    email: string;
    otp: string;
    newPassword: string;
  }): Promise<MessageResponse> {
    const { data } = await publicApi.post<MessageResponse>("/auth/reset-password", {
      email: payload.email,
      otp: payload.otp,
      new_password: payload.newPassword,
    });
    return data;
  },
};
