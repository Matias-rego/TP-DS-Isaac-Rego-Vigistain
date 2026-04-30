import styles from "./EditorPerfil.module.css";
import { useEffect,useState } from "react";
import Nav from "./../Nav/Nav";
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useNavigate } from "react-router-dom";
import { parseJwt } from "../App/App";

interface UserProfile {
nombre_usuario: string;
email: string;
rol: string;
foto_url?: string;
}



const EditorPerfil = () =>{
    const [usuario, setUsuario] = useState<UserProfile | null>(null);


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
    

    return(
        <><Nav />
        <div className={styles.container}>
            <div className={styles.card}>
            <h1 className={styles.title}>Edicion de Perfil</h1>
            
                    <img
            src={usuario?.foto_url}
            alt={usuario?.nombre_usuario}
            className={styles.avatarRoot}
          />
            </div>
        </div>
        </>
    )
}
export default EditorPerfil;
