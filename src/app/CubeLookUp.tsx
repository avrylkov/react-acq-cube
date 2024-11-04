import {Input, Tree, TreeProps, Typography} from "antd";
import { DownOutlined } from '@ant-design/icons';
import React, {useEffect, useRef, useState} from "react";
import {RequestCubeLookUp} from "./types";
import {Header} from "antd/es/layout/layout";
import {FIND, headerStyle} from "./Style";

function CubeLookUp() {

    type Tb = {
        key: string
        gosbs: Gosb[]
    }

    type Gosb = {
        key: string
        organizations: Organization[]
    }

    type Organization = {
        key: string
        contracts: Contract[]
    }

    type Contract = {
        key: string
        shops: Shop[]
    }

    type Shop = {
        key: string
    }

    const [request, setRequest] = useState<RequestCubeLookUp>({});
    const [tbs, setTbs] = useState<Tb[]>([]);
    const expandedKeys = useRef<string[]>([])

    function getMetric() {
        return fetch('http://localhost:8081/look-up', {
            method: "POST",
            //mode: "no-cors",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                return data.map((tb: any) => {
                        return {
                            key: tb.code,
                            title: tb.code,
                            children: tb.gosbs.map((gosb:any) => {
                                return {
                                    key: gosb.code,
                                    title: gosb.code,
                                    children: gosb.organizations.map((org:any) => {
                                        return {
                                            key: org.code,
                                            title: org.code,
                                            children: org.contracts.map((contr:any) => {
                                                return {
                                                    key: contr.code,
                                                    title: contr.code,
                                                    children: contr.shops.map((shop: any) => {
                                                        return {
                                                            key: shop.code,
                                                            title: shop.code
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }
                )
            }).catch(error => console.warn(error))
    }

    useEffect(() => {
        const fetchData = async () => {
            getMetric().then(data => {
                console.log(data)
                //debugger
                expandedKeys.current = getKeys(data)
                setTbs(data)
                //console.log(metrics)
            })

        };
        //
        fetchData();
    }, [request]);

    function getKeys(data: any) {
        let keys: string[] = []
        let filled : boolean = false
        data.map((tb: any) => {
            tb.children?.map((gosb: any) => {
                filled = gosb.children? gosb.children.length > 0 : false
                gosb.children?.map((org: any) => {
                    filled = org.children? org.children.length > 0 : false
                    org.children?.map((contr: any) => {
                        filled = contr.children? contr.children.length > 0 : false
                        contr.children?.map((shop: any) => {
                            keys.push(shop.key)
                        })
                        if (!filled) keys.push(contr.key)
                    })
                    if (!filled) keys.push(org.key)
                })
                if (!filled) keys.push(gosb.key)
            })
        })
        return keys
    }

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };

    function onFilterContract(value: string) {
        let rq = {...request, organization:'', shop:'', contract: value}
        setRequest(rq)
    }

    function onFilterOrganization(value: string) {
        let rq = {...request, contract:'', shop:'', organization: value}
        setRequest(rq)
    }

    function onFilterShop(value: string) {
        let rq = {...request, contract:'', organization: '', shop: value}
        setRequest(rq)
    }


    return (
        <div>
            <Header style={headerStyle}>
                {FIND}<Input addonBefore="ИНН Организации" size={"small"} style={{ width: 200 }}
                             value ={request.organization} onChange={(e) => onFilterOrganization(e.target.value)}></Input>
                {FIND}<Input addonBefore="N договора" size={"small"} style={{ width: 200 }}
                             value = {request.contract} onChange={(e) => onFilterContract(e.target.value)}></Input>
                {FIND}<Input addonBefore="МИД ТСТ" size={"small"} style={{ width: 200 }}
                             value ={request.shop} onChange={(e) => onFilterShop(e.target.value)}></Input>
            </Header>
            <Tree
                showLine
                switcherIcon={<DownOutlined />}
                onSelect={onSelect}
                defaultExpandAll
                //defaultExpandedKeys={['10']}
                expandedKeys={expandedKeys.current}
                autoExpandParent={true}
                treeData={tbs}
            />
        </div>
    )

}

export default CubeLookUp