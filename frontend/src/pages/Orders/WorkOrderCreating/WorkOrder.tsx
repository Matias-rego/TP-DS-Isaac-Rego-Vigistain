import { useState, useEffect } from 'react';
import Nav from "@/pages/Nav/Nav";
import styles from "./WorkOrder.module.css"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import UserIcon from "@/assets/UserIcon.svg";
import EyeIcon from "@/assets/EyeIcon.svg";
import DeviceIcon from "@/assets/DeviceIcon.svg"
import SearchBar from "@/components/SearchBar/SearchBar";
import ClientDetailModal from '@/components/ClientCard/ClientDetailModal';
import ActionButton from '@/components/Buttons/ActionButton';
import ClientRegister from '../../Clientes/ClientRegister';
import DeviceForm, { type DeviceFormValues } from "@/components/DeviceForm/DeviceForm";
import CautionIcon from "@/assets/caution.svg";
import ClipboardCheck from "@/assets/clipboardCheck.svg";
import FallaForm, { type NuevaFalla } from "@/components/Failure/FallaForm/FallaForm";
import VisualProof from "@/components/ImagesAdd/VisualProof";
import { BACKEND_URL } from "@/lib/config";
import { useNavigate } from "react-router-dom";
import FeedbackModal from "@/components/Modals/FeadbackModal/FeadbackModal";
import EquimentDetailModal from "@/components/EquipmentComponent/EquipmentDetailModal/EquipmentDetailModal";
import MonitorIcon from '@/assets/MonitorIcono.svg'
import { type Equipment } from "@/types/types";

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



interface FailureEntry {
  id_failure_type: number;
  description: string;
  failureName: string;
}

