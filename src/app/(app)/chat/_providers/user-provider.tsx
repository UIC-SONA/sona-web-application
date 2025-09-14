import {User} from "@/app/(app)/dashboard/users/definitions";
import {createContext, useContext} from "react";


export type UserContextType = {
  user: User
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
UserContext.displayName = "UserContext";

export const UserProvider = UserContext.Provider;

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}