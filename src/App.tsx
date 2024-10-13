import CubeData from "./app/CubeData";
import Login from "./app/Login";
import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="login" element={<Login/>}/>
                <Route path="*" element={<Login />} />
                <Route path="/" element={<Login />} />
                <Route path="cube" element={<CubeData />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
