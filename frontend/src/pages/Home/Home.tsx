import { useEffect, useState } from "react";
import Nav from "../Nav/Nav"; 

function parseJwt(token: string) {
  try {
    // 1. Obtenemos el payload (la segunda parte del token)
    const base64Url = token.split('.')[1];
    
    // 2. Ajustamos los caracteres especiales de Base64Url a Base64 estándar
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // 3. Decodificamos y manejamos caracteres especiales (como tildes o eñes)
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error al parsear el JWT:", error);
    return null;
  }
}

const verifyUse = async (): Promise<string | null> => {
    const token = localStorage.getItem('token');
    const dataUser = token ? parseJwt(token) : null;

    if (!dataUser) return null;

    try {
        const response = await fetch(`http://localhost:3000/verifica/${dataUser.username}`);
        const data = await response.json();
        return data.mensaje || null;
    } catch (error) {
        console.error("Error en la verificación", error);
        return null;
    }
};

const Home = () => {
    const [tipoUsuario, setTipoUsuario] = useState<string>('');
        useEffect(() => {
            verifyUse().then(res => {
                if (res) setTipoUsuario(res);
            });
        }, []);
    return (
        <><Nav /><div>Te logueaste correctamente, {tipoUsuario}</div></>
    );
}   
export default Home;