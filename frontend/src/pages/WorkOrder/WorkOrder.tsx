import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
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
import ClientRegister from '../Clientes/ClientRegister';
import DeviceForm, { type DeviceFormValues } from "@/components/DeviceForm/DeviceForm";
import CautionIcon from "@/assets/caution.svg";
import PlusCircle from "@/assets/pluscircle.svg";
import ClipboardCheck from "@/assets/clipboardCheck.svg";
import FailureDescription from "@/components/FailureDescription/FailureDescription";
import VisualProof from "@/components/ImagesAdd/VisualProof";
import { BACKEND_URL } from "@/lib/config";


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

interface Equipment {
  id_equipment?: number,
  tipo_equipment: string,
  brand: string,
  model: string,
  observations: string,
  id_client: number,
}

interface FailureEntry {
  id_failure_type: number | null;
  description: string;
}

const WorkOrder = () => {
  const [results, setResults] = useState<Client[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [equipmentRegistered, setEquipmentRegistered] = useState<Equipment | null>(null);

  const [showClientModal, setShowClientModal] = useState(false);
  const [registerClient, setRegisterClient] = useState(false);
  const [orderObservations, setOrderObservations] = useState("");
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState("");
  const [fallas, setFallas] = useState<FailureEntry[]>([
    { id_failure_type: null, description: "" },
  ]);
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

  // `cantFallas` derivado directo del array, ya no es un state separado.
  // Antes quedaba pegado en 1 para siempre porque nada lo actualizaba.
  const cantFallas = fallas.length;

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setShowDropdown(false);
  };

  // ── Dos sliders independientes — antes compartían el mismo ref y el segundo
  // pisaba al primero, rompiendo los botones prev/next de "Identificación del Equipo".
  const [equipmentSliderRef, equipmentSliderInstance] = useKeenSlider<HTMLDivElement>({
    loop: false,
    slides: { perView: 1, spacing: 15 },
  });

  const [fallasSliderRef, fallasSliderInstance] = useKeenSlider<HTMLDivElement>({
    loop: false,
    slides: { perView: 1, spacing: 15 },
  });

  const agregaFalla = () => {
    setFallas((prev) => [...prev, { id_failure_type: null, description: "" }]);
  };

  const quitaFalla = (index: number) => {
    if (fallas.length <= 1) return; // nunca dejar el carrusel sin slides
    setFallas((prev) => prev.filter((_, i) => i !== index));
  };

  const actualizaFalla = (index: number, patch: Partial<FailureEntry>) => {
    setFallas((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const handleSubmitOrder = async () => {
    setSubmitError(null);
    setSubmitSuccess(false);

    const id_cliente = selectedClient?.id_client;

    if (!id_cliente) {
      setSubmitError("Seleccioná un cliente antes de registrar la orden.");
      return;
    }

    const tipoEquipoFinal = deviceValues.deviceType !== 'otro' ? deviceValues.deviceType : deviceValues.deviceTypeOther;

    if (!tipoEquipoFinal || !deviceValues.brand || !deviceValues.model) {
      setSubmitError("Completá el tipo, marca y modelo del equipo.");
      return;
    }

    const equipmentData = {
      tipo_equipment: tipoEquipoFinal,
      brand: deviceValues.brand,
      model: deviceValues.model,
      observations: deviceValues.observations,
      id_client: id_cliente,
    };

    setSubmitting(true);

    try {
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

      const id_equipment = equipment.id_equipment;
      if (!id_equipment) {
        throw new Error("El backend no devolvió id_equipment");
      }

      const failuresPayload = fallas
        .filter((f) => f.id_failure_type !== null)
        .map(({ id_failure_type, description }) => ({
          id_failure_type,
          failureDescription:description,
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
        throw new Error(`Error ${fallaResponse.status} al registrar las fallas`);
      }

      const orderResponse = responses[responses.length - 1];
      if (!orderResponse.ok) {
        throw new Error(`Error ${orderResponse.status} al registrar la orden`);
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

  // Recalcula el slider de fallas cada vez que se agrega/quita una
  useEffect(() => {
    if (fallasSliderInstance.current) {
      fallasSliderInstance.current.update();
    }
  }, [fallas.length, fallasSliderInstance]);

  return (
    <div>
      <Nav />
      <div className={styles.mainContent}>
        <h1 className={styles.mainTitle}>Creacion de nueva Orden de Trabajo</h1>
        <p className={styles.mainDescription}>Registre todos los detalles técnicos para la reparación. Los campos marcados con un asterisco son obligatorios para la gestión de la cola de diagnóstico. </p>


        <div style={{ maxWidth: '100%', margin: '30px 5px auto 5px', padding: '0 25px', position: 'relative' }}>
          <Card className={styles.customCard}>
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
                <div className={styles.searchRow}>
                  <SearchBar
                    showFilters={false}
                    searchEndpoint="/api/clients/search"
                    searchPlaceholder="Busca Clientes por nombre, apellido o correo electrónico"
                    onResults={(data) => { setResults(data as Client[]); setShowDropdown(data.length > 0); }}
                    onClear={() => { setResults([]); setShowDropdown(false); }}
                  />
                  <ActionButton label="" onClick={() => setRegisterClient(true)} />
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
                  Cliente seleccionado: <strong>{selectedClient.clientName}</strong>
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

        {/* ── Identificación del Equipo / Buscar Equipo (slider propio) ── */}
        <div style={{ maxWidth: '100%', margin: '30px 5px auto 5px', padding: '0 25px', position: 'relative' }}>
          <button
            onClick={() => equipmentSliderInstance.current?.prev()}
            className={styles.prevButton}
            style={{
              position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#002347',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
              transition: 'transform 0.2s ease, color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FBAA29'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#002347'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <div ref={equipmentSliderRef} className="keen-slider">
            <div className="keen-slider__slide">
              <Card className={styles.customCard}>
                <CardHeader>
                  <div className={styles.titleWithIcon}>
                    <img src={DeviceIcon} alt="Icono de equipo" className={styles.cardIconImg} />
                    <CardTitle className={styles.cardTitleText}>Identificacion del Equipo *</CardTitle>
                  </div>
                  <CardDescription className={styles.cardDescriptionText}>
                    Completa los datos para identificar el equipo a arreglar, en caso de que el
                    equipo ya haya pertenecido a otra orden deslice la tarjeta para buscarlo.
                  </CardDescription>
                </CardHeader>
                <CardContent className={styles.formContainer}>
                  <div className={styles.formFieldArea}>
                    <DeviceForm values={deviceValues} onChange={setDeviceValues} />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="keen-slider__slide">
              <Card className={styles.customCard}>
                <CardHeader>
                  <div className={styles.titleWithIcon}>
                    <img src={DeviceIcon} alt="Icono de equipo" className={styles.cardIconImg} />
                    <CardTitle className={styles.cardTitleText}>Bucar Equipo *</CardTitle>
                  </div>
                  <CardDescription className={styles.cardDescriptionText}>
                    Busca tu equipo a traves del modelo, la marca o el tipo. En caso de no tener una orden previa
                    ingrese los datos del equipo en la tarjeta anterior para registrarlo.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>

          <button
            onClick={() => equipmentSliderInstance.current?.next()}
            className={styles.nextButton}
            style={{
              position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#002347',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
              transition: 'transform 0.2s ease, color 0.2s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#FBAA29'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#002347'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* ── Identificación de Fallas (slider propio) ── */}
        <div style={{ maxWidth: '100%', margin: '30px 5px auto 5px', padding: '0 25px', position: 'relative' }}>
          {cantFallas > 1 &&
            <button
              onClick={() => fallasSliderInstance.current?.prev()}
              className={styles.prevButton}
              style={{
                position: 'absolute', left: '-12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#002347',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
                transition: 'transform 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FBAA29'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#002347'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
          }

          <div ref={fallasSliderRef} className="keen-slider">
            {fallas.map((falla, index) => (
              <div key={index} className="keen-slider__slide">
                <Card className={styles.customCard}>
                  <CardHeader>
                    <div className={styles.titleWithIcon}>
                      <img src={CautionIcon} alt="Icono de Fallas" className={styles.cardIconImg} />
                      <CardTitle className={styles.cardTitleText}>
                        Identificación de Fallas {cantFallas > 1 ? `#${index + 1}` : ""} *
                      </CardTitle>
                      {cantFallas > 1 && (
                        <button type="button" onClick={() => quitaFalla(index)} className={styles.removeSlideBtn}>
                          ✕
                        </button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className={styles.formContainer}>
                    <div className={styles.formFielArea}>
                      <FailureDescription
                        description={falla.description}
                        onChangeDescription={(val) => actualizaFalla(index, { description: val })}
                        selectedFailureType={falla.id_failure_type}
                        onChangeSelectedFailureType={(id) => actualizaFalla(index, { id_failure_type: id })}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {cantFallas > 1 &&
            <button
              onClick={() => fallasSliderInstance.current?.next()}
              className={styles.nextButton}
              style={{
                position: 'absolute', right: '-12px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#002347',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10,
                transition: 'transform 0.2s ease, color 0.2s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#FBAA29'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#002347'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          }

          <ActionButton
            variant="ghost"
            label="Agregar una falla"
            icon={<img src={PlusCircle} alt="Circulo de agregar otra falla" className={styles.buttonIcons} />}
            onClick={() => agregaFalla()}
          />
        </div>

        {/* ── Foto, Observaciones, Fecha estimada ── */}
        <div style={{ maxWidth: '100%', margin: '30px 5px auto 5px', padding: '0 25px', position: 'relative' }}>
          <VisualProof
            value={equipmentPhotoUrl}
            onChange={(url) => setEquipmentPhotoUrl(url)}
          />
          <Card className={styles.customCard} style={{ marginTop: '30px' }}>
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

          <Card className={styles.customCard} style={{ marginTop: '30px' }}>
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

        {/* ── Feedback de envío — antes no existía nada visible para el usuario ── */}
        {submitError && (
          <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 25px' }}>
            <div style={{
              background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B',
              borderRadius: '8px', padding: '12px 16px', fontSize: '14px'
            }}>
              {submitError}
            </div>
          </div>
        )}
        {submitSuccess && (
          <div style={{ maxWidth: '100%', margin: '0 auto', padding: '0 25px' }}>
            <div style={{
              background: '#F0FDF4', border: '1px solid #86EFAC', color: '#166534',
              borderRadius: '8px', padding: '12px 16px', fontSize: '14px'
            }}>
              Orden registrada con éxito.
            </div>
          </div>
        )}

        <div style={{ maxWidth: '100%', margin: '17px auto', padding: '0 25px', position: 'relative', display: 'flex', justifyContent: "center" }}>
          <ActionButton
            label={submitting ? "Registrando..." : "Registrar Orden"}
            icon={<img src={ClipboardCheck} alt="Icono de confirmar orden" className={styles.buttonIcons} />}
            onClick={() => { if (!submitting) handleSubmitOrder(); }}
          />
        </div>
      </div>
    </div>
  )
}
export default WorkOrder;