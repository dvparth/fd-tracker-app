import { configureStore } from '@reduxjs/toolkit';
import depositsReducer from './slices/depositsSlice';

const store = configureStore({
  reducer: {
    deposits: depositsReducer,
  },
});

export default store;
