// Perfil.tsx
import Nav from '../Nav/Nav';
import { parseJwt } from '../App/App';
import { useEffect, useState } from 'react';
import { Avatar, Badge } from '@chakra-ui/react';
import styles from './Perfil.module.css';
import TarjetaTrabajos from "../../components/Tarjetas/TarjetaTrabajos";
import TarjetaMetrica from "../../components/Tarjetas/TarjetaMetrica";
import EditarPerfil from "../EditorPerfil/EditorPerfil";


interface UserProfile {
  nombre_usuario: string;
  email: string;
  rol: string;
  foto_url?: string;
}


const Perfil = () => {
  const [usuario, setUsuario] = useState<UserProfile | null>(null);
  const [error, setError]     = useState<string | null>(null);
  const [comienzaEdicion, setComienzaEdicion] = useState<boolean>(false);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No hay token');

        const decoded = parseJwt(token);
        if (!decoded?.username) throw new Error('Token inválido');

        const response = await fetch(
          `http://localhost:3000/verifica/${decoded.username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error(`Error ${response.status}`);

        // El backend devuelve un ARRAY → tomamos el primer elemento
        const data: UserProfile[] = await response.json();
        if (!data.length) throw new Error('Usuario no encontrado');

        setUsuario(data[0]);
      } catch (e) {
        console.error('Error al cargar perfil:', e);
        setError(e instanceof Error ? e.message : 'Error desconocido');
      }
    };

    const comienzaEdicion = async () =>{
    
    }

    cargarPerfil();
  }, []);


  if (error)    return <p className={styles.error}>Error: {error}</p>;
  if (!usuario) return <p className={styles.loading}>Cargando perfil...</p>;
  

  return (
    <>{comienzaEdicion ? <EditarPerfil/> :
    <div className={styles.page}>
      <Nav />

      <div className={styles.container}>

        {/* ── Tarjeta de perfil ── */}
        <div className={styles.card}>
          <div className={styles.cardFlex}>

            {/* Avatar — size viene de Chakra, borde del CSS module */}
            <Avatar.Root size="2xl" className={styles.avatarRoot}>
              <Avatar.Image src={usuario?.foto_url} />
              <Avatar.Fallback bg="#1A202C" color="white">
                {usuario?.nombre_usuario?.[0]?.toUpperCase() ?? '?'}
              </Avatar.Fallback>
            </Avatar.Root>

            {/* Datos */}
            <div className={styles.dataStack}>

              {/* Nombre */}
              <div className={styles.fieldBox}>
                <p className={styles.fieldLabel}>NOMBRE DE USUARIO</p>
                <div className={styles.fieldRow}>
                  <span className={styles.nameText}>{usuario.nombre_usuario}</span>
                  <button className={styles.editButton} onClick={() => setComienzaEdicion(true)}>
                    Editar
                  </button>
                </div>
              </div>

              {/* Email */}
              <div className={styles.fieldBox}>
                <p className={styles.fieldLabel}>CORREO ELECTRÓNICO</p>
                {/*<div className={styles.fieldRow}>
                  <span className={styles.emailText}>{usuario.email}</span>
                  <button className={styles.changeButton}>Cambiar</button>
                </div> */}
              </div>

              {/* Rol — Badge de Chakra, estilos inline mínimos */}
              <Badge colorPalette="blue" variant="surface" borderRadius="lg" px="3">
                {usuario.rol}
              </Badge>

            </div>
          </div>
        </div>

        {/* ── Sección tarjetas asociadas ── */}
        <div className={styles.sectionWrapper}>
            <h2 className={styles.sectionTitle}>...Tarjetas...</h2>
        </div>

      </div>
          {/* Forma para usar la tarjeta de Reparaciones,
        <Tarjeta
        titulo="Cantidad de reparaciones"
        subtitulo="Toyota Corolla — ABC 123"
        estado="reparado"
        footerLabel="Finalizado"
        footerValue="12 may 2025"
        onClick={() => navigate('/detalle/123')}
        />*/}
    {/* Forma para usar la tarjeta métrica,
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <TarjetaMetrica label="Reparaciones totales" valor={10} />
        <TarjetaMetrica label="Pendientes"           valor={3}  sub="Esta semana" />
        <TarjetaMetrica label="Tiempo promedio"       valor="2.4" sub="días por servicio" />
        <TarjetaMetrica label="Facturado"             valor="$148k" sub="Este mes" />
        </div> */}
    </div>
}</>
  );
};

export default Perfil;