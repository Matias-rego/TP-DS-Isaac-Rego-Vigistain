import type { Order } from "@/types/types";

export type BudgetProps = {
    order: Order;
}

const Budget = ({order}: BudgetProps) => {
    return(
        <div>
            Presupuesto de la orden {order.id_order}
        </div>
    )
}
export default Budget;