import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [] // { product, quantity }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action) {
      const product = action.payload;
      const existing = state.items.find((x) => x.product._id === product._id);
      if (existing) existing.quantity += 1;
      else state.items.push({ product, quantity: 1 });
    },
    removeFromCart(state, action) {
      const productId = action.payload;
      state.items = state.items.filter((x) => x.product._id !== productId);
    },
    changeQty(state, action) {
      const { productId, quantity } = action.payload;
      const item = state.items.find((x) => x.product._id === productId);
      if (!item) return;
      item.quantity = quantity;
      if (item.quantity <= 0) {
        state.items = state.items.filter((x) => x.product._id !== productId);
      }
    },
    clearCart(state) {
      state.items = [];
    }
  }
});

export const { addToCart, removeFromCart, changeQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;