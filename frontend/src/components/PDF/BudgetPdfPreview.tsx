import { PDFViewer } from '@react-pdf/renderer';
import BudgetPdfDocument, { type BudgetWithRelations } from './BudgetPDFDocument';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BACKEND_URL from '@/lib/config';

export interface BudgetPdfPreviewProps {
  budget: BudgetWithRelations;
}


export default function BudgetPdfPreview() {
  const [budget, setBudget] = useState<BudgetWithRelations | null>(null);
  const { id_budget } = useParams<{ id_budget: string }>();

  useEffect(() => {
    if (!id_budget) return;
    const fetchBudget = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/budgets/${id_budget}`, {
          credentials: 'include',
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error(`Error en la petición: ${response.status}`);
        }
        const data: BudgetWithRelations = await response.json();
        setBudget(data);
      } catch (e) {
        console.error('Error al obtener el presupuesto', e);
      }
    };

    fetchBudget();
  }, [id_budget]);

  if (!budget) return null; // o un spinner/loading acá

  return (
    <PDFViewer style={{ width: '100%', height: '80vh', border: 'none' }}>
      <BudgetPdfDocument budget={budget} />
    </PDFViewer>
  );
}
