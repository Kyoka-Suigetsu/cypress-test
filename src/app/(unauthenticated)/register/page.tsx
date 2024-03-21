import { type Metadata } from "next";
import ParticipantRegisterForm from "./participant-register-form";

export const metadata: Metadata = {
  title: "Register",
};

export default function Register() {
  return <ParticipantRegisterForm />;
}
