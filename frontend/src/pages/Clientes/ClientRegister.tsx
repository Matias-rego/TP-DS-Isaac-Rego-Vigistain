import { eventBus, EVENTS } from "@/lib/eventBus";
import AltaForm from "../CRUDS/Alta/AltaForm";
import type { FieldConfig } from "../CRUDS/Alta/AltaForm";

const FIELDS: FieldConfig[] = [
  {
    name: "clientName",
    label: "Nombre Completo",
    type: "text",
    placeholder: "Ej: Juan Perez",
    required: true,
    minLength: 4,
    maxLength: 80,
  },
  {
    name: "clientEmail",
    label: "Email",
    type: "email",
    placeholder: "juanPerez@gmail.com",
    required:true,
    minLength:7
  },
  {
    name: "clientPhone",
    label: "Telefono",
    type: "tel",
    placeholder: "(codArea)-xxx-yyyy",
    required:false,
    minLength: 7,
  },
  {
    name: "dniCuit",
    label: "DNI / CUIT",
    type: "text",
    placeholder:"Ingrese su DNI o CUIT ej: 12345678",
    required:true,
    minLength: 6,
  },
];
const ICON = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
interface ClientRegisterProps {
  onSuccess?: () => void;
}


const ClientRegister = ({onSuccess}:ClientRegisterProps) => {
  return (
    <div>   
        <AltaForm
        title="Alta de Cliente"
        subtitle="Completa con los datos del cliente para registrarlo"
        icon={ICON}
        fields={FIELDS}
        endpoint="/clients/createNewClient"
        onSuccess={onSuccess}
        submitLabel="Registrar nuevo cliente"
        compact
        entityEvent={EVENTS.clientChanged}
        />
    </div>
  );
};
export default ClientRegister;