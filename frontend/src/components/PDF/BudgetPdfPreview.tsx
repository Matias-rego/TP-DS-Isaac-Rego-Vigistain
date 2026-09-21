import { PDFViewer } from '@react-pdf/renderer';
import BudgetPdfDocument, { type BudgetWithRelations } from './BudgetPDFDocument';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { Budget } from '@/types/types';
import BACKEND_URL from '@/lib/config';

export interface BudgetPdfPreviewProps {
  budget: BudgetWithRelations;
}


export default function BudgetPdfPreview() {
  const [budget, setBudget] = useState<Budget |null>(null);
  const {id_budget} = useParams<{id_budget:string}>();
  useEffect(()=>{
          if (!id_budget) return;
          const fetchBudget = async () =>{
            console.log('id_budget que se va a pedir:', id_budget); // ¿es un uuid real o undefined/string vacío?

                  try{
                      const response = await fetch(`${BACKEND_URL}/api/budgets/${id_budget}`,
                          {
                              credentials: 'include',
                              method: "GET"
                          }
                      );
                      if(!response){
                          throw new Error(`Error en la petición: ${response}`);
                      }
                      const data : Budget = await response.json();
                      setBudget(data);
                  }catch(e){
                      console.error('Error al obtener la orden',e);
                  }
              };
              
              fetchBudget();
      },[id_budget])
      console.log(budget);  
  return (
    <PDFViewer style={{ width: '100%', height: '80vh', border: 'none' }}>
      <BudgetPdfDocument budget={budget} />
    </PDFViewer>
  );
}
