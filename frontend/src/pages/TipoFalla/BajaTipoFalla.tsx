import { useEffect, useState } from 'react';
import useDebounce from '@/components/useDebounce';
import styles from './TipoFalla.module.css';

interface FailureType {
    id_failure_type: number;
    failureDescription: string;
    estimatedImport: number;
}

const BajaTipoFalla = () => {
    const [query, setQuery] = useState('');
    const deboncedQuery = useDebounce(query, 800);
    const [res, setResult] = useState<FailureType[]>([]);
    const [selected, setSelected] = useState<FailureType | null>(null); // 👈
    const [deleted, setDeleted] = useState(false); // 👈 feedback post-eliminacion

    useEffect(() => {
        if (!deboncedQuery) {
            setResult([]);
            return;
        }
        const obtenResult = async () => {
            try {
                const result = await fetch(
                    `http://${import.meta.env.VITE_BACKEND_HOST}:${import.meta.env.VITE_BACKEND_PORT}/failures/getPartialTypes/${deboncedQuery}`,
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
    }, [deboncedQuery]);

    const handleSelect = (item: FailureType) => {
        setSelected(item);
        setDeleted(false);
    };

    const handleDelete = async () => {
        if (!selected) return;
        try {
            const token = localStorage.getItem('token');
            const result = await fetch(
                `http://${import.meta.env.VITE_BACKEND_HOST}:${import.meta.env.VITE_BACKEND_PORT}/failures/deleteType/${selected.id_failure_type}`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (!result.ok) throw new Error('Error al eliminar');

            // Sacar el eliminado de la lista y limpiar seleccion
            setResult(prev => prev.filter(r => r.id_failure_type !== selected.id_failure_type));
            setSelected(null);
            setDeleted(true);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ width: '100%' }} className={styles.bajaTipoFallaWrapper}>

            {/* Input de busqueda */}
            <div className={styles.searchWrapper} style={{ width: '100%' }}>
                <input
                    className={styles.searchInput}
                    type="text"
                    placeholder='Buscar tipo de falla...'
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        setSelected(null); // limpia seleccion al escribir de nuevo
                        setDeleted(false);
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
                            onClick={() => handleSelect(r)} // 👈
                        >
                            <span className={styles.resultId}>#{r.id_failure_type}</span>
                            <span className={styles.resultDesc}>{r.failureDescription}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* Detalle del seleccionado */}
            {selected && (
                <div className={styles.detailCard}>
                    <div className={styles.detailHeader}>
                        <span className={styles.resultId}>#{selected.id_failure_type}</span>
                        <button
                            className={styles.backButton}
                            onClick={() => setSelected(null)}
                        >
                            ← Volver
                        </button>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Descripción</span>
                        <span className={styles.detailValue}>{selected.failureDescription}</span>
                    </div>
                    <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Costo estimado</span>
                        <span className={styles.detailValue}>${selected.estimatedImport.toLocaleString('es-AR')}</span>
                    </div>
                    <button className={styles.deleteButton} onClick={handleDelete}>
                        Eliminar tipo de falla
                    </button>
                </div>
            )}

            {/* Feedback eliminacion */}
            {deleted && (
                <p className={styles.successMsg}>✓ Tipo de falla eliminado correctamente.</p>
            )}

        </div>
    );
}

export default BajaTipoFalla;