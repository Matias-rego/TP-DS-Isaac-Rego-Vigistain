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

const ClientsPage = () => {
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
      // sin selection: siempre habilitado, ignora el argumento
      { label: 'Crear', icon: Plus, variant: 'primary', onClick: () => console.log('crear')},

      // selection: 1 → recibe un arreglo con un solo cliente
      { label: 'Modificar', icon: Pencil, selection: 1, onClick: ([cliente]) => console.log('editar', cliente) },

      // selection: 'multiple' → recibe todos los marcados
      { label: 'Eliminar', icon: Trash2, variant: 'danger', selection: 'multiple', onClick: (clientes) => console.log('editar', clientes) },
    ],
    onItemClick: (item) => console.log('onItemClick', item),
    card: { titleField: 'clientName', descriptionField: 'clientEmail' },
    searchPlaceholder: 'Buscar por nombre...',
    filterKeys: ['id_client_type', 'dateFrom', 'dateTo'],
    initialQuery: { page: 1, limit: 10 },
  };

  return <EntityManagement config={clientsConfig} Filters={ClientFilters} />;
};



export default ClientsPage;