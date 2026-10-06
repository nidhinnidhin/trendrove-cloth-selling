import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cartLength: 0,
  },
  reducers: {
    setCartLength: (state, action) => {
      state.cartLength = action.payload;
    },
  },
});

export const { setCartLength } = cartSlice.actions;
export default cartSlice.reducer;