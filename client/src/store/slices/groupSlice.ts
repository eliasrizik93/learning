import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { apiFetch } from '../../lib/apiFetch';

type CardType = { id: string; question: string; answer: string };

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

    const { data: g } = await res.json();
    return {
      id: g.id,
      name: g.name,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      userId: Number(g.userId),
      cards: Array.isArray(g.cards) ? g.cards : [],
    };
  } catch (e) {
    return thunkAPI.rejectWithValue(
      e instanceof Error ? e.message : 'Network error'
    );
  }
});

// FIX: return type is GroupType[], arg is void
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

    const groups: GroupType[] = list.map((g: GroupType) => ({
      id: g.id,
      name: g.name,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      userId: Number(g.userId),
      cards: Array.isArray(g.cards) ? g.cards : [],
    }));

    return groups;
  } catch (e) {
    return thunkAPI.rejectWithValue(
      e instanceof Error ? e.message : 'Network error'
    );
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
    return thunkAPI.rejectWithValue(
      e instanceof Error ? e.message : 'Network error'
    );
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
        state.error = action.payload as string;
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
        const findAndUpdateGroup = (groups: GroupType[], groupId: string): boolean => {
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
        state.error = action.payload as string;
      });
  },
});

export default groupSlice.reducer;
