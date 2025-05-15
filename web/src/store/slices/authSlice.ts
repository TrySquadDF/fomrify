import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Maybe, User } from "@/src/gql/graphql";
import { routeTo } from "@/src/shared/routes/rest-routes";

interface AuthState {
  isAuthenticated: boolean;
  user: Maybe<User>;
  error: Maybe<string>;
  loading: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  error: null,
  loading: false,
};

export const emailLogin = createAsyncThunk(
  'auth/emailLogin',
  async ({ email, password }: { email: string, password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(routeTo('emailLogin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Login failed');
      }

      return await response.json().then(data => (data.data) as User);
    } catch (e) {
      console.error("Login error:", e);
      return rejectWithValue((e as Error).message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password, displayName }: { email: string, password: string, displayName: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(routeTo('register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, displayName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Registration failed');
      }

      return true;
    } catch (e) {
      console.error("Registration error:", e);
      return rejectWithValue((e as Error).message || 'Registration failed');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await fetch(routeTo('logout'), { method: 'GET', credentials: 'include' });
      return true;
    } catch (e) {
      console.error("Logout error:", e);
      return rejectWithValue((e as Error).message || 'Logout failed');
    }
  }
);


export const session = createAsyncThunk(
  'auth/session',
  async ({}, { rejectWithValue }) => {
    try {
      const response = await fetch(routeTo('session'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || "");
      }

      return true;
    } catch (e) {
      console.error("Session error:", e);
      return rejectWithValue((e as Error).message || 'failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Maybe<User>>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setError: (state, action: PayloadAction<Maybe<string>>) => {
      state.error = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(emailLogin.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(emailLogin.fulfilled, (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loading = false;
    });
    builder.addCase(emailLogin.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(register.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(session.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(session.fulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = null;
    });
    builder.addCase(session.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload as string;
    });


    builder.addCase(logout.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(logout.fulfilled, (state) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
    });
    builder.addCase(logout.rejected, (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload as string;
    });
  },
});

export const { setUser, setError, setLoading } = authSlice.actions;
export default authSlice.reducer;