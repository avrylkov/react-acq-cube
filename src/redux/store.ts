import {configureStore, createSlice} from "@reduxjs/toolkit";

export interface UserState {
    login: string
    time: Date
}

// Начальное значение
const initialState: UserState = {
     login: "", time: new Date()
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    // Редьюсеры в слайсах меняют состояние и ничего не возвращают
    reducers: {
        setLogin: (state, action) => {
            state.login = action.payload;
        },
        setTime: (state, action) => {
            state.time = action.payload;
        },
    },
});

export const { setLogin, setTime } = userSlice.actions;

const userReducer = userSlice.reducer;
export default configureStore({

    reducer: {
        user: userReducer,
    },
});

