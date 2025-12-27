import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { apiFetch } from '../../lib/apiFetch';
import type { PublicGroupPreview, Group } from '../../types';

interface DiscoverState {
  groups: PublicGroupPreview[];
  currentPreview: PublicGroupPreview | null;
  languages: string[];
  popularTags: { tag: string; count: number }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  addedGroups: Record<string, string>; // originalGroupId -> userCopyId
  isLoading: boolean;
  error: string | null;
}

const initialState: DiscoverState = {
  groups: [],
  currentPreview: null,
  languages: [],
  popularTags: [],
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  addedGroups: {},
  isLoading: false,
  error: null,
};

const BASE_URL = 'http://localhost:3000';

export const searchPublicGroups = createAsyncThunk<
  { groups: PublicGroupPreview[]; pagination: DiscoverState['pagination'] },
  { query?: string; language?: string; tags?: string[]; page?: number },
  { state: RootState; rejectValue: string }
>('discover/search', async (params, thunkAPI) => {
  try {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('query', params.query);
    if (params.language) searchParams.set('language', params.language);
    if (params.tags?.length) searchParams.set('tags', params.tags.join(','));
    if (params.page) searchParams.set('page', String(params.page));

    const res = await fetch(`${BASE_URL}/discover/groups?${searchParams}`);
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to search groups');
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to search groups');
  }
});

export const getGroupPreview = createAsyncThunk<
  PublicGroupPreview,
  string,
  { state: RootState; rejectValue: string }
>('discover/preview', async (groupId, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/discover/groups/${groupId}`);
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to get group preview');
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to get group preview');
  }
});

export const fetchLanguages = createAsyncThunk<
  string[],
  void,
  { state: RootState; rejectValue: string }
>('discover/languages', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/discover/languages`);
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to fetch languages');
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to fetch languages');
  }
});

export const fetchPopularTags = createAsyncThunk<
  { tag: string; count: number }[],
  void,
  { state: RootState; rejectValue: string }
>('discover/tags', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/discover/tags`);
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to fetch tags');
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to fetch tags');
  }
});

export const checkAddedGroups = createAsyncThunk<
  Record<string, string>,
  string[],
  { state: RootState; rejectValue: string }
>('discover/checkAdded', async (groupIds, thunkAPI) => {
  try {
    const res = await apiFetch(
      '/group/check-copies',
      { method: 'POST', body: JSON.stringify({ groupIds }) },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue('Failed to check added groups');
    const { data } = await res.json();
    return data;
  } catch (e) {
    return thunkAPI.rejectWithValue('Failed to check added groups');
  }
});

export const copyPublicGroup = createAsyncThunk<
  { group: Group; originalGroupId: string },
  string,
  { state: RootState; rejectValue: { message: string; alreadyExists?: boolean } }
>('discover/copy', async (groupId, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/group/${groupId}/copy`,
      { method: 'POST' },
      thunkAPI.getState
    );
    
    if (!res.ok) {
      const data = await res.json();
      if (res.status === 409 && data.alreadyExists) {
        return thunkAPI.rejectWithValue({ 
          message: data.message || 'You have already added this group',
          alreadyExists: true,
        });
      }
      return thunkAPI.rejectWithValue({ message: data.message || 'Failed to copy group' });
    }
    
    const { data } = await res.json();
    return { group: data, originalGroupId: groupId };
  } catch (e) {
    return thunkAPI.rejectWithValue({ message: 'Failed to copy group' });
  }
});

const discoverSlice = createSlice({
  name: 'discover',
  initialState,
  reducers: {
    clearPreview: (state) => {
      state.currentPreview = null;
    },
    markGroupAsAdded: (state, action: { payload: { originalGroupId: string; copyId: string } }) => {
      state.addedGroups[action.payload.originalGroupId] = action.payload.copyId;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchPublicGroups.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchPublicGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.groups = action.payload.groups;
        state.pagination = action.payload.pagination;
      })
      .addCase(searchPublicGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to search groups';
      })
      .addCase(getGroupPreview.fulfilled, (state, action) => {
        state.currentPreview = action.payload;
      })
      .addCase(fetchLanguages.fulfilled, (state, action) => {
        state.languages = action.payload;
      })
      .addCase(fetchPopularTags.fulfilled, (state, action) => {
        state.popularTags = action.payload;
      })
      .addCase(checkAddedGroups.fulfilled, (state, action) => {
        state.addedGroups = { ...state.addedGroups, ...action.payload };
      })
      .addCase(copyPublicGroup.fulfilled, (state, action) => {
        state.addedGroups[action.payload.originalGroupId] = action.payload.group.id;
      });
  },
});

export const { clearPreview, markGroupAsAdded } = discoverSlice.actions;
export default discoverSlice.reducer;

