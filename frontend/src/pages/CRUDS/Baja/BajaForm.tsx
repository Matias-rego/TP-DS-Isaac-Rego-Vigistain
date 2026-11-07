import { useEffect, useState } from 'react';
import useDebounce from '@/hooks/useDebounce';
import { eventBus } from '@/lib/eventBus';
import { api, ApiError, notifyIfNeeded } from '@/api/client';
import styles from './BajaForm.module.css';
import type { PaginatedResponse } from "@/types/types";

// ─── Field config para el detalle ────────────────────────────────────────────

export interface DetailFieldConfig {
  name: string;
  label: string;
  format?: (value: unknown) => string;
}

// ─── Props ───────────────────────────────────────────────────────────────────

export interface BajaFormProps<T extends object> {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  searchPlaceholder: string;
  searchEndpoint: string;
  deleteEndpoint: string;
  idField: keyof T;
  previewField?: keyof T;
  previewFormat?: (item: T) => string;
  detailFields: DetailFieldConfig[];
  requiresAuth?: boolean; // se mantiene por compatibilidad: api() siempre envía la cookie
  entityEvent?: string;
  successMessage?: string;
  onSuccess?: () => void;
  debounceMs?: number;
}

function formatValue(value: unknown): string {
  if (typeof value === 'number') {
    return value.toLocaleString('es-AR');
  }
  return String(value ?? '');
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function BajaForm<T extends object>({
  title,
  subtitle,
  icon,
  searchPlaceholder,
  searchEndpoint,
  deleteEndpoint,
  idField,
  previewField,
  previewFormat,
  detailFields,
  entityEvent,
  successMessage = 'Eliminado correctamente.',
  onSuccess,
  debounceMs = 800,
}: BajaFormProps<T>) {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);
  const [results, setResults] = useState<T[]>([]);
  const [selected, setSelected] = useState<T | null>(null);
  const [deleted, setDeleted] = useState(false);

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      return;
    }

    // Evita que una respuesta vieja pise a una más reciente
    let cancelled = false;

    const fetchResults = async () => {
      try {
        // La búsqueda va como query string (?search=...), no como segmento
        // de ruta: el backend la valida con req.validated.query, no con
        // req.validated.params.
        const searchParams = new URLSearchParams({ search: debouncedQuery });
        const data = await api<PaginatedResponse<T> | T[]>(
          `${searchEndpoint}?${searchParams.toString()}`,
          { silent: true },
        );
        // findAll devuelve { data, metadata }; soportamos también un array
        // plano por si algún endpoint todavía no está paginado.
        if (!cancelled) setResults(Array.isArray(data) ? data : data.data);
      } catch (e) {
        if (cancelled) return;
        // Sin coincidencias: no es un error para el usuario
        if (e instanceof ApiError && e.status === 404) {
          setResults([]);
          return;
        }
        notifyIfNeeded(e, 'Error al buscar.');
      }
    };

    fetchResults();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, searchEndpoint]);

  const handleSelect = (item: T) => {
    setSelected(item);
    setDeleted(false);
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      const id = selected[idField];

      // api() ya muestra el toast si falla (ej: 409 por registros relacionados)
      await api(`${deleteEndpoint}/${id}`, { method: 'DELETE' });

      setResults(prev => prev.filter(r => r[idField] !== id));
      setSelected(null);
      setDeleted(true);

      if (entityEvent) eventBus.emit(entityEvent);
      onSuccess?.();
    } catch (e) {
      notifyIfNeeded(e, 'Error al eliminar.');
    }
  };

  return (
    <div style={{ width: '100%' }} className={styles.bajaWrapper}>

      {(title || subtitle) && (
        <div className={styles.header}>
          {icon && <div className={styles.iconWrap}>{icon}</div>}
          <div>
            {title && <h2 className={styles.title}>{title}</h2>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
      )}

      {/* Input de búsqueda */}
      <div className={styles.searchWrapper} style={{ width: '100%' }}>
        <svg
          className={styles.searchIcon}
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder={searchPlaceholder}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setSelected(null);
            setDeleted(false);
          }}
        />
      </div>

      {/* Lista de resultados */}
      {results.length > 0 && !selected && (
        <div className={styles.resultsContainer}>
          {/* Contador de resultados */}
          <span className={styles.resultsCount}>
            {results.length} {results.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
          </span>

          <ul className={styles.resultsList}>
            {results.map((r) => (
              <li
                key={String(r[idField])}
                className={styles.resultItem}
                onClick={() => handleSelect(r)}
              >
                <span className={styles.resultDesc}>
                  {previewFormat ? previewFormat(r) : String(r[previewField as keyof T])}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detalle del seleccionado */}
      {selected && (
        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <span className={styles.resultId}>#{String(selected[idField])}</span>
            <button className={styles.backButton} onClick={() => setSelected(null)}>
              ← Volver
            </button>
          </div>

          {detailFields.map(field => (
            <div className={styles.detailRow} key={field.name}>
              <span className={styles.detailLabel}>{field.label}</span>
              <span className={styles.detailValue}>
                {field.format
                  ? field.format(selected[field.name as keyof T])
                  : formatValue(selected[field.name as keyof T])}
              </span>
            </div>
          ))}

          <button className={styles.deleteButton} onClick={handleDelete}>
            Eliminar
          </button>
        </div>
      )}

      {/* Feedback eliminación */}
      {deleted && (
        <p className={styles.successMsg}>✓ {successMessage}</p>
      )}

    </div>
  );
}