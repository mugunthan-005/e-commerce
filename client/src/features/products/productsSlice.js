import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "../../api/axios";

export const fetchProducts = createAsyncThunk("products/fetch", async () => {
  const res = await axios.get("/api/products");
  return res.data.products || [];
});

const productsSlice = createSlice({
  name: "products",
  initialState: { items: [], status: "idle", error: "" },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed";
      });
  }
});

export default productsSlice.reducer;