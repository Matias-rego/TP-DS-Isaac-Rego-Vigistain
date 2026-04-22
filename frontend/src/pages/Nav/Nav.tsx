import styles from './Nav.module.css';



const Nav = () => {
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

        <div className={styles.navActions}>
            <button className={styles.buttonPrimary}>Contacto</button>
        </div>
    </nav>
    );
}
export default Nav;