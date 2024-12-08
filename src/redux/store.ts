import {configureStore, createSlice} from "@reduxjs/toolkit";
import {
    DEEP_PAGE_SIZE, FIRST_DEEP_REQUEST,
    Projection,
    RequestCubeDeep,
    RequestCubeDeepCode,
    RequestCubeDeepName,
    UserState
} from "../app/types";
//import {createBrowserHistory} from "history";
// import {routerMiddleware, connectRouter} from 'connected-react-router'

// Начальное значение
const initialUserState: UserState = {login: "", time: new Date()};

const userSlice = createSlice({
    name: 'user',
    initialState: initialUserState,
    // Редьюсеры в слайсах меняют состояние и ничего не возвращают
    reducers: {
        setLogin: (state, action) => {
            state.login = action.payload;
        },
        setTime: (state, action) => {
            state.time = action.payload;
        },
        setUser: (state, action) => state = action.payload
    },
});

const initialProjectionState: Projection = Projection.NONE;

const projectionSlice = createSlice({
    name: 'projection',
    initialState: initialProjectionState,
    reducers: {
        setProjection: (state, action) => state = action.payload
    },
});

const deepRequestSlice = createSlice({
    name: 'deepRequest',
    initialState: FIRST_DEEP_REQUEST,
    reducers: {
        setDeepRequest: (state, action) => state = action.payload
    },
});


export const { setLogin, setTime, setUser } = userSlice.actions;
export const { setProjection } = projectionSlice.actions;
export const { setDeepRequest } = deepRequestSlice.actions;

const userReducer = userSlice.reducer;
const projectionReducer = projectionSlice.reducer;
const deepRequestReducer = deepRequestSlice.reducer;

//export const history1 = createBrowserHistory()

export default configureStore({

    reducer: {
        user: userReducer,
        projection: projectionReducer,
        deepRequest: deepRequestReducer,
        // router: connectRouter(history) as Reducer,
    },
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(routerMiddleware(history)),
});

