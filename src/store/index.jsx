import {configureStore} from '@reduxjs/toolkit';
import userReducer from "./slices/user-slices";
import personnelReducer from "./slices/personnel-slices";

const store = configureStore({
    reducer: {
        user: userReducer,
        personnel: personnelReducer,
    },
});

export default store;