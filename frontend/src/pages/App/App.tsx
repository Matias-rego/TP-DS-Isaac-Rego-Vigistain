// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import Home from "../Home/Home";
import Login from "../Login/Login";
import Register from "../Register/Register";
import Perfil from "../Perfil/Perfil";
import EditorPerfil from "../EditorPerfil/EditorPerfil";
import ForgotPassword from "@/components/Password/ForgotPasswor";
import ResetPassword from "@/components/Password/ResetPassword";
import Gestion from "../Gestion/Gestion";
import Clientes from "../Clientes/Clients";
import { AuthProvider, useAuth } from "@/lib/AuthContext"; 

export const capitalize = (text: string): string => {
  if (!text) return ""; // Validación por si viene vacío
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const RutaPrivada = ({ children }: { children: ReactNode }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return isAuth ? <>{children}</> : <Navigate to="/login" replace />;
};

const RutaPublica = ({ children }: { children: ReactNode }) => {
  const { isAuth, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return !isAuth ? <>{children}</> : <Navigate to="/home" replace />;
};

const RaizRedirect = () => {
  const { isAuth, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  return <Navigate to={isAuth ? "/home" : "/login"} replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RaizRedirect />} />

          <Route path="/login" element={<RutaPublica><Login /></RutaPublica>} />
          <Route path="/register" element={<RutaPublica><Register /></RutaPublica>} />

          <Route path="/home" element={<RutaPrivada><Home /></RutaPrivada>} />
          <Route path="/perfil" element={<RutaPrivada><Perfil /></RutaPrivada>} />
          <Route path="/editor-perfil" element={<RutaPrivada><EditorPerfil /></RutaPrivada>} />
          <Route path="/gestion" element={<RutaPrivada><Gestion /></RutaPrivada>} />
          <Route path="/clientes" element={<RutaPrivada><Clientes /></RutaPrivada>} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;