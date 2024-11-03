import React, {useState} from "react";
import {Button, Flex, Layout, Radio, Tooltip} from "antd";
import CubeLookDeep from "./CubeLookDeep";
import {Footer, Header} from "antd/es/layout/layout";
import {Projection, UserState} from "./types";
import CubeLookUp from "./CubeLookUp";
import {COPYRIGHT, DOOR, footerStyle, headerStyle, layoutStyle} from "./Style";
import {useSelector} from "react-redux";
import {Link, useNavigate} from "react-router-dom";

function CubeData() {

    const [projection, setProjection] = useState(Projection.DEEP)
    const userState: UserState = useSelector((state: any) => state.user);
    const navigate = useNavigate();

    const projectionOptions = [
        {label: 'От ТБ к Терминалу', value: Projection.DEEP},
        {label: 'От Терминала к ТБ', value: Projection.LOOK_UP}
    ];

    return (
        <Layout style={layoutStyle}>
            {userState.login.length > 0 && <div>
                <Header style={headerStyle}>
                    <Flex vertical={false} gap="small" style={{margin: '5px'}}>
                        <h3>Acquiring Cube{COPYRIGHT}</h3>
                        <Tooltip title={'Напраление проекции'}>
                            <Radio.Group options={projectionOptions}
                                         defaultValue={projection}
                                //optionType="button"
                                //buttonStyle="solid"
                                         onChange={(e) => {
                                             setProjection(e.target.value)
                                         }}
                            />
                        </Tooltip>
                        <Button onClick={(e) => {
                            navigate('/login')
                        }}>{DOOR}</Button>
                    </Flex>
                </Header>
                {projection === Projection.DEEP && <CubeLookDeep></CubeLookDeep>}
                {projection === Projection.LOOK_UP && <CubeLookUp></CubeLookUp>}
                {<Footer style={footerStyle}>{userState.login}, {userState.time.toLocaleString('ru-Ru')}</Footer>}
            </div>}
            {userState.login.length === 0 && <div>Необходимо ввести <Link to={'/login'}>логин</Link></div>}
        </Layout>
    )

}

export default CubeData