import styles from "./Register.module.css";
import { useState } from "react";
import Alert from "../../components/Alert/Alert";
import AlertSuccess from "../../components/Alert/AlertSuccess";
import CustomButton1 from "../../components/Buttons/Button1";


const Register = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isRegistered, setIsRegistered] = useState<boolean>(false);
    
    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if(password !== confirmPassword){
            setError('Las contraseñas no coinciden');
            return;
        }
        const data = { username: username,
                        email: email, 
                        password: password };
        
            //USO DEL AWAIT 
        try {
            const response = await fetch('http://localhost:3000/Register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
            });
            const result = await response.json();

            if (response.ok && result.message === 'Usuario registrado exitosamente, valida tu cuenta a través del enlace enviado a tu correo electrónico') {
            setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
            setIsRegistered(true);
            } else {
            setError(result.message || 'Error en el registro');
            }

        } catch (error) {
            // 4. Capturamos errores de red o fallos del servidor
            console.error('Error:', error);
            setError('No se pudo conectar con el servidor');
        }
    };
    return (
        <div className={styles.container}>
            {isRegistered ? (
                <div className={styles.successWrapper}>
                    <AlertSuccess message="¡Registro exitoso! Revisa tu email." />
                    <p>Hemos enviado un enlace de confirmación.</p>
                    <CustomButton1
                        onClick={() => window.location.href = '/login'}
                        text="Ir al Login"
                    />
                </div>
        ) : (
            <div className={styles.card}>
                <h1 className={styles.title}>Crear Cuenta</h1>
                <p className={styles.subtitle}>Regístrate para gestionar el taller</p>

                {error && <Alert message={error} />}

                <form className={styles.form} onSubmit={handleRegister}>
                <div className={styles.group}>
                    <label htmlFor="username" className={styles.label}>Usuario</label>
                    <input 
                    type="text" 
                    id="username"
                    className={styles.input}
                    placeholder="Ej: TomasDev"
                    onChange={(e) => setUsername(e.target.value)}
                    required 
                    />
                </div>

                <div className={styles.group}>
                    <label htmlFor="email" className={styles.label}>Email</label>
                    <input 
                    type="email" 
                    id="email"
                    className={styles.input}
                    placeholder="correo@ejemplo.com"
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                    />
                </div>

                <div className={styles.group}>
                    <label htmlFor="password" className={styles.label}>Contraseña</label>
                    <input 
                    type="password" 
                    id="password"
                    className={styles.input}
                    placeholder="••••••••"
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    />
                </div>

                <div className={styles.group}>
                    <label htmlFor="confirmPassword" className={styles.label}>Confirmar Contraseña</label>
                    <input 
                    type="password" 
                    id="confirmPassword"
                    className={styles.input}
                    placeholder="••••••••"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    />
                </div>

                <button type="submit" className={styles.button}>Registrarse</button>
                </form>

                <div className={styles.footer}>
                <span>¿Ya tienes cuenta?</span>
                <a href="/login" className={styles.link}>Inicia sesión</a>
                </div>
            </div>
    )}
    </div> 
    );
}

export default Register;