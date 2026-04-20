import { useState } from 'react';
import styles from './Login.module.css';
import Home from '../Home/Home';

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

const Login = () => {
    
    const [password, setPassword] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [login, setLogin] = useState<boolean>(false);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) :void => {
        e.preventDefault();
        const data = {
          username: username,
          password: password
        };
        fetch('http://localhost:3000/Login',  {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)    
        })        
          .then(response => response.json())
          .then(data => {
            if(data.token){
              localStorage.setItem('token', data.token);
              setLogin(true);
            }else{
              setLogin(false);
              }
            
          })
          .catch(error => {
            console.error('Error:', error);
          });

      }
    

    return (
    <>{login ? <Home />: 
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar Sesión</h1>
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.group}>
            <label htmlFor="username" className={styles.label}>Username:</label>
            <input 
              onChange={(e): void => setUsername(e.target.value)}
              type="text" 
              id="username" 
              name="username" 
              className={styles.input} 
              placeholder="Usuario" 
              required 
            />
          </div>

          <div className={styles.group}>
            <label htmlFor="password" className={styles.label}>Password:</label>
            <input 
              onChange={(e): void => setPassword(e.target.value)}         
              type="password" 
              id="password" 
              name="password" 
              className={styles.input} 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button type="submit" className={styles.button} >Login</button>
        </form>
      </div>
    </div>
}</>
  );
}
export default Login;