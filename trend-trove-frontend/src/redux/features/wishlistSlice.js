import { createSlice } from "@reduxjs/toolkit";

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState: {
    wishlistLength: 0,
  },
  reducers: {
    setWishlistLength: (state, action) => {
      state.wishlistLength = action.payload;
    },
  },
});

export const { setWishlistLength } = wishlistSlice.actions;
export default wishlistSlice.reducer;