import { useState, useEffect, useMemo, useCallback } from 'react';
import SearchBar from '../../components/SearchBar/SearchBar';
import type { FilterConfig } from '../../components/SearchBar/SearchBar';
import ClientGrid from '@/components/ClientCard/ClientGrid/ClientGrid';
import ActionButton from '../../components/Common/Buttons/ActionButton';
import Nav from '../Nav/Nav';
import Footer from '../../components/Footer/Footer';
import styles from './Clients.module.css';
import ClientRegister from './ClientRegister';
import { eventBus, EVENTS } from '@/lib/eventBus';
import ClientDetailModal from "@/components/ClientCard/ClientDetailModal/ClientDetailModal";
import { BACKEND_URL } from '@/lib/config';
import type { PaginatedResponse } from '@/types/types';
import type { Client } from '@/types/types';

interface categoryClient {
  clientTypeName: string;
}

const Clientes = () => {
  // null = no hay búsqueda activa (mostrar el listado completo)
  const [results, setResults] = useState<PaginatedResponse<Client> | null>(null);
  const [clients, setAllClients] = useState<PaginatedResponse<Client> | null>(null);
  const [registerClient, setRegisterClient] = useState(false);
  const [categories, setCategories] = useState<PaginatedResponse<categoryClient> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [client, setOneClient] = useState<Client | null>(null);
  const [open, setOpen] = useState(false);

  // ─── Fetches ───────────────────────────────────────────────────────────────

  const getAllClients = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/clients/`, { credentials: 'include' });
      const data: PaginatedResponse<Client> = await res.json();
      setAllClients(data);
    } catch (e) {
      console.error('Error al obtener clientes:', e);
      setError('No se pudieron cargar los clientes. Intentá de nuevo.');
    }
  }, []);

  const findCategoryClients = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/client-types/`, { credentials: 'include' });
      const data: PaginatedResponse<categoryClient> = await res.json();
      setCategories(data);
    } catch (e) {
      console.error('Error fetching category clients:', e);
    }
  }, []);

  const fetchOneClient = useCallback(async (id: string): Promise<Client | null> => {
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

  const openModal = async (id: string) => {
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
      options: (categories?.data ?? []).map((c) => ({
        value: c.clientTypeName,
        label: c.clientTypeName,
      })),
    },
  ], [categories]);

  // Lista efectiva a mostrar: si hay una búsqueda activa (results !== null),
  // se muestra su resultado (aunque sea vacío); si no, el listado completo.
  const displayedClients = results !== null ? results.data : (clients?.data ?? []);
  const isSearchActive = results !== null;

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
          <SearchBar<Client>
            showFilters={true}
            filters={CLIENT_FILTERS}
            searchEndpoint="/api/clients"
            searchPlaceholder="Buscar clientes por nombre, apellido o correo electrónico"
            onResults={(data) => setResults(data)}
            onClear={() => setResults(null)}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {/* Modal */}
        {client && open && (
          <ClientDetailModal
            client={client}
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
            {isSearchActive && displayedClients.length === 0 ? (
              <p className={styles.emptyText}>
                No se encontraron clientes que coincidan con tu búsqueda.
              </p>
            ) : (
              <ClientGrid
                clients={displayedClients}
                columns={registerClient ? 2 : 4}
                onAddClick={() => setRegisterClient(true)}
                onCardClick={(id: string) => openModal(id)}
              />
            )}
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Clientes;