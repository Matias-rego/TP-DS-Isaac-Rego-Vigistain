import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./FallaForm.module.css";
import { BACKEND_URL } from "@/lib/config";
import { useAuth } from "@/lib/AuthContext";

interface FailureType {
  id_failure_type: number;
  failureDescription: string;
  estimatedImport: number;
}

export interface NuevaFalla {
  id_failure_type: number;
  description: string;
  failureName: string;
}

interface FallaFormProps {
  onGuardar: (falla: NuevaFalla) => void;
  onCancelar?: () => void;
}

const FallaForm = ({ onGuardar, onCancelar }: FallaFormProps) => {
  const [tipos, setTipos] = useState<FailureType[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FailureType | null>(null);
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { isAuth, loading: authLoading } = useAuth();
  const boxRef = useRef<HTMLDivElement>(null);

  const fetchTipos = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/failure-types/`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setTipos(data);
    } catch (e) {
      console.error("Error al traer tipos de falla:", e);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && isAuth) fetchTipos();
  }, [authLoading, isAuth, fetchTipos]);

  // Cerrar el desplegable si se hace click afuera del combo.
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Filtramos en el cliente por el texto tipeado (búsqueda/filtro).
  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tipos;
    return tipos.filter((t) => t.failureDescription.toLowerCase().includes(q));
  }, [tipos, query]);

  const elegir = (t: FailureType) => {
    setSelected(t);
    setQuery(t.failureDescription);
    setOpen(false);
    setError(null);
  };

  const guardar = () => {
    if (!selected) {
      setError("Elegí un tipo de falla.");
      return;
    }
    if (description.trim() === "") {
      setError("Agregá una descripción.");
      return;
    }
    onGuardar({
      id_failure_type: selected.id_failure_type,
      description: description.trim(),
      failureName: selected.failureDescription,
    });
    setSelected(null);
    setQuery("");
    setDescription("");
    setError(null);
  };

  return (
    <div className={styles.form}>
      <div className={styles.field}>
        <label className={styles.label}>Tipo de falla</label>
        <div className={styles.combo} ref={boxRef}>
          <input
            className={styles.input}
            type="text"
            placeholder="Buscá el tipo de falla (ej: módulo roto)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); setSelected(null); }}
            onFocus={() => setOpen(true)}
          />
          {open && (
            <ul className={styles.dropdown}>
              {filtrados.length === 0 ? (
                <li className={styles.empty}>No hay tipos que coincidan</li>
              ) : (
                filtrados.map((t) => (
                  <li key={t.id_failure_type} className={styles.option} onClick={() => elegir(t)}>
                    {t.failureDescription}
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Descripción / síntomas</label>
        <textarea
          className={styles.textarea}
          rows={3}
          placeholder="Describí el problema: síntomas, cuándo ocurre, observaciones..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.actions}>
        {onCancelar && (
          <button type="button" className={styles.cancelBtn} onClick={onCancelar}>
            Cancelar
          </button>
        )}
        <button type="button" className={styles.saveBtn} onClick={guardar}>
          Guardar falla
        </button>
      </div>
    </div>
  );
};

export default FallaForm;
