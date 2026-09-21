import BACKEND_URL from "@/lib/config";
import type { Order } from "@/types/types";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Nav from "@/pages/Nav/Nav";
import OrderDetailNav from "@/components/OrderComponent/OrderDetailNav/OrderDetailNav";
import StatusPipeline from "@/components/Status/StatusPipeline/StatusPipeline";
import Footer from "@/components/Footer/Footer";
import ClientDetailCard from "@/components/ClientCard/ClientDetailCard/ClientDetailCard";
import EquipmentDetailCard from "@/components/EquipmentComponent/EquipmentDetailCard/EquipmentDetailCard";
import DetailBudget from "@/components/BudgetComponent/DetailBudget/DetailBudget";
import styles from "./ManageOrder.module.css";


const ManageOrder = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const { id_order } = useParams<{ id_order: string }>();

  useEffect(() => {
    if (!id_order) return;

    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `${BACKEND_URL}/api/orders/${id_order}`,
          {
            credentials: "include",
            method: "GET",
          }
        );

        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }

        const data: Order = await response.json();
        setOrder(data);
      } catch (e) {
        console.error("Error al obtener la orden", e);
      }
    };

    fetchOrder();
  }, [id_order]);

  return (
    <div className={styles.page}>
      <Nav />

      {order && order.equipment && order.equipment.client && order.budget && (
        <main className={styles.main}>

          <section className={styles.orderHeader}>
            <OrderDetailNav order={order} />
          </section>

          <section className={styles.pipelineSection}>
            <StatusPipeline order={order} />
          </section>

          <section className={styles.contentGrid}>

            <div className={styles.detailsColumn}>
              <ClientDetailCard client={order.equipment.client} />

              <EquipmentDetailCard equipment={order.equipment} />
            </div>

            <div className={styles.budgetColumn}>
              <DetailBudget budget={order.budget} />
            </div>

          </section>

        </main>
      )}

      <Footer />
    </div>
  );
};

export default ManageOrder;