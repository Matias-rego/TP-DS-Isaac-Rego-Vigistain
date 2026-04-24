import styles from './Nav.module.css';
import { Avatar, HStack } from "@chakra-ui/react"
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
      const [error, setError]     = useState<string | null>(null);
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
    
            // El backend devuelve un ARRAY → tomamos el primer elemento
            const data: UserProfile[] = await response.json();
            if (!data.length) throw new Error('Usuario no encontrado');
    
            setUsuario(data[0]);
          } catch (e) {
            console.error('Error al cargar perfil:', e);
            setError(e instanceof Error ? e.message : 'Error desconocido');
          }
        };
    
        cargarPerfil();
      }, []);
    
    const navigate = useNavigate();
    return(
    <nav className={styles.navContainer}>
        <div className={styles.logo}>
            <span className={styles.logoText}>TC</span>
            <span className={styles.logoHighlight}>TallerMecanico</span>
        </div>
        
        <ul className={styles.navLinks}>
            <li><a href="#" className={styles.link}>Inicio</a></li>
            <li><a href="#" className={styles.link}>Servicios</a></li>
            <li><a href="#" className={styles.link}>Proyectos</a></li>
        </ul>

        {/*
        <div className={styles.navActions}>
            <button className={styles.buttonPrimary}>Contacto</button>
        </div>*/}
        <HStack>
            <Avatar.Root 
            onClick={() => navigate('/perfil')}
            style={{ cursor: 'pointer' }}
            shape="full" size="lg">
                <Avatar.Image src={usuario?.foto_url} />
                <Avatar.Fallback name={usuario?.nombre_usuario} />
                {/* <Avatar.Image src="" /> aca iria la imagen*/}
            </Avatar.Root>
        </HStack>
    </nav>
    );
}
export default Nav;
