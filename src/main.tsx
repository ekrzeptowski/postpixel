import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";

import AuthProvider from "./hooks/auth.tsx";

import { AuthLayout } from "./layouts/AuthLayout.tsx";
import { AuthenticatedLayout } from "./layouts/AuthenticatedLayout.tsx";

import { LoginPage } from "./pages/Login.tsx";
import { RegisterPage } from "./pages/Register.tsx";
import { CreatePage } from "./pages/Create.tsx";
import { FeedPage } from "./pages/Feed.tsx";
import { CommentPage } from "./pages/Comment.tsx";
import { SearchPage } from "./pages/Search.tsx";

import "./index.scss";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NuqsAdapter>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route element={<AuthenticatedLayout />}>
              <Route index path="/" element={<FeedPage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/comments/:photoId" element={<CommentPage />} />
              <Route path="/search" element={<SearchPage />} />
              {/* <Route path="/profile/me" element={<App />} /> */}
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </NuqsAdapter>
  </StrictMode>
);
