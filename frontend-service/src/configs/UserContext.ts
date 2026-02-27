"use client";

import React, { createContext } from "react";

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    username: string;
    password: string;
    isActive: true;
    avatar: string;
    role: string;
}

type Action =
  | { type: "login"; payload: User }
  | { type: "logout" };

export type UserContextType = {
  user: User | null;
  dispatch: React.Dispatch<Action>;
};

const UserContext = createContext<UserContextType | null>(null);
export default UserContext;
