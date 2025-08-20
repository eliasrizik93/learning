import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { apiFetch } from '../../lib/apiFetch';

/**
 * Represents a flashcard with question and answer
 */
type CardType = { id: string; question: string; answer: string };

/**
 * Raw group data from API response
 */
type ApiGroupResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: string | number;
  cards?: CardType[];
  groups?: ApiGroupResponse[];
};

/**
 * Transforms raw API group data to normalized GroupType
 */
const transformApiGroup = (apiGroup: ApiGroupResponse): GroupType => ({
  id: apiGroup.id,
  name: apiGroup.name,
  createdAt: apiGroup.createdAt,
  updatedAt: apiGroup.updatedAt,
  userId: Number(apiGroup.userId),
  cards: Array.isArray(apiGroup.cards) ? apiGroup.cards : [],
  groups: apiGroup.groups?.map(transformApiGroup),
});

/**
 * Handles common error transformation
 */
const handleAsyncError = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Network error';
};

export type GroupType = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  groups?: GroupType[];
  cards: CardType[];
};

export interface GroupState {
  groupsList: GroupType[];
  loading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groupsList: [],
  loading: false,
  error: null,
};

/**
 * Creates a new group
 */
export const createGroup = createAsyncThunk<
  GroupType,
  { name: string },
  { state: RootState; rejectValue: string }
>('groups/create', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      '/group',
      { method: 'POST', body: JSON.stringify({ name: payload.name }) },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await res.text());

    const { data } = await res.json();
    return transformApiGroup(data);
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

/**
 * Updates an existing group
 */
export const updateGroup = createAsyncThunk<
  GroupType,
  { id: string; name: string },
  { state: RootState; rejectValue: string }
>('groups/update', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/group/${payload.id}`,
      { method: 'PUT', body: JSON.stringify({ name: payload.name }) },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await res.text());

    const { data } = await res.json();
    return transformApiGroup(data);
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

/**
 * Deletes a group by ID
 */
export const deleteGroup = createAsyncThunk<
  string,
  { id: string },
  { state: RootState; rejectValue: string }
>('groups/delete', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/group/${payload.id}`,
      { method: 'DELETE' },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await res.text());

    return payload.id;
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});
/**
 * Fetches all groups for the current user
 */
export const getAllGroups = createAsyncThunk<
  GroupType[],
  void,
  { state: RootState; rejectValue: string }
>('groups/getAll', async (_: void, thunkAPI) => {
  try {
    const res = await apiFetch('/group', { method: 'GET' }, thunkAPI.getState);
    if (!res.ok) return thunkAPI.rejectWithValue(await res.text());

    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : json;

    if (!Array.isArray(list)) {
      return thunkAPI.rejectWithValue('Unexpected groups payload');
    }

    return list.map(transformApiGroup);
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

export const addCardToGroup = createAsyncThunk<
  CardType,
  { groupId: string; question: string; answer: string },
  { state: RootState; rejectValue: string }
>('groups/addCard', async (payload, thunkAPI) => {
  try {
    const res = await apiFetch(
      `/group/${payload.groupId}/card`,
      {
        method: 'POST',
        body: JSON.stringify({
          question: payload.question,
          answer: payload.answer,
        }),
      },
      thunkAPI.getState
    );
    if (!res.ok) return thunkAPI.rejectWithValue(await res.text());

    const { data: card } = await res.json();
    return {
      id: card.id,
      question: card.question,
      answer: card.answer,
    };
  } catch (e) {
    return thunkAPI.rejectWithValue(handleAsyncError(e));
  }
});

const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        createGroup.fulfilled,
        (state, action: PayloadAction<GroupType>) => {
          state.loading = false;
          state.groupsList.push(action.payload);
        }
      )
      .addCase(createGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to create group';
      })
      .addCase(getAllGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // FIX: payload is GroupType[]
      .addCase(
        getAllGroups.fulfilled,
        (state, action: PayloadAction<GroupType[]>) => {
          state.loading = false;
          state.groupsList = action.payload;
        }
      )
      .addCase(getAllGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? 'Failed to fetch groups';
      })
      .addCase(addCardToGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCardToGroup.fulfilled, (state, action) => {
        state.loading = false;
        // Find the group and add the card to it
        const findAndUpdateGroup = (
          groups: GroupType[],
          groupId: string
        ): boolean => {
          for (const group of groups) {
            if (group.id === groupId) {
              group.cards.push(action.payload);
              return true;
            }
            if (group.groups && findAndUpdateGroup(group.groups, groupId)) {
              return true;
            }
          }
          return false;
        };
        // Get groupId from the original action arguments
        const groupId = action.meta.arg.groupId;
        findAndUpdateGroup(state.groupsList, groupId);
      })
      .addCase(addCardToGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to add card';
      })
      .addCase(updateGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGroup.fulfilled, (state, action) => {
        state.loading = false;
        // Direct mutation is safe with Immer
        const index = state.groupsList.findIndex(
          (group) => group.id === action.payload.id
        );
        if (index !== -1) {
          state.groupsList[index] = action.payload;
        }
      })
      .addCase(updateGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to update group';
      })
      .addCase(deleteGroup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGroup.fulfilled, (state, action) => {
        state.loading = false;
        state.groupsList = state.groupsList.filter(
          (group: GroupType) => group.id !== action.payload
        );
      })
      .addCase(deleteGroup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? 'Failed to delete group';
      });
  },
});

export default groupSlice.reducer;
