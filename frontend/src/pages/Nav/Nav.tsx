import styles from './Nav.module.css';
import { Avatar, HStack } from "@chakra-ui/react"


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

        {/*
        <div className={styles.navActions}>
            <button className={styles.buttonPrimary}>Contacto</button>
        </div>*/}
        <HStack>
            <Avatar.Root shape="full" size="lg">
                <Avatar.Fallback name="Tomas Vigistain" />
                {/* <Avatar.Image src="" /> aca iria la imagen*/}
            </Avatar.Root>
        </HStack>
    </nav>
    );
}
export default Nav;