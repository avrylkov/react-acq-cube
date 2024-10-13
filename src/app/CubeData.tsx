import React, {useState} from "react";
import {Flex, Layout, Radio} from "antd";
import CubeLookDeep from "./CubeLookDeep";
import {Footer, Header} from "antd/es/layout/layout";
import {Projection} from "./types";
import CubeLookUp from "./CubeLookUp";
import {headerStyle} from "./Style";
import {useSelector} from "react-redux";
import {UserState} from "../redux/store";

const layoutStyle = {
    borderRadius: 8,
    overflow: 'hidden',
    width: '50%',
    maxWidth: '50%',
};

const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#4096ff',
};

function CubeData() {

    const [projection, setProjection] = useState(Projection.DEEP)

    const userState: UserState = useSelector((state:any) => state.user);

    const projectionOptions = [
        { label: 'От ТБ к Терминалу', value: Projection.DEEP},
        { label: 'От Терминала к ТБ', value: Projection.LOOK_UP }
    ];

    return (
        <Layout style={layoutStyle}>
            <Header style={headerStyle}>
                <Flex vertical gap="middle" >
                    <Radio.Group options={projectionOptions}
                    defaultValue={projection}
                    //optionType="button"
                    //buttonStyle="solid"
                    onChange={(e) => {setProjection(e.target.value)}}
                />
                </Flex>
            </Header>
            {projection === Projection.DEEP && <CubeLookDeep></CubeLookDeep>}
            {projection === Projection.LOOK_UP && <CubeLookUp></CubeLookUp>}
            <Footer style={footerStyle}>{userState.login}, {userState.time.toLocaleString('ru-Ru')}</Footer>
        </Layout>
    )

}

export default CubeData