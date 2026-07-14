import { useRef, useState } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import styles from "./VisualProof.module.css";
import BACKEND_URL from "@/lib/config";

// ─── Props ──────────────────────────────────────────────────────────────

interface VisualProofProps {
  /** URL de la foto ya subida (si estás editando un equipo existente) */
  value: string | null;
  /** Se llama con la URL que devuelve el backend tras subir a Cloudinary, o null si se quita la foto */
  onChange: (url: string | null) => void;
  /** Endpoint del backend que recibe el FormData y sube a Cloudinary. Ajustá según tu ruta real. */
  uploadEndpoint?: string;
  /** Nombre del campo dentro del FormData que espera el backend */
  fieldName?: string;
}

// ─── Componente ─────────────────────────────────────────────────────────

const VisualProof = ({
  value,
  onChange,
  uploadEndpoint = `${BACKEND_URL}/api/equipments/upload-photo`,
  fieldName = "foto",
}: VisualProofProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const displayedImage = localPreview ?? value;

  const uploadFile = async (file: File) => {
    setError(null);

    // Preview local inmediato mientras se sube
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const response = await fetch(uploadEndpoint, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "No se pudo subir la foto");
      }

      // Asumimos que el backend devuelve { url: string } — ajustá si tu endpoint responde distinto
      onChange(result.url);
    } catch (err) {
      console.error("Error al subir foto:", err);
      setError("No se pudo subir la foto. Probá de nuevo.");
      setLocalPreview(null);
      onChange(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadFile(file);
    e.target.value = ""; // permite volver a elegir el mismo archivo si se saca y se vuelve a poner
  };

  const handleRemove = () => {
    setLocalPreview(null);
    setError(null);
    onChange(null);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>Prueba visual</h3>
          <p className={styles.subtitle}>
            Subí o tomá una foto del estado actual y cualquier daño visible.
          </p>
        </div>
        <Camera size={22} className={styles.headerIcon} />
      </div>

      <div className={styles.dropzone}>
        {displayedImage ? (
          <div className={styles.previewWrap}>
            <img src={displayedImage} alt="Foto del equipo" className={styles.previewImg} />
            {uploading && (
              <div className={styles.uploadingOverlay}>
                <Loader2 size={22} className={styles.spinner} />
              </div>
            )}
            {!uploading && (
              <button
                type="button"
                className={styles.removeBtn}
                onClick={handleRemove}
                aria-label="Quitar foto"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <Camera size={28} />
            <span>Ninguna foto seleccionada</span>
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.buttonsRow}>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          Elegir archivo
        </button>
        <button
          type="button"
          className={styles.actionBtn}
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
        >
          Tomar foto
        </button>
      </div>

      {/* Input normal: abre selector de archivos / galería */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />

      {/* Input con capture: en mobile abre la cámara directamente */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={styles.hiddenInput}
        onChange={handleFileChange}
      />
    </div>
  );
};

export default VisualProof;