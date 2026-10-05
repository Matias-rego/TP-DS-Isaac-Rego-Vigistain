import { DateFilter, SelectFilter } from '@/components/Filters';
import { useClientTypeOptions } from '@/features/clientTypes/useClientTypeOptions';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ClientsQuery } from '../../clients/types';
import { clientsService } from '../../clients/clients.service';
import type { Client } from '../../clients/types';
import { EntityManagement, type EntityConfig, type FiltersProps } from '@/components/EntityManagement/EntityManagement';

const ClientFilters = ({ query, updateQuery }: FiltersProps<ClientsQuery>) => {
  const { options } = useClientTypeOptions();

  return (
    <>
      <SelectFilter
        label="Tipo de cliente"
        value={query.id_client_type}
        onChange={(v) => updateQuery({ id_client_type: v })}
        options={options}
      />
      <DateFilter
        label="Registrado desde"
        value={query.dateFrom}
        onChange={(v) => updateQuery({ dateFrom: v })}
      />
      <DateFilter
        label="Registrado hasta"
        value={query.dateTo}
        onChange={(v) => updateQuery({ dateTo: v })}
      />
    </>
  );
};

const ClientsManagement = () => {
  const clientsConfig: EntityConfig<Client, ClientsQuery> = {
    title: 'Clientes',
    queryKey: ['clients'],
    queryFn: clientsService.getAll,
    idField: 'id_client',
    columns: [
      { key: 'clientName', label: 'Nombre' },
      { key: 'clientEmail', label: 'Email' },
      { key: 'clientPhone', label: 'Teléfono' },
      { key: 'cuit', label: 'CUIT' },
      { key: 'status', label: 'Estado', render: (c) => (c.status === false ? 'Baja' : 'Activo') },
    ],
    actions: [
      { label: 'Crear', icon: Plus, variant: 'primary', onClick: () => console.log('crear') },
      {
        label: 'Modificar',
        icon: Pencil,
        requiresSelection: true,
        onClick: (c) => console.log('modificar', c),
      },
      {
        label: 'Eliminar',
        icon: Trash2,
        variant: 'danger',
        requiresSelection: true,
        disabled: (c) => c.status === false,   
        onClick: (c) => console.log('eliminar', c),
      },
    ],
    card: { titleField: 'clientName', descriptionField: 'clientEmail' },
    searchPlaceholder: 'Buscar por nombre...',
    filterKeys: ['id_client_type', 'dateFrom', 'dateTo'],
    initialQuery: { page: 1, limit: 10 },
  };

  return <EntityManagement config={clientsConfig} Filters={ClientFilters} />;
};

export default ClientsManagement;