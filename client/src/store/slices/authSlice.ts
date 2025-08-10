import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';

interface AuthState {
  user: null | User;
  isAuth: boolean;
  token: string | null;
  loading: boolean;
  error: string | null;
  hydrated: boolean;
}

type User = {
  id: number;
  name: string;
  email: string;
  profile?: string | null;
  birthday?: string | null;
  createdAt: string;
  updatedAt: string;
};
const initialState: AuthState = {
  user: null,
  isAuth: false,
  token: null,
  loading: false,
  error: null,
  hydrated: false,
};

export const hydrateAuth = createAsyncThunk('auth/hydrateAuth', async () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? (JSON.parse(userStr) as User) : null;
  return { token, user };
});

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (
    data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      birthday?: string;
    },
    thunkAPI
  ) => {
    const res = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.text();
      return thunkAPI.rejectWithValue(error);
    }
    return await res.json();
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (data: { email: string; password: string }, thunkAPI) => {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.text();
      return thunkAPI.rejectWithValue(error);
    }

    return await res.json();
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuth = false;
      state.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        signupUser.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.isAuth = true;
          state.token = action.payload.token;
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      )
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        loginUser.fulfilled,
        (state, action: PayloadAction<{ user: User; token: string }>) => {
          state.loading = false;
          state.user = action.payload.user;
          state.isAuth = true;
          state.token = action.payload.token;
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(action.payload.user));
        }
      )
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(hydrateAuth.fulfilled, (state, { payload }) => {
        state.token = payload.token;
        state.user = payload.user;
        state.isAuth = Boolean(payload.token && payload.user);
        state.hydrated = true;
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.hydrated = true;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
