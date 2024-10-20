import React, {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useDispatch} from "react-redux";
import {setUser} from "../redux/store";
import {Button, Input} from "antd";
import {UserState} from "./types";

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
                    //dispatch(setLogin(loginInput))
                    //dispatch(setTime(new Date()))
                    let userState = new UserState(loginInput, new Date())
                    dispatch(setUser(userState))
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