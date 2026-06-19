import AltaForm from './../CRUDS/Alta/AltaForm';
import type { FieldConfig } from './../CRUDS/Alta/AltaForm';

// Ajustá los campos que necesites para tu entidad Client
const FIELDS: FieldConfig[] = [
  {
    name: 'clientName',
    label: 'Nombre / Razón Social',
    type: 'text',
    placeholder: 'Ej: Juan Pérez o Mi Empresa S.A.',
    required: true,
    minLength: 2,
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'Ej: cliente@email.com',
    required: true,
  },
  {
    name: 'phone',
    label: 'Teléfono',
    type: 'tel',
    placeholder: 'Ej: +54 341 4000000',
    required: false,
  },
  {
    name: 'taxId',
    label: 'CUIT / DNI',
    type: 'text',
    placeholder: 'Ej: 20-12345678-9',
    required: false,
    minLength: 7,
    maxLength: 13,
  },
  {
    name: 'address',
    label: 'Dirección',
    type: 'text',
    placeholder: 'Ej: Av. Pellegrini 1234, Rosario',
    required: false,
  },
];

const ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

interface AltaClienteProps {
  onSuccess?: () => void;
}

export default function AltaCliente({ onSuccess }: AltaClienteProps) {
  return (
    <AltaForm
      title="Nuevo Cliente"
      subtitle="Completá los datos para registrar el cliente"
      icon={ICON}
      fields={FIELDS}
      endpoint="/clients/createClient"
      submitLabel="Crear Cliente"
      successMessage="Cliente creado correctamente."
      onSuccess={onSuccess}
    />
  );
}