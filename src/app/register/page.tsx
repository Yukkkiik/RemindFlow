import type { Metadata } from "next";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Daftar - RemindFlow",
};

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
