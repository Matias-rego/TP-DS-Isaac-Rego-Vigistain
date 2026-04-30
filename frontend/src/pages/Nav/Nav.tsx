import styles from './Nav.module.css';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useNavigate } from 'react-router-dom';
import { parseJwt } from '../App/App';
import { useEffect, useState } from 'react';

interface UserProfile {
  nombre_usuario: string;
  email: string;
  rol: string;
  foto_url?: string;
}

const Nav = () => {
  const [usuario, setUsuario] = useState<UserProfile | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay token');

        const decoded = parseJwt(token);
        if (!decoded?.username) throw new Error('Token inválido');

        const response = await fetch(
          `http://${import.meta.env.VITE_BACKEND_HOST}:${import.meta.env.VITE_BACKEND_PORT}/verifica/${decoded.username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error(`Error ${response.status}`);

        const data: UserProfile[] = await response.json();
        if (!data.length) throw new Error('Usuario no encontrado');

        setUsuario(data[0]);
      } catch (e) {
        console.error('Error al cargar perfil:', e);
      }
    };

    cargarPerfil();
  }, []);

  const confirmarLogout = () => {
    localStorage.removeItem('token');
    setShowLogoutModal(false);
    window.location.replace('/login');
  };

  return (
    <>
      <nav className={styles.navContainer}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>TF</span>
          <div className={styles.logoCopy}>
            <span className={styles.logoText}>TechFix</span>
            <span className={styles.logoSubtitle}>
              Reparamos lo que te conecta
            </span>
          </div>
        </div>

        <ul className={styles.navLinks}>
          <li>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => navigate('/home')}
            >
              Inicio
            </button>
          </li>

          <li>
            <button
              type="button"
              className={styles.navButton}
              onClick={() =>
                alert('La sección Servicios todavía está en desarrollo.')
              }
            >
              Servicios
            </button>
          </li>

          <li>
            <button
              type="button"
              className={styles.navButton}
              onClick={() =>
                alert('La sección Proyectos todavía está en desarrollo.')
              }
            >
              Proyectos
            </button>
          </li>
        </ul>

            {/* Avatar del usuario MANUAL */}
          <div className={styles.navActions}>
            <button
              type="button"
              className={styles.logoutButton}
              onClick={() => setShowLogoutModal(true)}
            >
              <span className={styles.logoutIcon}>⏻</span>
              Cerrar sesión
            </button>

            <img
              src={usuario?.foto_url}
              alt={usuario?.nombre_usuario}
              className={styles.avatar}
              onClick={() => navigate('/perfil')}
            />
          </div>
      </nav>

      {showLogoutModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalIcon}>⏻</div>

            <h2 className={styles.modalTitle}>¿Cerrar sesión?</h2>

            <p className={styles.modalText}>
              Vas a salir de tu cuenta actual. Para volver a ingresar, tendrás
              que iniciar sesión nuevamente.
            </p>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className={styles.confirmButton}
                onClick={confirmarLogout}
              >
                Sí, cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Nav;
