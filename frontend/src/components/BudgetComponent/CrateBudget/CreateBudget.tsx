import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter,
    CardContent,
} from "@/components/ui/card";
import imgAddedCost1 from "@/assets/imgAddedCost1.svg";
import AddedCostBudgetTable, {type AddedCostRow} from "@/components/AddedCost/AddedCostBudgetTable/AddedCostBudgetTable";
import ActionButton from "@/components/Common/Buttons/ActionButton";
import DetailBudget from "@/components/BudgetComponent/DetailBudget/DetailBudget";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Budget, Order } from "@/types/types";
import styles from "./CreateBudget.module.css";
import CreateAddedCost from "@/components/AddedCost/CreateAddedCost/CreateAddedCost";
import BACKEND_URL from "@/lib/config";
import { EVENTS, eventBus } from "@/lib/eventBus";

interface CreateBudgetProps {
    order: Order;
    onClick?: () => void;
}

const CreateBudget = ({ order }: CreateBudgetProps) => {
    const [budget, setBudget] = useState<Budget | null>(order.budget ?? null);
    const [inputCost, setInputCost] = useState(
        order.budget?.laborCost != null ? String(order.budget.laborCost) : ""
    );
    const [savingLabor, setSavingLabor] = useState(false);
    const [laborError, setLaborError] = useState<string | null>(null);

    const [addedCosts, setAddedCosts] = useState<AddedCostRow[]>([]);
    const [addedCostsError, setAddedCostsError] = useState<string | null>(null);

    const [newAddedCost, setNewAddedCost] = useState(false);

    const navigate = useNavigate();


    const fetchAddedCosts = async (id_budget: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/added-cost/ofBudget/${id_budget}`, {
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error(`Error ${res.status} al obtener los costos adicionales`);
            }

            const data: Array<{
                id_addedCost: string;
                type_addedCost: AddedCostRow["type_addedCost"];
                addedCostDescription: string;
                addedCostAmount: number;
            }> = await res.json();

            setAddedCosts(
                data.map((item) => ({
                    rowId: item.id_addedCost,
                    id_addedCost: item.id_addedCost,
                    type_addedCost: item.type_addedCost,
                    addedCostDescription: item.addedCostDescription,
                    addedCostAmount: item.addedCostAmount,
                }))
            );
        } catch (e) {
            console.error("Error al obtener los costos adicionales:", e);
        }
    };

    const refreshBudget = async (id_budget: string) => {
        try {
            const res = await fetch(`${BACKEND_URL}/api/budgets/${id_budget}`, {
                credentials: "include",
            });

            if (!res.ok) return;

            const updated: Budget = await res.json();
            setBudget(updated);
        } catch (e) {
            console.error("Error al refrescar el presupuesto:", e);
        }
    };

    useEffect(() => {
        if (budget?.id_budget) {
            fetchAddedCosts(budget.id_budget);
        }
    }, [budget?.id_budget]);

    useEffect(() => {
        const unsubscribe = eventBus.on(EVENTS.budgetChanged, () => {
            if (budget?.id_budget) {
                fetchAddedCosts(budget.id_budget);
                refreshBudget(budget.id_budget);
            }
        });
        return unsubscribe;
    }, [budget?.id_budget]);

    const handleSaveLaborCost = async () => {
        const numValue = parseFloat(inputCost) || 0;
        setSavingLabor(true);
        setLaborError(null);

        try {
            const method = budget ? "PUT" : "POST";
            const url = budget
                ? `${BACKEND_URL}/api/budgets/${budget.id_budget}`
                : `${BACKEND_URL}/api/budgets`;

            const payload = budget
                ? { laborCost: numValue }
                : { id_order: order.id_order, laborCost: numValue };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                throw new Error(
                    errorBody.message || `Error ${response.status} al guardar el presupuesto`
                );
            }

            const updatedBudget: Budget = await response.json();
            setBudget(updatedBudget);
            eventBus.emit(EVENTS.budgetChanged, updatedBudget);
        } catch (e) {
            console.error("Error guardando el presupuesto:", e);
            setLaborError(
                e instanceof Error ? e.message : "No se pudo guardar el presupuesto."
            );
        } finally {
            setSavingLabor(false);
        }
    };

    const handleAddedCostsChange = async (next: AddedCostRow[]) => {
        const prevById = new Map(addedCosts.map((row) => [row.rowId, row]));

        const edited = next.filter((row) => {
            if (!row.id_addedCost) return false;
            const prev = prevById.get(row.rowId);
            if (!prev) return false;
            return (
                prev.type_addedCost !== row.type_addedCost ||
                prev.addedCostDescription !== row.addedCostDescription ||
                prev.addedCostAmount !== row.addedCostAmount
            );
        });

        const rowWasRemoved = next.length < addedCosts.length;

        setAddedCosts(next);
        setAddedCostsError(null);

        if (edited.length === 0 && !rowWasRemoved) return;

        try {
            await Promise.all(
                edited.map((row) =>
                    fetch(`${BACKEND_URL}/api/added-cost/${row.id_addedCost}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            type_addedCost: row.type_addedCost,
                            addedCostDescription: row.addedCostDescription,
                            addedCostAmount: row.addedCostAmount,
                        }),
                    }).then((res) => {
                        if (!res.ok) {
                            throw new Error(`Error ${res.status} al actualizar el costo adicional`);
                        }
                    })
                )
            );

            if (budget?.id_budget) {
                await refreshBudget(budget.id_budget);
                eventBus.emit(EVENTS.budgetChanged, budget);
            }
        } catch (e) {
            console.error("Error al sincronizar costos adicionales:", e);
            setAddedCostsError(
                e instanceof Error ? e.message : "No se pudo guardar el cambio en costos adicionales."
            );
        }
    };

    const handleIssueBudget = async ({ sendEmail }: { sendEmail: boolean }) => {
        if (!budget) return;

        try {
            if (sendEmail) {
                await fetch(`${BACKEND_URL}/api/budgets/${budget.id_budget}/send-email`, {
                    method: 'POST',
                    credentials: 'include',
                });
            }

        } catch (e) {
            console.error('Error al emitir el presupuesto:', e);
        }
    };

    const closeModalAddedCost = () => {
        setNewAddedCost(false);
        // Defensivo: por si CreateAddedCost no emite budgetChanged solo.
        if (budget?.id_budget) {
            fetchAddedCosts(budget.id_budget);
            refreshBudget(budget.id_budget);
        }
    };
    

