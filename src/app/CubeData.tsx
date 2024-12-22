import React from "react";
import {Button, Flex, Layout, Radio, Tooltip} from "antd";
import CubeLookDeep from "./CubeLookDeep";
import {Footer, Header} from "antd/es/layout/layout";
import {FIRST_DEEP_REQUEST, Projection, UserState} from "./types";
import CubeLookUp from "./CubeLookUp";
import {COPYRIGHT, DOOR, footerStyle, headerStyleLookUp, layoutStyle} from "./Style";
import {useDispatch, useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";
import {setDeepRequest, setProjection} from "../redux/store";

function CubeData() {

    const userState: UserState = useSelector((state: any) => state.user);
    const projectionState: Projection = useSelector((state: any) => state.projection);
    const dispatch = useDispatch();

    //const [projection, setProjection] = useState(Projection.DEEP)
    const navigate = useNavigate();

    const projectionOptions = [
        {label: 'От ТБ к Терминалу', value: Projection.DEEP},
        {label: 'От Терминала к ТБ', value: Projection.LOOK_UP}
    ];

    return (
        <Layout style={layoutStyle}>
            {userState.login.length > 0 &&
             <div>
                <Header style={headerStyleLookUp}>
                    <Flex vertical={false} gap="small" style={{marginTop: '5px'}}>
                        <h3>Acquiring Cube{COPYRIGHT}</h3>
                        <Tooltip title={'Напраление проекции'}>
                            <Radio.Group options={projectionOptions}
                                         defaultValue={projectionState}
                                         value={projectionState}
                                         onChange={(e) => {
                                             //setProjection(e.target.value)
                                              dispatch(setProjection(e.target.value))
                                         }}
                            />
                        </Tooltip>
                        <Tooltip title={'Выход'}>
                            <Button style={{marginTop: '5px'}} onClick={(e) => {
                                dispatch(setProjection(Projection.NONE))
                                dispatch(setDeepRequest(FIRST_DEEP_REQUEST))
                                navigate('/login')
                            }}>{DOOR}</Button>
                        </Tooltip>
                    </Flex>
                </Header>
                {projectionState === Projection.DEEP && <CubeLookDeep></CubeLookDeep>}
                {projectionState === Projection.LOOK_UP && <CubeLookUp></CubeLookUp>}
                {<Footer style={footerStyle}>{userState.login}, {userState.time.toLocaleString('ru-Ru')}, {'стенд ' + process.env.REACT_APP_STAND}
                </Footer>}
            </div>}
            {userState.login.length === 0 && <div>Необходимо ввести <Link to={'/login'}>логин</Link></div>}
        </Layout>
    )

}

export default CubeData