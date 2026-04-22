import { useEffect } from "react";


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

const verifyUse = () =>{
    const token = localStorage.getItem('token');
    const dataUser = token ? parseJwt(token) : null;
    if(dataUser){
        fetch(`http://localhost:3000/verifica/${dataUser.username}`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            
        })
        .then(response => response.json())
        .then(data => {
            if(data.mensaje){
                console.log(data.mensaje);
            }else{
                console.log("Usuario no encontrado");
            }   
    });
};
}

const Home = () => {
        useEffect(() => {
        verifyUse();
    }, []);
    return (
        <div>Te logueaste correctamente</div>
    );
}   
export default Home;