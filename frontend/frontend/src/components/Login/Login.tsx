import styles from './Login.module.css';

const Login = () => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar Sesión</h1>
        
        <form action="/login" method="POST" className={styles.form}>
          <div className={styles.group}>
            <label htmlFor="username" className={styles.label}>Username:</label>
            <input 
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
              type="password" 
              id="password" 
              name="password" 
              className={styles.input} 
              placeholder="••••••••" 
              required 
            />
          </div>

          <button type="submit" className={styles.button}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;