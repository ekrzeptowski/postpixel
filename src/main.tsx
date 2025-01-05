import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import AuthProvider from "./auth.tsx";

import { AuthLayout } from "./layouts/AuthLayout.tsx";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout.tsx";

import App from "./App.tsx";
import { LoginPage } from "./pages/Login.tsx";
import { RegisterPage } from "./pages/Register.tsx";

import "./index.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<AuthenticatedLayout />}>
            <Route index path="/" element={<App />} />
            {/* <Route path="/profile" element={<ProfilePage />} /> */}
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
