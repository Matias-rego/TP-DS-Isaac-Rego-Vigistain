import { useState, useEffect, useMemo, useCallback } from 'react';
import SearchBar from '../../components/SearchBar/SearchBar';
import type { FilterConfig } from '../../components/SearchBar/SearchBar';
import ClientGrid from '../../components/ClientCard/ClientGrid';
import ActionButton from '../../components/Buttons/ActionButton';
import Nav from '../Nav/Nav';
import Footer from '../../components/Footer/Footer';
import styles from './Clients.module.css';
import ClientRegister from './ClientRegister';
import { eventBus, EVENTS } from '@/lib/eventBus';
import ClientDetailModal from "@/components/ClientCard/ClientDetailModal";
import { BACKEND_URL } from '@/lib/config';

interface Client {
  id_client: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  dniCuit: string;
  dateOfRegistration: string;
  categoryClientName?: string;
  lastRepair?: string;
  tags?: string[];
  onClick?: (id: number) => void;
}

interface categoryClient {
  categoryClientName: string;
}

const Clientes = () => {
  const [results, setResults] = useState<Client[]>([]);
  const [clients, setAllClients] = useState<Client[]>([]);
  const [registerClient, setRegisterClient] = useState(false);
  const [categories, setCategories] = useState<categoryClient[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [client, setOneClient] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);

  // ─── Fetches ───────────────────────────────────────────────────────────────

  const getAllClients = useCallback(async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/clients/`,
        { credentials: 'include' }
      );
      setAllClients(await res.json());
    } catch (e) {
      console.error('Error al obtener clientes:', e);
      setError('No se pudieron cargar los clientes. Intentá de nuevo.');
    }
  }, []);

  const findCategoryClients = useCallback(async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/client-types/`,
        { credentials: 'include' }
      );
      setCategories(await res.json());
    } catch (e) {
      console.error('Error fetching category clients:', e);
    }
  }, []);

  const fetchOneClient = useCallback(async (id: number): Promise<Client | null> => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/clients/${id}`,
        { credentials: 'include' }
      );
      return await res.json();
    } catch (e) {
      console.error('Error en getOneClient:', e);
      return null;
    }
  }, []);

  // ─── Efectos ───────────────────────────────────────────────────────────────

  useEffect(() => { findCategoryClients(); }, [findCategoryClients]);
  useEffect(() => { getAllClients(); }, [getAllClients]);

  // Suscripción única — refresca lista y modal si está abierto
  useEffect(() => {
    const unsubscribe = eventBus.on(EVENTS.clientChanged, async () => {
      await getAllClients();
      if (open && client) {
        const updated = await fetchOneClient(client.id_client);
        if (updated) setOneClient(updated);
      }
    });
    return unsubscribe;
  }, [getAllClients, fetchOneClient, open, client]);

  // ─── Acciones ──────────────────────────────────────────────────────────────

  const openModal = async (id: number) => {
    const data = await fetchOneClient(id);
    if (data) {
      setOneClient(data);
      setOpen(true);
    }
  };

  const closeModal = () => {
    setOpen(false);
    setOneClient(null);
  };

  // ─── Filtros ───────────────────────────────────────────────────────────────

  const CLIENT_FILTERS: FilterConfig[] = useMemo(() => [
    {
      key: 'fecha',
      label: 'Fecha de última reparación',
      type: 'date',
      placeholder: 'Cualquier fecha',
    },
    {
      key: 'categoryClient',
      label: 'Tipo de cliente',
      type: 'select',
      placeholder: 'Todos los tipos',
      options: categories.map((c) => ({
        value: c.categoryClientName,
        label: c.categoryClientName,
      })),
    },
  ], [categories]);

  return (
    <div className={styles.page}>
      <Nav />
      <div className={styles.content}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerText}>
            <div>
              <h1 className={styles.title}>Directorio de Clientes</h1>
              <p className={styles.subtitle}>
                Administre la base de datos de sus clientes y realice un seguimiento del historial de servicios.
              </p>
            </div>
            <div className={styles.addButtonContainer}>
              <ActionButton label="Agregar Cliente" onClick={() => setRegisterClient(true)} />
            </div>
          </div>
        </div>

        {/* SearchBar */}
        <div className={styles.searchRow}>
          <SearchBar
            showFilters={true}
            filters={CLIENT_FILTERS}
            searchEndpoint="/api/clients/search/"
            searchPlaceholder="Buscar clientes por nombre, apellido o correo electrónico"
            onResults={(data) => setResults(data as Client[])}
            onClear={() => setResults([])}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Modal */}
        {client && open && (
          <ClientDetailModal
            client={client}
            equipos={[]}
            open={open}
            onClose={closeModal}
            entityEvent={EVENTS.clientChanged}
          />
        )}

        {/* Cancelar registro */}
        {registerClient && (
          <ActionButton
            label="Cancelar Registro"
            variant="ghost"
            icon={null}
            onClick={() => setRegisterClient(false)}
          />
        )}

        {/* Grid + formulario */}
        <div
          className={styles.mainContent}
          style={registerClient ? {} : { display: 'block' }}
        >
          {registerClient && (
            <div style={{ width: '100%' }}>
              <ClientRegister />
            </div>
          )}
          <div className={styles.gridSection}>
            <ClientGrid
              clients={results.length > 0 ? results : clients}
              columns={registerClient ? 2 : 4}
              onAddClick={() => setRegisterClient(true)}
              onCardClick={(id: number) => openModal(id)}
            />
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Clientes;