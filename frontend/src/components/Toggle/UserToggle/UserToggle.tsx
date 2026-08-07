import UserCircleIconWhite from "@/assets/userCircleIconWhite.svg";
import UserCircleIconBlack2 from "@/assets/userCircleIconBlack2.svg";
import styles from "./UserToggle.module.css";
import { useTheme } from "next-themes";
import {useNavigate} from "react-router-dom";



const UserToggle = () => {
    const navigate = useNavigate();
    
    const { resolvedTheme, setTheme } = useTheme();

    const esOscuro = resolvedTheme === "dark";

    return (
        <button
        type="button"
        className={styles.toggle}
        onClick={() => navigate('/userManagement')}
        aria-label="Cambiar entre modo claro y oscuro"
        title={esOscuro ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
        {esOscuro ?  <img src={UserCircleIconBlack2} alt="Modo claro" /> : <img src={UserCircleIconWhite} alt="Modo oscuro" /> }
        </button>
    );
};
export default UserToggle;