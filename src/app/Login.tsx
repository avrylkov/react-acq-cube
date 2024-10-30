import React, {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import {setUser} from "../redux/store";
import {Button, Flex, Input, Layout} from "antd";
import {UserState} from "./types";
import {headerStyle, layoutStyle} from "./Style";
import {Header} from "antd/es/layout/layout";

//debugger;

function Login() {

    const [loginInput, setLoginInput] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();
    //const userContext = useContext(CurrentUserContext);

    return (

        <Layout style={layoutStyle}>
            <Header style={headerStyle}>
                <Flex vertical={false} gap="small" style={{margin: '5px'}}>
                    <Input addonBefore="Login" placeholder="Введите имя" size={"small"} style={{width: '35%'}} onChange={(e) => {
                        setLoginInput(e.target.value)
                        setError("")
                    }}></Input>
                    <Button onClick={() => {
                        if (loginInput.length > 0) {
                            let userState = new UserState(loginInput, new Date())
                            dispatch(setUser(userState))
                            navigate('cube', {replace: false})
                        } else {
                            setError("Не верный логин ")
                        }
                    }}> Login
                    </Button>
                </Flex>
            </Header>
            <div>{error === "" ? '' : error + ': ' + loginInput}</div>
        </Layout>

    )
}

export default Login