return (
    <div className={styles.page}>
        <div className={styles.layout}>
            {/* COLUMNA IZQUIERDA: MANO DE OBRA + COSTOS AGREGADOS */}
            <main className={styles.main}>
                {/* MANO DE OBRA */}
                <Card className={styles.card}>
                    <CardHeader className={styles.cardHeader}>
                        <div className={styles.sectionHeading}>
                            <div className={styles.sectionIcon}>
                                <span>$</span>
                            </div>

                            <div>
                                <CardTitle className={styles.cardTitle}>
                                    Mano de Obra
                                </CardTitle>

                                <CardDescription className={styles.cardDescription}>
                                    Ingresa el costo de la mano de obra
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className={styles.cardContent}>
                        <div className={styles.field}>
                            <label
                                htmlFor="laborCost"
                                className={styles.label}
                            >
                                Mano de obra especializada
                            </label>

                            <div className={styles.inputWrapper}>
                                <Input
                                    id="laborCost"
                                    name="laborCost"
                                    value={inputCost}
                                    type="number"
                                    placeholder="0.00"
                                    onChange={(e) =>
                                        setInputCost(e.target.value)
                                    }
                                    className={styles.input}
                                    disabled={savingLabor}
                                />

                                <span className={styles.inputSuffix}>
                                    ARS
                                </span>
                            </div>

                            <p className={styles.helperText}>
                                Tarifa del técnico aplicada al presupuesto.
                            </p>

                            {laborError && (
                                <p className={styles.errorText}>
                                    {laborError}
                                </p>
                            )}
                        </div>

                        <div className={styles.savedValue}>
                            <span>Valor guardado actual</span>
                            <strong>
                                ${Number(budget?.laborCost ?? 0).toFixed(2)}
                            </strong>
                        </div>
                    </CardContent>

                    <CardFooter className={styles.cardFooter}>
                        <ActionButton
                            label={
                                savingLabor
                                    ? "Guardando..."
                                    : "Actualizar mano de obra"
                            }
                            onClick={handleSaveLaborCost}
                            icon={null}
                            disabled={savingLabor}
                        />

                        {budget == null && (
                            <p className={styles.helperText}>
                                Para crear el presupuesto ingresa el valor de
                                mano de obra inicial.
                            </p>
                        )}
                    </CardFooter>
                </Card>

                {/* COSTOS ADICIONALES */}
                <Card className={styles.card}>
                    <CardHeader className={styles.cardHeader}>
                        <div className={styles.sectionHeading}>
                            <div
                                className={`${styles.sectionIcon} ${styles.sectionIconImage}`}
                            >
                                <img
                                    src={imgAddedCost1}
                                    alt="Icono de agregar costo"
                                />
                            </div>

                            <div>
                                <CardTitle className={styles.cardTitle}>
                                    Costos Adicionales y Repuestos
                                </CardTitle>

                                <CardDescription
                                    className={styles.cardDescription}
                                >
                                    Agrega los costos adicionales a tu
                                    presupuesto.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent
                        className={`${styles.cardContent} ${styles.tableContent}`}
                    >
                        {addedCostsError && (
                            <p className={styles.errorText}>
                                {addedCostsError}
                            </p>
                        )}

                        <AddedCostBudgetTable
                            items={addedCosts}
                            onChange={handleAddedCostsChange}
                            allowAdd={false}
                            disabled={!budget}
                        />
                    </CardContent>

                    <CardFooter
                        className={`${styles.cardFooter} ${styles.cardFooterBetween}`}
                    >
                        <span className={styles.tableHelper}>
                            Agrega repuestos, insumos u otros costos.
                        </span>

                        <ActionButton
                            label="Agregar Costo"
                            onClick={() => setNewAddedCost(true)}
                            icon={null}
                            variant="neutral"
                            disabled={!budget}
                        />
                    </CardFooter>
                </Card>
            </main>

            {/* COLUMNA DERECHA: DETAIL BUDGET */}
            {budget != null && (
                <aside className={styles.sidebar}>
                    <div className={styles.summarySticky}>
                        <DetailBudget
                            budget={budget}
                            onIssue={handleIssueBudget}
                            onSaveDraft={()=>{}}
                            onCancel={() => navigate(-1)}
                        />
                    </div>
                </aside>
            )}
        </div>

        {/* MODAL AGREGAR COSTO */}
        {newAddedCost && budget && (
            <div
                className={styles.modalOverlay}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        closeModalAddedCost();
                    }
                }}
            >
                <div className={styles.modalContent}>
                    <button
                        type="button"
                        className={styles.modalClose}
                        onClick={closeModalAddedCost}
                        aria-label="Cerrar"
                    >
                        ×
                    </button>

                    <CreateAddedCost budget={budget} />
                </div>
            </div>
        )}
    </div>
);
};

export default CreateBudget;