const WorkOrder = () => {
  const [results, setResults] = useState<Client[]>([]);
  const [resultsEquipment, setResultsEquipment]= useState<Equipment[]>([]);
  const [showDropdownEquipment, setShowDropdownEquipment] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedEquipmentForModal, setSelectedEquipmentForModal] = useState<Equipment | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipmentRegistered, setEquipmentRegistered] = useState<Equipment | null>(null);
  const [showClientModal, setShowClientModal] = useState(false);
  const [registerClient, setRegisterClient] = useState(false);
  const [orderObservations, setOrderObservations] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [fallas, setFallas] = useState<FailureEntry[]>([]);
  const [equipmentPhotoUrl, setEquipmentPhotoUrl] = useState<string | null>(null);
  const [deviceValues, setDeviceValues] = useState<DeviceFormValues>({
    deviceType: "",
    deviceTypeOther: "",
    brand: "",
    model: "",
    observations: "",
  });

  // Feedback de envío — antes no existía, y sin esto un error de red quedaba
  // solo en la consola sin que el usuario se enterara de que nada se guardó.
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [showEquipmentModal,setShowEquipmentModal] = useState(false)
  const navigate = useNavigate();

  // ── Wizard por pasos: mostramos una seccion a la vez y bloqueamos el avance
  //    en los pasos obligatorios hasta que esten completos. No cambia la logica
  //    de guardado (handleSubmitOrder queda igual), solo la navegacion visual.
  const [step, setStep] = useState(0);
  const [equipoTab, setEquipoTab] = useState<'nuevo' | 'buscar'>('nuevo');
  const [agregando, setAgregando] = useState(true);
  const tipoEquipoElegido =
    deviceValues.deviceType === "otro" ? deviceValues.deviceTypeOther : deviceValues.deviceType;
  const equipoValido =
    selectedEquipment != null ||
    Boolean(tipoEquipoElegido && deviceValues.brand && deviceValues.model);
  const fallasValidas = fallas.length > 0;
  const pasos = [
    { titulo: "Cliente", valido: selectedClient != null, hint: "Elegí o registrá un cliente para continuar." },
    { titulo: "Equipo", valido: equipoValido, hint: "Completá tipo, marca y modelo (o buscá un equipo existente)." },
    { titulo: "Fallas", valido: fallasValidas, hint: "Agregá al menos una falla con su tipo y descripción." },
    { titulo: "Detalles", valido: true, hint: "" },
    { titulo: "Confirmar", valido: true, hint: "" },
  ];
  const puedeAvanzar = pasos[step].valido;
  const avanzar = () => { if (puedeAvanzar && step < pasos.length - 1) setStep(step + 1); };
  const retroceder = () => { if (step > 0) setStep(step - 1); };

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setShowDropdown(false);
  };
  const handleSelectEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setShowDropdownEquipment(false);
  }
  const handleGuardarFalla = (falla: NuevaFalla) => {
    setFallas((prev) => [...prev, falla]);
    setAgregando(false);
  };
  const quitaFalla = (index: number) => {
    setFallas((prev) => prev.filter((_, i) => i !== index));
  };
  const handleSubmitOrder = async () => {
    setSubmitError(null);
    setSubmitSuccess(false);

    const id_cliente = selectedClient?.id_client;

    if (!id_cliente) {
      setSubmitError("Seleccioná un cliente antes de registrar la orden.");
      return;
    }
    let equipmentData;

    if (selectedEquipment == null) {
      const tipoEquipoFinal =
        deviceValues.deviceType !== "otro"
          ? deviceValues.deviceType
          : deviceValues.deviceTypeOther;

      if (!tipoEquipoFinal || !deviceValues.brand || !deviceValues.model) {
        setSubmitError("Completá el tipo, marca y modelo del equipo.");
        return;
      }

      equipmentData = {
        tipo_equipment: tipoEquipoFinal,
        brand: deviceValues.brand,
        model: deviceValues.model,
        observations: deviceValues.observations,
        id_client: selectedClient.id_client,
      };
    } else {

      equipmentData = {
        tipo_equipment: selectedEquipment.tipo_equipment,
        brand: selectedEquipment.brand,
        model: selectedEquipment.model,
        observations: selectedEquipment.observations,
        id_client: selectedEquipment.id_client,
      };
    }
    const fallaIncompleta = fallas.some(
      (f) => f.id_failure_type !== null && f.description.trim() === ""
    );

    if (fallaIncompleta) {
      setSubmitError("Completá la descripción de cada falla que hayas seleccionado.");
      return;
    }
    setSubmitting(true);

    try {
      let id_equipment;
      if(selectedEquipment==null){
        const registE = await fetch(`${BACKEND_URL}/api/equipments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(equipmentData),
          credentials: 'include',
        });

        if (!registE.ok) {
          throw new Error(`Error ${registE.status} al registrar el equipo`);
        }

        const equipment = await registE.json();
        setEquipmentRegistered(equipment);


        id_equipment = equipment.id_equipment;
        if (!id_equipment) {
          throw new Error("El backend no devolvió id_equipment");
        }
    }else{
      setEquipmentRegistered(selectedEquipment)
      id_equipment = selectedEquipment.id_equipment;
      if (!id_equipment) {
        throw new Error("No se registro el equipo correctamente");
      }
    }
      

      const failuresPayload = fallas
        .filter((f) => f.id_failure_type !== null)
        .map(({ id_failure_type, description }) => ({
          id_failure_type,
          failureDescription: description,
          id_equipment,
        }));

      const orderPayload = {
        id_equipment,
        observations: orderObservations || null,
        equipmentPhotoUrl: equipmentPhotoUrl || null,
        estimatedDate: estimatedDeliveryDate
          ? new Date(estimatedDeliveryDate).toISOString()
          : null,
      };

      const requests: Promise<Response>[] = [];

      if (failuresPayload.length > 0) {
        requests.push(
          fetch(`${BACKEND_URL}/api/failures`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(failuresPayload),
            credentials: 'include',
          })
        );
      }

      requests.push(
        fetch(`${BACKEND_URL}/api/orders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
          credentials: 'include',
        })
      );

      const responses = await Promise.all(requests);

      const fallaResponse = responses.find((_, i) => failuresPayload.length > 0 && i === 0);
      if (fallaResponse && !fallaResponse.ok) {
        const errBody = await fallaResponse.json().catch(() => ({}));
        const detalle = Array.isArray(errBody.details) ? errBody.details.join(" ") : "";
        throw new Error(
          errBody.message
            ? `${errBody.message} ${detalle}`.trim()
            : `Error ${fallaResponse.status} al registrar las fallas`
        );
      }

      const orderResponse = responses[responses.length - 1];
      if (!orderResponse.ok) {
        const errBody = await orderResponse.json().catch(() => ({}));
        throw new Error(errBody.message || `Error ${orderResponse.status} al registrar la orden`);
      }

      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error al registrar la orden:", error);
      setSubmitError(
        error instanceof Error ? error.message : "Ocurrió un error al registrar la orden."
      );
    } finally {
      setSubmitting(false);
    }
  };
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
        navigate("/home");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);
  return (
    <div>
      <Nav />
      <div className={styles.mainContent}>
        <h1 className={styles.mainTitle}>Creacion de nueva Orden de Trabajo</h1>
        <p className={styles.mainDescription}>Registre todos los detalles técnicos para la reparación. Los campos marcados con un asterisco son obligatorios para la gestión de la cola de diagnóstico. </p>


        <div className={styles.wizardSteps}>
          {pasos.map((p, i) => (
            <div
              key={p.titulo}
              className={`${styles.wizardStep} ${i === step ? styles.wizardStepActive : ""} ${i < step ? styles.wizardStepDone : ""}`}
            >
              <span className={styles.wizardStepNum}>{i < step ? "✓" : i + 1}</span>
              {p.titulo}
            </div>
          ))}
        </div>

        <div className={styles.orderGrid}>
        {step === 0 && (
        <div className={styles.gridItem}>
          <Card className={styles.customCard} style={{ margin: '0 auto' }}>
            <CardHeader className={styles.cardHeaderFlex}>
              <div className={styles.titleWithIcon}>
                <img src={UserIcon} alt="Icono Usuario" className={styles.cardIconImg} />
                <CardTitle className={styles.cardTitleText}>Seleccion de Cliente *</CardTitle>
              </div>
              <CardDescription className={styles.cardDescriptionText}>
                Busca o Agrega un Cliente a esta Orden*                   
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.searchContainer}>
                <ActionButton label="" onClick={() => setRegisterClient(true)} variant="ghost"  />
                <div className={styles.searchRow}>
                  <SearchBar
                    showFilters={false}
                    searchEndpoint="/api/clients/search"
                    searchPlaceholder="Busca Clientes por nombre, apellido o correo electrónico"
                    onResults={(data) => { setResults(data as Client[]); setShowDropdown(data.length > 0); }}
                    onClear={() => { setResults([]); setShowDropdown(false); }}
                  />
                  
                </div>
                {showDropdown && (
                  <ul className={styles.resultsDropdown}>
                    {results.map((client) => (
                      <li
                        key={client.id_client}
                        className={styles.dropdownItem}
                        onClick={() => handleSelectClient(client)}
                      >
                        <div className={styles.dropdownDist}>
                          <div className={styles.itemContainer}>
                            <span className={styles.itemName}>{client.clientName}</span>
                            <span className={styles.itemEmail}>{client.clientEmail}</span>
                          </div>
                          <div>
                            <button onClick={() => setShowClientModal(true)}>
                              <img src={EyeIcon} alt="IconoOjo" className={styles.eyeIconImg} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {selectedClient && (
                <div className={styles.selectedBadge}>
                  <div className={styles.badgeHeader}>
                    <span className={styles.clientTitle}>{selectedClient.clientName}</span>
                    <span className={styles.idChip}>ID #{selectedClient.id_client}</span>
                  </div>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>DNI / CUIT</span>
                      <span className={styles.value}>{selectedClient.dniCuit}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Email</span>
                      <span className={styles.value}>{selectedClient.clientEmail}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Teléfono</span>
                      <span className={styles.value}>{selectedClient.clientPhone}</span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Categoría</span>
                      <span className={styles.categoryBadge}>
                        {selectedClient.categoryClientName || "Sin categoría"}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>Última reparación</span>
                      <span className={styles.value}>{selectedClient.lastRepair || "---"}</span>
                    </div>
                  </div>
                </div>
              )}
              {showClientModal && selectedClient &&
                <ClientDetailModal
                  client={selectedClient}
                  equipos={[]}
                  open={showClientModal}
                  onClose={() => setShowClientModal(false)}
                />
              }
              {registerClient &&
                <div className={styles.modalOverlay} onClick={() => setRegisterClient(false)}>
                  <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                    <ClientRegister />
                  </div>
                </div>
              }
            </CardContent>
          </Card>
        </div>
        )}

        {/* ── Paso 2: Equipo (nuevo o buscar) ── */}
        {step === 1 && (
        <div className={styles.gridItem}>
          <div className={styles.equipoTabs}>
            <button
              type="button"
              className={`${styles.equipoTab} ${equipoTab === 'nuevo' ? styles.equipoTabActive : ''}`}
              onClick={() => setEquipoTab('nuevo')}
            >
              Equipo nuevo
            </button>
            <button
              type="button"
              className={`${styles.equipoTab} ${equipoTab === 'buscar' ? styles.equipoTabActive : ''}`}
              onClick={() => setEquipoTab('buscar')}
            >
              Buscar existente
            </button>
          </div>

          {equipoTab === 'nuevo' && (
                <Card className={styles.customCard}>
                  <CardHeader>
                    <div className={styles.titleWithIcon}>
                      <img src={DeviceIcon} alt="Icono de equipo" className={styles.cardIconImg} />
                      <CardTitle className={styles.cardTitleText}>Identificacion del Equipo *</CardTitle>
                    </div>
                    <CardDescription className={styles.cardDescriptionText}>
                      Completá los datos para identificar el equipo a arreglar. Si el equipo ya
                      estuvo en otra orden, usá la pestaña "Buscar existente".
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={styles.formContainer}>
                    <div className={styles.formFieldArea}>
                      <DeviceForm values={deviceValues} onChange={setDeviceValues} />
                    </div>
                  </CardContent>
                </Card>
          )}

          {equipoTab === 'buscar' && (
                <Card className={styles.customCard}>
                  <CardHeader>
                    <div className={styles.titleWithIcon}>
                      <img src={DeviceIcon} alt="Icono de equipo" className={styles.cardIconImg} />
                      <CardTitle className={styles.cardTitleText}>Buscar Equipo *</CardTitle>
                    </div>
                    <CardDescription className={styles.cardDescriptionText}>
                      Buscá tu equipo por modelo, marca o tipo. Si nunca tuvo una orden,
                      usá la pestaña "Equipo nuevo" para registrarlo.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={styles.formContainer}>
                    <div className={styles.searchContainer}>
                      <SearchBar
                      showFilters={false}
                      searchEndpoint="/api/equipments/search"
                      searchPlaceholder="Busca Equipos por tipo, marca o modelo"
                      onResults={(data) => {setResultsEquipment(data as Equipment[]); setShowDropdownEquipment(data.length > 0);}}
                      onClear={() => { setResultsEquipment([]); setShowDropdownEquipment(false); }}
                      />
                    {showDropdownEquipment && (
                      <ul className={styles.resultsDropdown}>
                        {resultsEquipment.map((equipment) => (
                          <li
                            key={equipment.id_equipment}
                            className={styles.dropdownItem}
                            onClick={() => handleSelectEquipment(equipment)}
                          >
                            <div className={styles.dropdownDist}>
                              <div className={styles.itemContainer}>
                                <span className={styles.itemName}>Marca: {equipment.brand}</span>
                                <span className={styles.itemEmail}>Modelo: {equipment.model}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedEquipmentForModal(equipment);
                                  setShowEquipmentModal(true);
                                }}
                              >
                                <img src={MonitorIcon} alt="Logo equipo" className={styles.eyeIconImg}/>
                              </button>
                            </div>

                          </li>
                        ))}
                      </ul>
                    )}
                    </div>
                    {selectedEquipment && (
                    <div className={styles.selectedBadge}>
                      <div className={styles.badgeHeader}>
                        <span className={styles.clientTitle}>{selectedEquipment.tipo_equipment.charAt(0).toUpperCase() + selectedEquipment.tipo_equipment.slice(1)}</span>
                        <span className={styles.idChip}>ID #{selectedEquipment.id_equipment}</span>
                      </div>
                      <div className={styles.infoGrid}>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Marca</span>
                          <span className={styles.value}>{selectedEquipment.brand}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Modelo</span>
                          <span className={styles.value}>{selectedEquipment.model}</span>
                        </div>
                        <br />
                        <div className={styles.badgeHeader}>
                          <span className={styles.clientTitle}>Dueño Registrado:</span>
                          <span className={styles.idChip}>ID #{selectedEquipment.client?.id_client}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Nombre: </span>
                          <span className={styles.value}>{selectedEquipment.client?.clientName || "---"}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>DNI/CUIT: </span>
                          <span className={styles.value}>{selectedEquipment.client?.dniCuit || "---"}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Email: </span>
                          <span className={styles.value}>{selectedEquipment.client?.clientEmail || "---"}</span>
                        </div>

                      </div>
                    </div>
                    )}
                  </CardContent>
                </Card>
          )}
        </div>
        )}

        {/* ── Paso 3: Fallas (form con buscador + chips acumulados) ── */}
        {step === 2 && (
        <div className={styles.gridItem}>
          <Card className={styles.customCard} style={{ margin: '0 auto' }}>
            <CardHeader className={styles.cardHeaderFlex}>
              <div className={styles.titleWithIcon}>
                <img src={CautionIcon} alt="Icono de Fallas" className={styles.cardIconImg} />
                <CardTitle className={styles.cardTitleText}>Fallas del equipo *</CardTitle>
              </div>
              <CardDescription className={styles.cardDescriptionText}>
                Agregá cada falla con su tipo y una descripción. Se van acumulando numeradas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {fallas.length > 0 && (
                <div className={styles.fallasChips}>
                  {fallas.map((falla, index) => (
                    <span key={index} className={styles.fallaChip}>
                      <span className={styles.fallaChipNum}>{index + 1}</span>
                      {falla.failureName}
                      <button
                        type="button"
                        className={styles.fallaChipRemove}
                        onClick={() => quitaFalla(index)}
                        aria-label="Quitar falla"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {agregando ? (
                <FallaForm
                  onGuardar={handleGuardarFalla}
                  onCancelar={fallas.length > 0 ? () => setAgregando(false) : undefined}
                />
              ) : (
                <div className={styles.addFallaRow}>
                  <button type="button" className={styles.addFallaBtn} onClick={() => setAgregando(true)}>
                    <span className={styles.addFallaCircle}>+</span>
                    Agregar otra falla
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}

        {/* ── Paso 4: Detalles (opcional) ── */}
        {step === 3 && (
        <>
        {/* ── Prueba visual ── */}
        <div className={styles.gridItem}>
          <VisualProof
            value={equipmentPhotoUrl}
            onChange={(url) => setEquipmentPhotoUrl(url)}
          />
        </div>

        {/* ── Observaciones Generales ── */}
        <div className={styles.gridItem}>
          <Card className={styles.customCard} style={{ margin: '0 auto' }}>
            <CardHeader className={styles.cardHeaderFlex}>
              <div className={styles.titleWithIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#002347" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
                <CardTitle className={styles.cardTitleText}>Observaciones Generales</CardTitle>
              </div>
              <CardDescription className={styles.cardDescriptionText}>
                Ingresá detalles adicionales sobre el estado de recepción, accesorios que deja el cliente o aclaraciones internas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.formFieldArea}>
                <textarea
                  value={orderObservations}
                  onChange={(e) => setOrderObservations(e.target.value)}
                  placeholder="Ej: Deja cargador y funda de regalo. El equipo tiene la pantalla astillada en la esquina superior izquierda..."
                  rows={4}
                  className={styles.customTextarea}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0',
                    fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Fecha Estimada de Entrega ── */}
        <div className={styles.gridItem}>
          <Card className={styles.customCard} style={{ margin: '0 auto' }}>
            <CardHeader className={styles.cardHeaderFlex}>
              <div className={styles.titleWithIcon}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#002347" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <CardTitle className={styles.cardTitleText}>Fecha Estimada de Entrega</CardTitle>
              </div>
              <CardDescription className={styles.cardDescriptionText}>
                Establecé un plazo aproximado para que el cliente sepa cuándo podría estar listo el diagnóstico o la reparación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.formFieldArea} style={{ maxWidth: '300px' }}>
                <input
                  type="date"
                  value={estimatedDeliveryDate}
                  onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                  className={styles.customDateInput}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0',
                    fontSize: '14px', color: '#334155', outline: 'none'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        </>
        )}

        {/* ── Paso 5: Confirmar ── */}
        {step === 4 && (
        <div className={styles.gridItem}>
          <Card className={styles.customCard} style={{ margin: '0 auto' }}>
            <CardHeader className={styles.cardHeaderFlex}>
              <div className={styles.titleWithIcon}>
                <img src={ClipboardCheck} alt="Icono de confirmar" className={styles.cardIconImg} />
                <CardTitle className={styles.cardTitleText}>Revisar y confirmar</CardTitle>
              </div>
              <CardDescription className={styles.cardDescriptionText}>
                Revisá que esté todo bien antes de registrar la orden.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.infoGrid}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Cliente</span>
                  <span className={styles.value}>{selectedClient?.clientName || "---"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Equipo</span>
                  <span className={styles.value}>
                    {selectedEquipment
                      ? `${selectedEquipment.brand} ${selectedEquipment.model}`
                      : `${deviceValues.brand} ${deviceValues.model}`}
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Fallas cargadas</span>
                  <span className={styles.value}>{fallas.filter((f) => f.id_failure_type !== null).length}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>Fecha estimada</span>
                  <span className={styles.value}>{estimatedDeliveryDate || "Sin definir"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        )}
        </div>

        {/* ── Feedback de envío — antes no existía nada visible para el usuario ── */}
        {submitError && (
          <div className={styles.feedbackRow} style={{ marginTop: '20px' }}>
            <div style={{
              background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B',
              borderRadius: '8px', padding: '12px 16px', fontSize: '14px'
            }}>
              {submitError}
            </div>
          </div>
        )}
        {submitSuccess && (
          <div className={styles.feedbackRow} style={{ marginTop: '20px' }}>

            <FeedbackModal
              open={submitSuccess}
              onClose={() => setSubmitSuccess(false)}
              type="success"
              title="Orden registrada con éxito"
              message="La orden ha sido registrada correctamente. Serás redirigido a la página principal en 3 segundos..."
            />
          </div>
        )}

        <div className={styles.wizardNav}>
          {step > 0 ? (
            <button type="button" className={styles.navBtn} onClick={retroceder}>
              Atrás
            </button>
          ) : (
            <span />
          )}
          <span className={styles.wizardHint}>{!puedeAvanzar ? pasos[step].hint : ""}</span>
          {step < pasos.length - 1 ? (
            <button
              type="button"
              className={styles.navBtnPrimary}
              onClick={avanzar}
              disabled={!puedeAvanzar}
            >
              Siguiente
            </button>
          ) : (
            <ActionButton
              label={submitting ? "Registrando..." : "Registrar Orden"}
              icon={<img src={ClipboardCheck} alt="Icono de confirmar orden" className={styles.buttonIcons} />}
              onClick={() => { if (!submitting) handleSubmitOrder(); }}
            />
          )}
        </div>
      </div>
      {showEquipmentModal && selectedEquipmentForModal && (
        <EquimentDetailModal
          open={showEquipmentModal}
          onClose={() => {
            setShowEquipmentModal(false);
            setSelectedEquipmentForModal(null);
          }}
          equipment={selectedEquipmentForModal}
        />
      )}
    </div>

  )
}
export default WorkOrder;