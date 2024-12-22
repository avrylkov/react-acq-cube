import CubeData from "./app/CubeData";
import Login from "./app/Login";
import React from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {ConfigProvider} from "antd";


function App() {
    return (
        <ConfigProvider
            theme={{
                components: {
                    Breadcrumb: {
                        separatorColor: '#00ff00'
                    },
                },
            }}>

            <BrowserRouter>
                <Routes>
                    <Route path="login" element={<Login/>}/>
                    <Route path="*" element={<Login/>}/>
                    <Route path="/" element={<Login/>}/>
                    <Route path="cube" element={<CubeData/>}/>
                </Routes>
            </BrowserRouter>
        </ConfigProvider>
    );
}

export default App;
