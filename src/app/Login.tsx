import React, {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import {setLogin, setTime} from "../redux/store";
import {Button, Input} from "antd";

//debugger;

function Login() {

    const [loginInput, setLoginInput] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const dispatch = useDispatch();
    //const userContext = useContext(CurrentUserContext);

    return (
        <div>
            <p></p>
            <Input addonBefore="Login" size={"small"} style={{width: '15%'}} onChange={(e) => {
                setLoginInput(e.target.value)
                setError("")
            }}></Input>
            <Button onClick={() => {
                if (loginInput === "alex") {
                    dispatch(setLogin(loginInput))
                    dispatch(setTime(new Date()))
                    navigate('cube', {replace: false})
                } else {
                    setError("Не верный логин")
                }
            }}> login
            </Button>
            <div>{error === "" ? '': error + ': ' + loginInput}</div> </div>
    )
}

export default Login