import api from "./api";

const financialService = {
  getDashboard() {
    return api.get("/financial/dashboard");
  },

  getExpenseBreakdown() {
    return api.get("/financial/expenses");
  },

  getProjectProfitability() {
    return api.get("/financial/projects");
  },

  getMonthlyCashFlow() {
    return api.get("/financial/cashflow");
  },
};

export default financialService;