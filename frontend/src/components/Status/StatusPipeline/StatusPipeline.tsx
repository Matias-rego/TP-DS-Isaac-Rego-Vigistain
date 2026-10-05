import type { ElementType } from "react";
import {
  Check,
  Inbox,
  Search,
  FileText,
  ThumbsUp,
  Wrench,
  ClipboardCheck,
  PackageCheck,
  ArrowRight,
} from "lucide-react";
import type { Order, EnumOrderStatus, Status_History } from "@/types/types";
import { formatDate } from "@/lib/utils";
import styles from "./StatusPipeline.module.css";

// "cancelado" no entra acá a propósito: es una salida del flujo, no un
// paso más de la secuencia normal.
const PIPELINE_STEPS: { status: EnumOrderStatus; label: string; icon: ElementType }[] = [
  { status: "recibido", label: "Recibido", icon: Inbox },
  { status: "diagnostico", label: "Diagnóstico", icon: Search },
  { status: "presupuestado", label: "Presupuestado", icon: FileText },
  { status: "aprobado", label: "Aprobado", icon: ThumbsUp },
  { status: "reparacion", label: "En Reparación", icon: Wrench },
  { status: "listo", label: "Listo / QA", icon: ClipboardCheck },
  { status: "entregado", label: "Entregado", icon: PackageCheck },
];

function getLatestEntry(history?: Status_History[]): Status_History | null {
  if (!history || history.length === 0) return null;
  return [...history].sort(
    (a, b) => new Date(b.dateOfChange).getTime() - new Date(a.dateOfChange).getTime()
  )[0];
}


function getLastOccurrence(
  history: Status_History[] | undefined,
  status: EnumOrderStatus
): Status_History | undefined {
  if (!history) return undefined;
  const matches = history.filter((h) => h.status === status);
  if (matches.length === 0) return undefined;
  return matches.sort(
    (a, b) => new Date(b.dateOfChange).getTime() - new Date(a.dateOfChange).getTime()
  )[0];
}

function formatElapsedSince(date: Date | string): string {
  const start = new Date(date).getTime();
  if (isNaN(start)) return "";

  const diffMs = Math.max(0, Date.now() - start);
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export interface PipelineDeReparacionProps {
  order: Order;
  onAdvance?: (nextStatus: EnumOrderStatus) => void;
}

const PipelineDeReparacion = ({ order, onAdvance }: PipelineDeReparacionProps) => {
  const latestEntry = getLatestEntry(order.statusHistory);
  const currentStatus = latestEntry?.status ?? order.status;
  const currentSince = latestEntry?.dateOfChange ?? order.dateOfEntry;

  const isCancelled = currentStatus === "cancelado";
  const currentIndex = PIPELINE_STEPS.findIndex((s) => s.status === currentStatus);

  const nextStep =
    !isCancelled && currentIndex >= 0 && currentIndex < PIPELINE_STEPS.length - 1
      ? PIPELINE_STEPS[currentIndex + 1]
      : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <span className={styles.titleDot} />
          <h3 className={styles.title}>Pipeline de Reparación</h3>
          {!isCancelled && (
            <span className={styles.elapsedPill}>
              {formatElapsedSince(currentSince)} transcurridos en fase actual
            </span>
          )}
        </div>

        {nextStep && (
          <button
            type="button"
            className={styles.advanceButton}
            onClick={() => onAdvance?.(nextStep.status)}
          >
            Avanzar a &quot;{nextStep.label}&quot;
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {isCancelled ? (
        <div className={styles.cancelledBanner}>Esta orden fue cancelada.</div>
      ) : (
        <div className={styles.steps}>
          {PIPELINE_STEPS.map((step, index) => {
            const isDone = currentIndex >= 0 && index < currentIndex;
            const isCurrent = index === currentIndex;
            const occurrence = getLastOccurrence(order.statusHistory, step.status);
            const Icon = step.icon;

            return (
              <div key={step.status} className={styles.step}>
                <div className={styles.trackColumn}>
                  <span
                    className={`${styles.dot} ${isDone ? styles.dotDone : ""} ${
                      isCurrent ? styles.dotCurrent : ""
                    } ${!isDone && !isCurrent ? styles.dotPending : ""}`}
                  >
                    {isDone ? <Check size={16} /> : <Icon size={16} />}
                  </span>
                  {index < PIPELINE_STEPS.length - 1 && (
                    <span className={`${styles.line} ${isDone ? styles.lineDone : ""}`} />
                  )}
                </div>

                <div className={styles.stepInfo}>
                  <span
                    className={`${styles.stepLabel} ${isCurrent ? styles.stepLabelCurrent : ""}`}
                  >
                    {step.label}
                  </span>

                  {isCurrent && (
                    <span className={styles.stepStatusCurrent}>Activo ahora</span>
                  )}

                  {!isCurrent && isDone && (
                    <span className={styles.stepDate}>
                      {occurrence
                        ? formatDate(occurrence.dateOfChange, {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "\u00A0"}
                    </span>
                  )}

                  {!isCurrent && !isDone && (
                    <span className={styles.stepStatusPending}>Pendiente</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PipelineDeReparacion;