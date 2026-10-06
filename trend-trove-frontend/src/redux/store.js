import { configureStore } from "@reduxjs/toolkit";
import cartReducer from './features/cartSlice';
import wishlistReducer from './features/wishlistSlice';

const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
  },
});

export default store;