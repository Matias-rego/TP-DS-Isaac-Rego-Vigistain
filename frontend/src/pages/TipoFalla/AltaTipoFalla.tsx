import { useState } from 'react';
import styles from './TipoFalla.module.css';

interface FormData {
  failureDescription: string;
  estimatedImport: string;
}

interface FormErrors {
  failureDescription?: string;
  estimatedImport?: string;
  general?: string;
}

interface AltaTipoFallaProps {
  onSuccess?: () => void;
}

function parseJwt(token: string) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

export default function AltaTipoFalla({ onSuccess }: AltaTipoFallaProps) {
  const [formData, setFormData] = useState<FormData>({
    failureDescription: '',
    estimatedImport: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.failureDescription.trim()) {
      newErrors.failureDescription = 'La descripción es obligatoria.';
    } else if (formData.failureDescription.trim().length < 3) {
      newErrors.failureDescription = 'Debe tener al menos 3 caracteres.';
    }

    if (!formData.estimatedImport) {
      newErrors.estimatedImport = 'El importe estimado es obligatorio.';
    } else if (isNaN(Number(formData.estimatedImport)) || Number(formData.estimatedImport) < 0) {
      newErrors.estimatedImport = 'Debe ser un número positivo.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar error del campo al escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No hay token de sesión.');

      const decoded = parseJwt(token);
      if (!decoded?.id_user) throw new Error('Token inválido.');

      const response = await fetch(
        `http://${import.meta.env.VITE_BACKEND_HOST}:${import.meta.env.VITE_BACKEND_PORT}/failures/createTypeFail`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            failureDescription: formData.failureDescription.trim(),
            estimatedImport: parseFloat(formData.estimatedImport),
          }),
        }
      );

      if (response.status === 409) {
        setErrors({ failureDescription: 'Ya existe un tipo de falla con esa descripción.' });
        return;
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || `Error del servidor: ${response.status}`);
      }

      setSuccess(true);
      setFormData({ failureDescription: '', estimatedImport: '' });
      onSuccess?.();

      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      setErrors({ general: e instanceof Error ? e.message : 'Error desconocido.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>

        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div>
            <h2 className={styles.title}>Nuevo Tipo de Falla</h2>
            <p className={styles.subtitle}>Completá los datos para registrar el tipo</p>
          </div>
        </div>

        {errors.general && (
          <div className={styles.alertError}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            {errors.general}
          </div>
        )}

        {success && (
          <div className={styles.alertSuccess}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Tipo de falla creado correctamente.
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className={styles.form}>

          <div className={`${styles.field} ${errors.failureDescription ? styles.fieldError : ''}`}>
            <label className={styles.label} htmlFor="failureDescription">
              Descripción
              <span className={styles.required}>*</span>
            </label>
            <input
              id="failureDescription"
              name="failureDescription"
              type="text"
              className={styles.input}
              placeholder="Ej: Pantalla rota, batería defectuosa..."
              value={formData.failureDescription}
              onChange={handleChange}
              disabled={loading}
              autoComplete="off"
            />
            {errors.failureDescription && (
              <span className={styles.errorMsg}>{errors.failureDescription}</span>
            )}
          </div>

          <div className={`${styles.field} ${errors.estimatedImport ? styles.fieldError : ''}`}>
            <label className={styles.label} htmlFor="estimatedImport">
              Importe Estimado
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.prefix}>$</span>
              <input
                id="estimatedImport"
                name="estimatedImport"
                type="number"
                min="0"
                step="0.01"
                className={`${styles.input} ${styles.inputWithPrefix}`}
                placeholder="0.00"
                value={formData.estimatedImport}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            {errors.estimatedImport && (
              <span className={styles.errorMsg}>{errors.estimatedImport}</span>
            )}
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} />
                Guardando...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Crear Tipo de Falla
              </>
            )}
          </button>

        </form>
      </div>
    </div>
  );
}