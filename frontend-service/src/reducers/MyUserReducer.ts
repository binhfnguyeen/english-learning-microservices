import Cookies from "js-cookie";

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

const MyUserReducer = (current: User | null, action: Action): User | null => {
  switch (action.type) {
    case "login":
      return action.payload;
    case "logout":
      Cookies.remove("accessToken");
      return null;
    default:
      return current;
  }
};

export default MyUserReducer;