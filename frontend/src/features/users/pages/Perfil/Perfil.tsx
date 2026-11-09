import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, notifyIfNeeded } from "@/api/client";
import type { User } from "@/features/users/types";
import UserProfile from "@/features/users/components/UserProfile/UserProfile"; 
import styles from "./Perfil.module.css";
import Footer from "@/components/Footer/Footer";

const Perfil = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await api<User>("/api/auth/me");
        setUser(data);
      } catch (e) {
        notifyIfNeeded(e, "No se pudo cargar el perfil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) return <p className={styles.loading}>Cargando perfil...</p>;
  if (!user) return <p className={styles.error}>No se pudo cargar el perfil.</p>;

  return (
    <>
      <UserProfile
        user={user}
        onEdit={() => navigate("/editor-perfil")}
        onChangePassword={() => {}}
      />
      <Footer />
    </>
  );
};

export default Perfil;