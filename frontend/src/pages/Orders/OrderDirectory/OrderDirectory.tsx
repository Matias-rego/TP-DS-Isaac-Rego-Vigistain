import Nav from "@/pages/Nav/Nav";
import Footer from "@/components/Footer/Footer";
import styles from "./OrderDirectory.module.css";
import '../../../index.css';
import { useEffect, useMemo, useState } from "react";
import type { Order, EnumOrderStatus, Status_History } from "@/types/types";
import { Wrench, FileText, AlertTriangle, Banknote } from "lucide-react";
import DescriptiveMiniCard from "@/components/Common/Cards/DescriptiveMiniCard/DescriptiveMiniCard";
import SearchBar, { type FilterConfig } from "@/components/SearchBar/SearchBar";
import TableRtl, { type ColumnConfig } from "@/components/Common/DataTable/DataTable";
import OrderDescription from "@/components/OrderComponent/OrderDescription/OrderDescription";
import { BACKEND_URL } from "@/lib/config";
import UpdateStatusModal from "@/components/Status/UpdateStatusModal/UpdateStatusModal";
import { eventBus, EVENTS } from '@/lib/eventBus';


// Mismo tono que venimos usando en OrderCard / StatusMiniDescriptiveCard
const STATUS_META: Record<EnumOrderStatus, { label: string; tone: 'info' | 'warning' | 'success' | 'danger' }> = {
  recibido:      { label: 'Recibido',           tone: 'info' },
  diagnostico:   { label: 'En diagnóstico',     tone: 'warning' },
  presupuestado: { label: 'Presupuestado',      tone: 'info' },
  aprobado:      { label: 'Aprobado',           tone: 'warning' },
  reparacion:    { label: 'En reparación',      tone: 'warning' },
  listo:         { label: 'Listo para retirar', tone: 'success' },
  entregado:     { label: 'Entregado',          tone: 'success' },
  cancelado:     { label: 'Cancelado',          tone: 'danger' },
};

const STATUS_FILTER_OPTIONS = Object.entries(STATUS_META).map(([value, meta]) => ({
  value,
  label: meta.label,
}));

interface OrderRow {
  id_order: number;
  orderLabel: string;
  customer: string;
  device: string;
  status: EnumOrderStatus;
  elapsed: string;
  raw: Order;
}

// Mismo criterio que usamos en OrderMiniCard/EquipmentDetailModal: último cambio de estado
const getCurrentStatus = (history?: Status_History[]): Status_History | null => {
  if (!history || history.length === 0) return null;
  return [...history].sort(
    (a, b) => new Date(b.dateOfChange).getTime() - new Date(a.dateOfChange).getTime()
  )[0];
};

const formatElapsed = (value: string) => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return '—';

  const diffHrs = Math.floor((Date.now() - date.getTime()) / 3600000);
  if (diffHrs < 1) return 'Hace instantes';
  if (diffHrs < 24) return `${diffHrs} hora${diffHrs === 1 ? '' : 's'}`;

  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} día${diffDays === 1 ? '' : 's'}`;
};

const toRow = (order: Order): OrderRow => {
  const currentStatus = getCurrentStatus(order.statusHistory);
  return {
    id_order: order.id_order,
    orderLabel: `#ORD-${order.id_order}`,
    customer: order.equipment?.client?.clientName ?? 'Sin cliente',
    device: order.equipment
      ? `${order.equipment.brand ?? ''} ${order.equipment.model ?? ''}`.trim()
      : `Equipo #${order.id_equipment}`,
    status: currentStatus?.status ?? 'recibido',
    elapsed: formatElapsed(order.dateOfEntry),
    raw: order,
  };
};

