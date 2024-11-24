import {configureStore, createSlice} from "@reduxjs/toolkit";
import {UserState} from "../app/types";
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
        setUser: (state, action) => {
            let {login, time} = action.payload
            state.login = login
            state.time = time
        }
    },
});


export const { setLogin, setTime, setUser } = userSlice.actions;

const userReducer = userSlice.reducer;

//export const history1 = createBrowserHistory()

export default configureStore({

    reducer: {
        user: userReducer,
        // router: connectRouter(history) as Reducer,
    },
    // middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(routerMiddleware(history)),
});

