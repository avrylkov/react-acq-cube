import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import {setUser} from "../redux/store";
import {Button, Flex, Input, Layout, message} from "antd";
import {UserState} from "./types";
import {headerStyle, layoutStyle} from "./Style";
import {Header} from "antd/es/layout/layout";
// import {push} from "connected-react-router";


function Login() {

    const [loginInput, setLoginInput] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();

    const incorrectLogin = () => {
        messageApi.open({
            type: 'error',
            content: 'Не верный логин ' + loginInput,
        });
    };



    return (

        <Layout style={layoutStyle}>
            {contextHolder}
            <Header style={headerStyle}>
                <Flex vertical={false} gap="small" style={{margin: '5px'}}>
                    <Input addonBefore="Login" placeholder="Введите имя" size={"small"} style={{width: '60%'}} onChange={(e) => {
                        setLoginInput(e.target.value)
                    }}></Input>
                    <Button onClick={() => {
                        if (loginInput.length > 0) {
                            let userState = new UserState(loginInput, new Date())
                            dispatch(setUser(userState))
                            // dispatch(push('/login'))
                            navigate('/cube', {replace: false})
                        } else {
                            incorrectLogin()
                        }
                    }}> Login
                    </Button>
                </Flex>
            </Header>
        </Layout>

    )
}

export default Login