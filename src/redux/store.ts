import {configureStore, createSlice} from "@reduxjs/toolkit";
import {UserState} from "../app/types";

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

export default configureStore({

    reducer: {
        user: userReducer,
    },
});

