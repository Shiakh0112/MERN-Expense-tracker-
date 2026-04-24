import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../services/api";

export const fetchMyExpenses = createAsyncThunk("expenses/fetchMy", async (params, { rejectWithValue }) => {
  try {
    const res = await api.get("/expenses/my-expenses", { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch expenses");
  }
});

export const fetchTeamExpenses = createAsyncThunk("expenses/fetchTeam", async ({ teamId, ...params }, { rejectWithValue }) => {
  try {
    const res = await api.get(`/expenses/team/${teamId}`, { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch team expenses");
  }
});

export const createExpense = createAsyncThunk("expenses/create", async (data, { rejectWithValue }) => {
  try {
    const res = await api.post("/expenses/create", data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to create expense");
  }
});

export const updateExpense = createAsyncThunk("expenses/update", async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/expenses/update/${id}`, data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to update expense");
  }
});

export const deleteExpense = createAsyncThunk("expenses/delete", async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/expenses/delete/${id}`);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to delete expense");
  }
});

export const uploadReceipt = createAsyncThunk("expenses/uploadReceipt", async (formData, { rejectWithValue }) => {
  try {
    const res = await api.post("/expenses/upload-receipt", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Upload failed");
  }
});

export const fetchMonthlyReport = createAsyncThunk("expenses/monthlyReport", async (params, { rejectWithValue }) => {
  try {
    const res = await api.get("/expenses/monthly-report", { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch report");
  }
});

export const fetchCategorySummary = createAsyncThunk("expenses/categorySummary", async (params, { rejectWithValue }) => {
  try {
    const res = await api.get("/expenses/category-summary", { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch summary");
  }
});

export const fetchTotal = createAsyncThunk("expenses/total", async (params, { rejectWithValue }) => {
  try {
    const res = await api.get("/expenses/total", { params });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch total");
  }
});

export const fetchBudgetStatus = createAsyncThunk("expenses/budgetStatus", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/budget/status");
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch budget");
  }
});

export const setBudget = createAsyncThunk("expenses/setBudget", async (monthlyLimit, { rejectWithValue }) => {
  try {
    const res = await api.post("/budget/set", { monthlyLimit });
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Failed to set budget");
  }
});

const expenseSlice = createSlice({
  name: "expenses",
  initialState: {
    expenses: [],
    total: 0,
    pages: 1,
    page: 1,
    monthlyReport: [],
    categorySummary: [],
    totals: null,
    budget: null,
    loading: false,
    uploadLoading: false,
    error: null,
  },
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyExpenses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMyExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.expenses;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.page = action.payload.page;
      })
      .addCase(fetchMyExpenses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(fetchTeamExpenses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTeamExpenses.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses = action.payload.expenses;
        state.total = action.payload.total;
        state.pages = action.payload.pages;
        state.page = action.payload.page;
      })
      .addCase(fetchTeamExpenses.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createExpense.pending, (state) => { state.loading = true; })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.expenses.unshift(action.payload);
      })
      .addCase(createExpense.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateExpense.fulfilled, (state, action) => {
        const idx = state.expenses.findIndex((e) => e._id === action.payload._id);
        if (idx !== -1) state.expenses[idx] = action.payload;
      })

      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.expenses = state.expenses.filter((e) => e._id !== action.payload);
      })

      .addCase(uploadReceipt.pending, (state) => { state.uploadLoading = true; })
      .addCase(uploadReceipt.fulfilled, (state) => { state.uploadLoading = false; })
      .addCase(uploadReceipt.rejected, (state, action) => { state.uploadLoading = false; state.error = action.payload; })

      .addCase(fetchMonthlyReport.fulfilled, (state, action) => { state.monthlyReport = action.payload; })
      .addCase(fetchCategorySummary.fulfilled, (state, action) => { state.categorySummary = action.payload; })
      .addCase(fetchTotal.fulfilled, (state, action) => { state.totals = action.payload; })
      .addCase(fetchBudgetStatus.fulfilled, (state, action) => { state.budget = action.payload; })
      .addCase(setBudget.fulfilled, (state, action) => { state.budget = { ...state.budget, budget: action.payload.monthlyLimit }; });
  },
});

export const { clearError } = expenseSlice.actions;
export default expenseSlice.reducer;
