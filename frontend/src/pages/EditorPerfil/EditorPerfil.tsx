import styles from "./EditorPerfil.module.css";
import Nav from "./../Nav/Nav";
import AlertSuccess from "../../components/Alert/AlertSuccess";
import Alert from "../../components/Alert/Alert";
import CustomButton1 from "../../components/Buttons/Button1";
import { useState } from "react";


const EditorPerfil = () => {
  return (
    <div className={styles.page}>
      <Nav />
      <h1>Editor de Perfil</h1>
    </div>
  );
}
export default EditorPerfil;