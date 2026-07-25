import { ReactNode } from "react";
import { GuestGuard } from "./GuestGuard";

export function GuestRoute({ children }: { children: ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}
