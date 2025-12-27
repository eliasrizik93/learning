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
  profile: string | null;
  birthday: string | null;
  country: string | null;
  phoneNumber: string | null;
  profileVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

// Helper function to ensure user object has all required fields
const normalizeUser = (userData: any): User => {
  const convertDate = (date: any): string | null => {
    if (!date) return null;
    if (typeof date === 'string') return date;
    if (date instanceof Date) return date.toISOString();
    return null;
  };

  return {
    id: userData.id,
    name: userData.name || '',
    email: userData.email || '',
    profile: userData.profile || null,
    birthday: convertDate(userData.birthday),
    country: userData.country || null,
    phoneNumber: userData.phoneNumber || null,
    profileVisible: userData.profileVisible ?? true,
    createdAt: convertDate(userData.createdAt) || new Date().toISOString(),
    updatedAt: convertDate(userData.updatedAt) || new Date().toISOString(),
  };
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
  const cachedUser = userStr ? (JSON.parse(userStr) as User) : null;

  // No token means not authenticated
  if (!token) {
    console.log('❌ No token found, not authenticated');
    return { token: null, user: null };
  }

  // We have a token - try to verify with server and get fresh data
  try {
    const res = await fetch('http://localhost:3000/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      // Token is invalid/expired - clear everything
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return { token: null, user: null };
    }

    // Token is valid - get fresh user data from server
    const userData = await res.json();
    
    if (userData && userData.id) {
      const completeUser = normalizeUser(userData);
      localStorage.setItem('user', JSON.stringify(completeUser));
      return { token, user: completeUser };
    }
    
    // API returned OK but no valid user data - use cached if available
    if (cachedUser) {
      const completeUser = normalizeUser(cachedUser);
      return { token, user: completeUser };
    }
    
    // No cached user either - clear auth
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
    
  } catch {
    // Network error - server might be down, use cached data if available
    if (cachedUser) {
      const completeUser = normalizeUser(cachedUser);
      localStorage.setItem('user', JSON.stringify(completeUser));
      return { token, user: completeUser };
    }
    
    // No cached data and server is down - can't authenticate
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { token: null, user: null };
  }
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
      profile?: string;
    },
    thunkAPI
  ) => {
    console.log('Signup payload:', data);
    const res = await fetch('http://localhost:3000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      let errorMessage = 'Failed to sign up';
      try {
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } catch {
        errorMessage = 'Failed to sign up. Please try again.';
      }
      console.error('Signup error:', errorMessage);
      return thunkAPI.rejectWithValue(errorMessage);
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
      let errorMessage = 'Failed to log in';
      try {
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorText;
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } catch {
        errorMessage = 'Failed to log in. Please check your credentials.';
      }
      return thunkAPI.rejectWithValue(errorMessage);
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
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
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
          const normalizedUser = normalizeUser(action.payload.user);
          state.user = normalizedUser;
          state.isAuth = true;
          state.token = action.payload.token;
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
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
          const normalizedUser = normalizeUser(action.payload.user);
          state.user = normalizedUser;
          state.isAuth = true;
          state.token = action.payload.token;
          localStorage.setItem('token', action.payload.token);
          localStorage.setItem('user', JSON.stringify(normalizedUser));
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

export const { logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
