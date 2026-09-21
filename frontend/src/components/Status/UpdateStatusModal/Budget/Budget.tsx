import type { Order } from "@/types/types";
import CreateBudget from "@/components/BudgetComponent/CrateBudget/CreateBudget"
import Nav from "@/pages/Nav/Nav";
import OrderDetailNav from "@/components/OrderComponent/OrderDetailNav/OrderDetailNav";

export type BudgetProps = {
    order: Order;
}

const Budget = ({order}: BudgetProps) => {
    return(
        <div>
            <CreateBudget order={order}/>
        </div>
    )
}
export default Budget;