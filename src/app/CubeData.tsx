import React from "react";
import {Layout} from "antd";
import CubeLookDeep from "./CubeLookDeep";

const layoutStyle = {
    borderRadius: 8,
    overflow: 'hidden',
    width: '50%',
    maxWidth: '50%',
};

const headerStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#fff',
    height: 34,
    lineHeight: '34px',
    backgroundColor: '#4096ff',
};

function CubeData() {


    return (
        <Layout style={layoutStyle}>
            <CubeLookDeep></CubeLookDeep>
        </Layout>
    )

}

export default CubeData