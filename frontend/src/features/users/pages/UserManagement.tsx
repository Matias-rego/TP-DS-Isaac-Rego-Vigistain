import { SelectFilter, type FilterOption } from '@/components/Filters';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { UsersQuery, User } from '../types';
import { usersService } from '../users.service';
import { EntityManagement, type EntityConfig, type FiltersProps } from '@/components/EntityManagement/EntityManagement';
import { EnumRol } from '@/types/types';



const UserFilters = ({ query, updateQuery }: FiltersProps<UsersQuery>) => {
  const options: FilterOption<EnumRol>[] = Object.values(EnumRol).map((value) => ({
    value,
    label: value,
  }));

  return (
    <SelectFilter
      label="Tipo de cliente"
      value={query.ofRol}
      onChange={(v) => updateQuery({ ofRol: v })}
      options={options}
    />
  );
};

const UsersManagement = () => {
  const usersConfig: EntityConfig<User, UsersQuery> = {
    title: 'Usuarios',
    queryKey: ['users'],
    queryFn: usersService.getAll,
    idField: 'id_user',
    columns: [
      { key: 'userName', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'rol', label: 'Rol' },
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
    card: { titleField: 'userName', descriptionField: 'email' },
    searchPlaceholder: 'Buscar por nombre...',
    filterKeys: ['ofRol'],
    initialQuery: { page: 1, limit: 10 },
  };

  return <EntityManagement config={usersConfig} Filters={UserFilters} />;
};

export default UsersManagement;