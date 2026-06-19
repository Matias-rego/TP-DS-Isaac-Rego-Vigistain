import Nav from "../Nav/Nav";
import { Card, CardContent } from "@/components/ui/card";
import styles from './Gestion.module.css';
import { useEffect, useState, useCallback } from "react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import TarjetaGestion from "../../components/TarjetaGestion/TarjetaGestion";
import imagenTarjetaTipoFalla from "../../assets/imagenTarjetaTipoFalla.png";
import imagenTarjetaTipoCliente from "../../assets/imagenTarjetaTipoCliente.png";
import TableRtl from "@/components/DataTable/DataTable";
import { parseJwt } from "../App/App";
import AltaTipoFalla from '@/pages/TipoFalla/AltaTipoFalla';
import BajaTipoFalla from '@/pages/TipoFalla/BajaTipoFalla';
import ModificacionTipoFalla from '@/pages/TipoFalla/ModificacionTipoFalla';
import AltaTipoCliente from "../TipoCliente/AltaTipoCliente";
import { eventBus, EVENTS } from "@/lib/eventBus";


const Gestion = () => {

const [dataTF, setDataTF] = useState<[]>([]);
const [dataTC, setDataTC] = useState([]);

const busquedaTF = useCallback(async () => {
  console.log("Ejecutando busquedaTF");
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay token');

    const decoded = parseJwt(token);
    if (!decoded?.id_user) throw new Error('Token inválido');

    const result = await fetch(
      `http://${import.meta.env.VITE_BACKEND_HOST}:${import.meta.env.VITE_BACKEND_PORT}/failures/getAllTypes`,
      {
        headers: { Authorization: `Bearer ${token}` },
        method: 'GET',
      }
    );

    if (result.status === 404) {
      setDataTF([]);
      return;
    }

    const data = await result.json();
        console.log("Datos recibidos:", data);
    setDataTF(data);

  } catch (e) {
    console.error('Error al buscar:', e);
  }
}, []);

const busquedaTC = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No hay token');

    const decoded = parseJwt(token);
    if (!decoded?.id_user) throw new Error('Token inválido');

    const result = await fetch(
      `http://${import.meta.env.VITE_BACKEND_HOST}:${import.meta.env.VITE_BACKEND_PORT}/clients/getAllTypes`,
      {
        headers: { Authorization: `Bearer ${token}` },
        method: 'GET',
      }
    );

    if (result.status === 404) {
      setDataTC([]);
      return;
    }

    const data = await result.json();
    setDataTC(data);

  } catch (e) {
    console.error('Error al buscar:', e);
  }
}, []);
  
useEffect(() => {
  const unsubscribe = eventBus.on(
    EVENTS.failureTypeChanged,
    () => {
      console.log("Evento recibido");
      busquedaTF();
    }
  );

  return unsubscribe;
}, [busquedaTF]);

useEffect(() => {
  const unsubscribe = eventBus.on(
    EVENTS.clientChanged,
    () => {
      console.log("Evento recibido");
      busquedaTC();
    }
  );

  return unsubscribe;
}, [busquedaTC]);
useEffect(() => {
  busquedaTF();
}, [busquedaTF]);

useEffect(() => {
  busquedaTC();
}, [busquedaTC]);
const [sliderRef, instanceRef] = useKeenSlider({
    slides: { perView: 1, spacing: 16 },
  });

    return (
        <>
            <Nav />
<div className={styles.container}>
    <div className={styles.header}>
      <h1 className={styles.titleHeader}>Gestión </h1>
      <p className={styles.descriptionHeader}>
        Bienvenido a la sección de gestión. Aquí podrás administrar los tipos de fallas, tipos de clientes y los tipos de pago de manera eficiente.
      </p>
    </div>
  <div style={{ maxWidth: '100%', margin: '30px auto', padding: '0 48px', position: 'relative' }}>
        <button
          onClick={() => instanceRef.current?.prev()}
          style={{
            position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer', fontSize: '18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10
          }}
        >‹</button>

        {/* Slider */}
        <div ref={sliderRef} className="keen-slider">
          <div className="keen-slider__slide">
              <TarjetaGestion 
              titulo="Tipo falla"
              descripcion="Administra los tipos de fallas que pueden ocurrir en los dispositivos. Agrega, edita o elimina categorías para mantener tu sistema organizado y eficiente."
              imagen={imagenTarjetaTipoFalla}
              childrenTable={<TableRtl data={dataTF} showTotal={false} object="Tipo Falla"/>}
              childrenFuncionAlta={<AltaTipoFalla/>} 
              childrenFuncionBaja={<BajaTipoFalla/>}
              childrenFuncionModify={<ModificacionTipoFalla/>}/>
              
            </div>
            <div className="keen-slider__slide">
                <TarjetaGestion 
                titulo="Tipo Cliente"
                descripcion="Administra los tipos de clientes que interactúan con tu negocio. Agrega, edita o elimina categorías para segmentar y personalizar tus servicios de manera efectiva."
                imagen={imagenTarjetaTipoCliente}
                childrenTable={<TableRtl data={dataTC} showTotal={false} object="Tipo Cliente"/>}
                childrenFuncionAlta={<AltaTipoCliente/>}
                />
                
            </div>
        </div>
        

        <button
          onClick={() => instanceRef.current?.next()}
          style={{
            position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
            background: 'white', border: '1px solid #e5e7eb', borderRadius: '50%',
            width: 36, height: 36, cursor: 'pointer', fontSize: '18px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10
          }}
          >›</button>

      </div>       
      </div>
        </>
    );
}
export default Gestion;