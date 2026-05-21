import { useEffect, useState } from "react";
import useDebounce from "@/components/useDebounce";
import styles from './TipoFalla.module.css';

interface FailureType {
    id_failure_type: number;
    failureDescription: string;
    estimatedImport: number;
}

const ModificacionTipoFalla = () => {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 800);
    const [res, setResult] = useState<FailureType[]>([]);
    const [selected, setSelected] = useState<FailureType | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (!debouncedQuery) {
            setResult([]);
            return;
        }
        const obtenResult = async () => {
            try {
                const result = await fetch(
                    `http://${import.meta.env.VITE_BACKEND_HOST}:${import.meta.env.VITE_BACKEND_PORT}/failures/getPartialTypes/${debouncedQuery}`,
                    { method: 'GET' }
                );
                if (result.status === 404) {
                    setResult([]);
                    return;
                }
                const data = await result.json();
                setResult(data);
            } catch (e) {
                console.error(e);
            }
        }
        obtenResult();
    }, [debouncedQuery]);

    const handleSelect = (item: FailureType) => {
        setSelected(item);
        setSaved(false);
    };


    const handleFieldChange = (field: keyof FailureType, value: string) => {
        if (!selected) return;
        setSelected({
            ...selected,
            [field]: field === 'estimatedImport' ? Number(value) : value,
        });
    };


    const handleSave = async () => {
        if (!selected) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const result = await fetch(
                `http://${import.meta.env.VITE_BACKEND_HOST}:${import.meta.env.VITE_BACKEND_PORT}/failures/modifyType/${selected.id_failure_type}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    method: 'PUT',
                    body: JSON.stringify({
                        failureDescription: selected.failureDescription,
                        estimatedImport: selected.estimatedImport,
                    }),
                }
            );
            if (!result.ok) throw new Error('Error al modificar Tipo de Falla');
            setSaved(true);
            setSelected(null);
            setResult([]);
            setQuery('');
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className={styles.modTipoFallaWrapper}>

            <div className={styles.searchWrapper}>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder='Buscar tipo de falla...'
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setSelected(null);
                        setSaved(false);
                    }}
                />
            </div>

            {/* Lista de resultados */}
            {res.length > 0 && !selected && (
                <ul className={styles.resultsList}>
                    {res.map((r: FailureType) => (
                        <li
                            key={r.id_failure_type}
                            className={styles.resultItem}
                            onClick={() => handleSelect(r)}
                        >
                            <span className={styles.resultId}>#{r.id_failure_type}</span>
                            <span className={styles.resultDesc}>{r.failureDescription}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Formulario de edición */}
            {selected && (
                <div className={styles.detailCard}>
                    <div className={styles.detailHeader}>
                        <span className={styles.resultId}>#{selected.id_failure_type}</span>
                        <button
                            className={styles.backButton}
                            onClick={() => setSelected(null)}
                            disabled={saving}
                        >
                            ← Volver
                        </button>
                    </div>

                    <div className={styles.detailRow}>
                        <label className={styles.detailLabel}>Descripción</label>
                        <input
                            type="text"
                            className={styles.input}
                            value={selected.failureDescription}
                            onChange={e => handleFieldChange('failureDescription', e.target.value)}
                        />
                    </div>

                    <div className={styles.detailRow}>
                        <label className={styles.detailLabel}>Importe estimado</label>
                        <input
                            type="number"
                            className={styles.input}
                            value={selected.estimatedImport}
                            onChange={e => handleFieldChange('estimatedImport', e.target.value)}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button
                            className={styles.cancelButton}
                            onClick={() => setSelected(null)}
                            disabled={saving}
                        >
                            Cancelar
                        </button>
                        <button
                            className={styles.saveButton}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? 'Guardando…' : 'Guardar cambios'}
                        </button>
                    </div>
                </div>
            )}

            {/* Feedback guardado */}
            {saved && (
                <p className={styles.successMsg}>✓ Tipo de falla modificado correctamente.</p>
            )}

        </div>
    );
}

export default ModificacionTipoFalla;