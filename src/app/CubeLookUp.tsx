import {Input, Tree, TreeProps, Typography} from "antd";
import { DownOutlined } from '@ant-design/icons';
import React, {useEffect, useRef, useState} from "react";
import {RequestCubeLookUp} from "./types";
import {Header} from "antd/es/layout/layout";
import {FIND, headerStyle} from "./Style";

interface TbTreeData {
    code: string
    gosbs: GosbTreeData[]
}

interface GosbTreeData {
    code: string
    organizations: OrgTreeData[]
}

interface OrgTreeData {
    code: string
    contracts: ContrTreeData[]
}

interface ContrTreeData {
    code: string
    shops: ShopTreeData[]
}

interface ShopTreeData {
    code: string
}

interface TreeData {
    key: string
    title: string
    children: TreeData[]
}

function CubeLookUp() {

    const [request, setRequest] = useState<RequestCubeLookUp>({organization:'', contract:'', shop:''});
    const [tbs, setTbs] = useState<TreeData[]>([]);
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
                return mapTreeTb(data)
            }).catch(error => {
                console.warn(error)
                return []
            })
    }

    function mapTreeTb(tbData: TbTreeData[]): TreeData[] {
        return tbData.map((tb) => {
                return {key: tb.code, title: tb.code, children: mapTreeGosb(tb.gosbs)}
            }
        )
    }

    function mapTreeGosb(gosbs: GosbTreeData[]): TreeData[] {
        return gosbs.map((gosb) => {
                return {key: gosb.code, title: gosb.code, children: mapTreeOrg(gosb.organizations)}
            }
        )
    }

    function mapTreeOrg(organizations: OrgTreeData[]): TreeData[] {
        return organizations.map((org) => {
                return {key: org.code, title: org.code, children: mapTreeContract(org.contracts)}
            }
        )
    }

    function mapTreeContract(contracts: ContrTreeData[]): TreeData[] {
        return contracts.map((contract) => {
                return {key: contract.code, title: contract.code, children: mapTreeShop(contract.shops)}
            }
        )
    }

    function mapTreeShop(shops: ShopTreeData[]): TreeData[] {
        return shops.map((shop) => {
                return {key: shop.code, title: shop.code, children: []}
            }
        )
    }

    useEffect(() => {
        const fetchData = async () => {
            getMetric().then(data => {
                //debugger
                expandedKeys.current = getKeys(data)
                setTbs(data)
                //console.log(metrics)
            })

        };
        //
        if (request.organization?.length > 2 || request.contract?.length > 2 || request.shop?.length > 2) {
            fetchData();
        }
    }, [request]);

    function getKeys(treeData: TreeData[]): string[] {
        let find = treeData
            .filter(t => t.children.length > 0)
            .flatMap(t => t.children);
        if (find.length > 0) {
            return getKeys(find)
        } else {
            return treeData.map(t => t.key)
        }
    }

    const onSelect: TreeProps['onSelect'] = (selectedKeys, info) => {
        console.log('selected', selectedKeys, info);
    };

    function onFilterContract(value: string) {
        let rq = {...request, organization: '', shop: '', contract: value}
        setRequest(rq)
    }

    function onFilterOrganization(value: string) {
        let rq = {...request, contract: '', shop: '', organization: value}
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