const OrderDirectory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModalActStatus, setShowModalActStatus] = useState(false);

  // fetchOrders vive en el nivel del componente, no dentro de un useEffect,
  // así puede reusarse tanto al montar como al limpiar el filtro (onClear)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/`, {
        method: 'GET',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Error al obtener las órdenes');
      const data: Order[] = await res.json();
      setOrders(data);
    } catch (e) {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.statusChanged, () => fetchOrders());
    return unsubscribe;
  }, [fetchOrders]);
  useEffect(() => {
    fetchOrders();
  }, []);

  const rows = useMemo(() => orders.map(toRow), [orders]);

  const activeRepairs = useMemo(
    () => rows.filter(r => r.status !== 'entregado' && r.status !== 'cancelado').length,
    [rows]
  );

  const pendingBudgets = useMemo(
    () => rows.filter(r => r.status === 'presupuestado').length,
    [rows]
  );

  const dailyRevenue = useMemo(() => {
    const today = new Date().toDateString();
    return orders
      .filter(o => o.deliveryDate && new Date(o.deliveryDate).toDateString() === today)
      .reduce((sum, o) => sum + (o.totalCharged ?? 0), 0);
  }, [orders]);

  const formattedRevenue = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(dailyRevenue);

  const filters: FilterConfig[] = [
    { key: 'status', label: 'Estado', type: 'select', placeholder: 'Todos los estados', options: STATUS_FILTER_OPTIONS },
    { key: 'dateOfEntry', label: 'Fecha de ingreso', type: 'date' },
  ];

  const columns: ColumnConfig<OrderRow>[] = [
    { key: 'orderLabel', label: 'ID' },
    { key: 'customer', label: 'Cliente' },
    { key: 'device', label: 'Equipo' },
    {
      key: 'status',
      label: 'Estado',
      render: (row) => {
        const meta = STATUS_META[row.status];
        return <span className={`${styles.statusPill} ${styles[meta.tone]}`}>{meta.label}</span>;
      },
    },
    { key: 'elapsed', label: 'Tiempo' },
  ];

  return (
    <div className={styles.page}>
      <Nav />
      <main>
      <h1 className={styles.title}>Gestión de Órdenes</h1>

      <div className={styles.cardSector}>
        <DescriptiveMiniCard label="Reparaciones Activas" value={activeRepairs} icon={Wrench} tone="neutral" />
        <DescriptiveMiniCard label="Presupuestos Pendientes" value={pendingBudgets} icon={FileText} tone="success" />
        {/* Sin fuente de datos propia todavía: no hay modelo de stock/inventario en el schema actual */}
        <DescriptiveMiniCard label="Alertas de Stock" value={0} icon={AlertTriangle} tone="danger" />
        <DescriptiveMiniCard label="Ingresos del Día" value={formattedRevenue} icon={Banknote} tone="neutral" />
      </div>

      <div className={styles.orderSection}>
        <div className={styles.searchOrderSection}>
          <SearchBar
            searchPlaceholder="Buscar por ID, cliente, equipo..."
            searchEndpoint="/api/orders/search"
            filters={filters}
            onResults={(results) => setOrders(results as Order[])}
            onClear={fetchOrders}
          />
        </div>

        <div className={styles.dataOrderSection}>
          <div className={styles.tableOrderSection}>
            {loading && <p className={styles.loadingText}>Cargando órdenes...</p>}
            <TableRtl<OrderRow>
              data={rows}
              idField="id_order"
              columns={columns}
              onRowClick={(row) => setSelectedOrder(row.raw)}
              selectedId={selectedOrder?.id_order}
            />
          </div>

          <div className={styles.selectedOrderOption}>
            {selectedOrder && (
              <div className={styles.selectedOrderContent}>
                <OrderDescription order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdateStatus={()=>setShowModalActStatus(true)} />
              </div>
            )}
          </div>
        </div>
      </div>
      </main>
      {showModalActStatus && selectedOrder &&(
        <div>
            <UpdateStatusModal open={showModalActStatus} order={selectedOrder} onClose={()=>setShowModalActStatus(false)} onConfirm={()=>{}}/>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default OrderDirectory;