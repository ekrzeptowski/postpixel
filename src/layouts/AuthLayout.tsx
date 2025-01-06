import { Outlet, useNavigate } from "react-router";

import { useAuth } from "../hooks/auth";

export const AuthLayout = () => {
  const auth = useAuth();
  const navigate = useNavigate();

  if (auth.user?.id) {
    navigate("/");
  }
  return <Outlet />;
};
