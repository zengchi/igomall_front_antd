import { list, save, edit, getAll, remove } from '@/services/role';

export default {
  namespace: 'role',

  state: {
    data: {
      content: [],
      pageNumber: 1,
      pageSize: 20,
      total: 0,
    },
    values: {},
    roles: [],
  },

  effects: {
    *list({ payload, callback }, { call, put }) {
      const response = yield call(list, payload);
      yield put({
        type: 'listInfo',
        payload: response,
      });
      if (callback) {
        callback(response);
      }
    },
    *save({ payload, callback }, { call }) {
      const response = yield call(save, payload);
      if (callback) {
        callback(response);
      }
    },
    *edit({ payload }, { call, put }) {
      const response = yield call(edit, payload);
      yield put({
        type: 'editInfo',
        payload: response,
      });
    },
    *getAll({ payload }, { call, put }) {
      const response = yield call(getAll, payload);
      yield put({
        type: 'allInfo',
        payload: Array.isArray(response) ? response : [],
      });
    },
    *remove({ payload, callback }, { call }) {
      const response = yield call(remove, payload);
      if (callback) {
        callback(response);
      }
    },
  },

  reducers: {
    listInfo(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    editInfo(state, action) {
      return {
        ...state,
        values: action.payload,
      };
    },
    allInfo(state, action) {
      return {
        ...state,
        roles: action.payload,
      };
    },
  },
};
