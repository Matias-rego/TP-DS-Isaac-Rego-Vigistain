import Nav from "../Nav/Nav";
import styles from './Gestion.module.css';
import { useEffect, useState, useCallback } from "react";
import TarjetaGestion from "../../components/TarjetaGestion/TarjetaGestion";
import TableRtl from "@/components/DataTable/DataTable";
import type { ColumnConfig } from "@/components/DataTable/DataTable";
import AltaTipoFalla from '@/pages/TipoFalla/AltaTipoFalla';
import BajaTipoFalla from '@/pages/TipoFalla/BajaTipoFalla';
import ModificacionTipoFalla from '@/pages/TipoFalla/ModificacionTipoFalla';
import AltaTipoCliente from "../TipoCliente/AltaTipoCliente";
import BajaTipoCliente from "../TipoCliente/BajaClientCategory";
import ModifyClientCategory from "../TipoCliente/ModifyClientCategory";
import { eventBus, EVENTS } from "@/lib/eventBus";
import { BACKEND_URL } from '@/lib/config';
import RegisterPaymentType from "../TipoPago/RegisterPaymentType";
import DeletePaymentType from "../TipoPago/DeletePaymentType";
import ModifyPaymentType from "../TipoPago/ModifyPaymentType";
import { Wrench, Users, CreditCard, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer/Footer";
import { useAuth } from "@/lib/AuthContext";


// ─── Tipos y columnas ─────────────────────────────────────────────────────────
interface FailureType {
  id_failure_type: number;
  failureDescription: string;
  estimatedImport: number;
}

const COLUMNS_TF: ColumnConfig<FailureType>[] = [
  { key: 'id_failure_type', label: 'ID' },
  { key: 'failureDescription', label: 'Descripción' },
  {
    key: 'estimatedImport',
    label: 'Costo Estimado',
    isTotalField: true,
    format: (v) => `$${Number(v).toLocaleString('es-AR')}`,
  },
];

interface ClientType {
  id_category_client: number;
  categoryClientName: string;
  amountForCategoryUp: number;
}

const COLUMNS_TC: ColumnConfig<ClientType>[] = [
  { key: 'id_category_client', label: 'ID' },
  { key: 'categoryClientName', label: 'Nombre' },
  { key: 'amountForCategoryUp', label: 'Órdenes requeridas' },
];

interface PaymentType {
  id_payment_type: number;
  paymentTypeName: string;
  paymentMethod: string;
  type_of_payment: string;
  percentaje: number;
}

const COLUMNS_PT: ColumnConfig<PaymentType>[] = [
  { key: 'id_payment_type', label: 'ID' },
  { key: 'paymentTypeName', label: 'Nombre' },
  { key: 'percentaje', label: 'Porcentaje', format: (value) => `${(Number(value) * 100).toLocaleString('es-AR')}%` },
  { key: 'paymentMethod', label: 'Método de Pago' },
];

const Gestion = () => {
  const { isAuth, loading: authLoading } = useAuth();

  const [dataTF, setDataTF] = useState<FailureType[]>([]);
  const [dataTC, setDataTC] = useState<ClientType[]>([]);
  const [dataPT, setDataPT] = useState<PaymentType[]>([]);
  // Qué está seleccionado para gestionar: null = pantalla de opciones
  const [seleccion, setSeleccion] = useState<string | null>(null);

  const busquedaTF = useCallback(async () => {
    try {
      const result = await fetch(`${BACKEND_URL}/api/failure-types/`,
        { method: 'GET', credentials: 'include' });

      if (result.status === 404) { setDataTF([]); return; }
      const data = await result.json();
      setDataTF(data);
    } catch (e) {
      console.error('Error al buscar TF:', e);
    }
  }, []);

  const busquedaTC = useCallback(async () => {
    try {
      const result = await fetch(`${BACKEND_URL}/api/client-types/`,
        { method: 'GET', credentials: 'include' });

      if (result.status === 404) { setDataTC([]); return; }
      const data = await result.json();
      setDataTC(data);
    } catch (e) {
      console.error('Error al buscar TC:', e);
    }
  }, []);

  const busquedaTP = useCallback(async () => {
    try {
      const result = await fetch(`${BACKEND_URL}/api/payment-types/`,
        { method: 'GET', credentials: 'include' });

      if (result.status === 404) { setDataPT([]); return; }
      const data = await result.json();
      setDataPT(data);
    } catch (e) {
      console.error('Error al buscar TP:', e);
    }
  }, []);


  useEffect(() => {
    if (!authLoading && isAuth) {
      busquedaTF();
      busquedaTC();
      busquedaTP();
    }
  }, [authLoading, isAuth, busquedaTF, busquedaTC, busquedaTP]);


  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.failureTypeChanged, () => busquedaTF());
    return unsubscribe;
  }, [busquedaTF]);

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.clientChanged, () => busquedaTC());
    return unsubscribe;
  }, [busquedaTC]);
  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.clientCategoryChanged, () => busquedaTC());
    return unsubscribe;
  }, [busquedaTC]);
  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.paymentTypeChanged, () => busquedaTP());
    return unsubscribe;
  }, [busquedaTP]);

  // Las 3 opciones que se muestran al entrar
  const opciones = [
    { key: 'falla',   titulo: 'Tipo de Falla',   icon: <Wrench size={26} />,     descripcion: 'Administrá los tipos de falla que pueden ocurrir en los dispositivos.' },
    { key: 'cliente', titulo: 'Tipo de Cliente', icon: <Users size={26} />,      descripcion: 'Administrá los tipos de cliente que interactúan con tu negocio.' },
    { key: 'pago',    titulo: 'Tipo de Pago',    icon: <CreditCard size={26} />, descripcion: 'Administrá los métodos de pago que tus clientes pueden utilizar.' },
  ];

  return (
    <>
      <Nav />
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.titleHeader}>Gestión</h1>
          <p className={styles.descriptionHeader}>
            {seleccion === null
              ? 'Elegí qué querés administrar: tipos de falla, tipos de cliente o tipos de pago.'
              : 'Gestioná los registros de esta categoría. Podés volver para elegir otra.'}
          </p>
        </div>

        {seleccion === null ? (
          // ── Pantalla de opciones: 3 tarjetas ──
          <div className={styles.opcionesGrid}>
            {opciones.map((o) => (
              <button key={o.key} type="button" className={styles.opcionCard} onClick={() => setSeleccion(o.key)}>
                <span className={styles.opcionIcon}>{o.icon}</span>
                <h3 className={styles.opcionTitulo}>{o.titulo}</h3>
                <p className={styles.opcionDesc}>{o.descripcion}</p>
                <span className={styles.opcionAbrir}>Abrir →</span>
              </button>
            ))}
          </div>
        ) : (
          // ── Detalle de la opción elegida + botón volver ──
          <div className={styles.detalle}>
            <button type="button" className={styles.volverBtn} onClick={() => setSeleccion(null)}>
              <ArrowLeft size={18} /> Volver
            </button>

            {seleccion === 'falla' && (
              <TarjetaGestion
                titulo="Tipo de Falla"
                descripcion="Administrá los tipos de falla que pueden ocurrir en los dispositivos. Agregá, editá o eliminá categorías para mantener tu sistema organizado."
                childrenTable={
                  <TableRtl data={dataTF} idField="id_failure_type" columns={COLUMNS_TF} caption="Tabla de Tipos de Fallas" showTotal={false} />
                }
                childrenFuncionAlta={<AltaTipoFalla />}
                childrenFuncionBaja={<BajaTipoFalla />}
                childrenFuncionModify={<ModificacionTipoFalla />}
              />
            )}

            {seleccion === 'cliente' && (
              <TarjetaGestion
                titulo="Tipo de Cliente"
                descripcion="Administrá los tipos de cliente que interactúan con tu negocio. Agregá, editá o eliminá categorías para segmentar tus servicios."
                childrenTable={
                  <TableRtl data={dataTC} idField="id_category_client" columns={COLUMNS_TC} caption="Tabla de Tipos de Cliente" showTotal={false} />
                }
                childrenFuncionAlta={<AltaTipoCliente />}
                childrenFuncionBaja={<BajaTipoCliente />}
                childrenFuncionModify={<ModifyClientCategory />}
              />
            )}

            {seleccion === 'pago' && (
              <TarjetaGestion
                titulo="Tipo de Pago"
                descripcion="Administrá los métodos de pago que tus clientes pueden utilizar. Agregá, editá o eliminá métodos para dar más flexibilidad."
                childrenTable={
                  <TableRtl data={dataPT} idField="id_payment_type" columns={COLUMNS_PT} caption="Tabla de Tipos de Pago" showTotal={false} />
                }
                childrenFuncionAlta={<RegisterPaymentType />}
                childrenFuncionBaja={<DeletePaymentType />}
                childrenFuncionModify={<ModifyPaymentType />}
              />
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Gestion;
