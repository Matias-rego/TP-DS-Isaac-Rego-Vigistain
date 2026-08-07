import UserCircleIconWhite2 from "@/assets/userCircleIconWhite2.svg";
import UserCircleIconBlack from "@/assets/userCircleIconBlack.svg";
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
        title="Administrar usuarios"
        >
        {esOscuro ?  <img src={UserCircleIconWhite2} alt="Modo oscuro" /> : <img src={UserCircleIconBlack} alt="Modo claro" /> }
        </button>
    );
};
export default UserToggle;