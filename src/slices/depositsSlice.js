import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = `${process.env.REACT_APP_API_URL}/api/deposits`;

export const fetchDeposits = createAsyncThunk('deposits/fetchDeposits', async () => {
  const response = await axios.get(API_URL);
  return response.data;
});

export const addDeposit = createAsyncThunk('deposits/addDeposit', async (deposit) => {
  const response = await axios.post(API_URL, deposit);
  return response.data;
});

export const updateDeposit = createAsyncThunk('deposits/updateDeposit', async ({ id, deposit }) => {
  const response = await axios.put(`${API_URL}/${id}`, deposit);
  return response.data;
});

export const deleteDeposit = createAsyncThunk('deposits/deleteDeposit', async (id) => {
  await axios.delete(`${API_URL}/${id}`);
  return id;
});

const depositsSlice = createSlice({
  name: 'deposits',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeposits.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDeposits.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchDeposits.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(addDeposit.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateDeposit.fulfilled, (state, action) => {
        const idx = state.items.findIndex(d => d._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteDeposit.fulfilled, (state, action) => {
        state.items = state.items.filter(d => d._id !== action.payload);
      });
  },
});

export default depositsSlice.reducer;
