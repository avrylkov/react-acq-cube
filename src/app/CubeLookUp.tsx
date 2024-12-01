import {Input, Pagination, PaginationProps, Tree, TreeProps} from "antd";
import {DownOutlined} from '@ant-design/icons';
import React, {useEffect, useRef, useState} from "react";
import {
    ContrTreeData,
    GosbTreeData,
    OrgTreeData, PageDateLookUp,
    RequestCubeLookUp,
    ShopTreeData,
    TbTreeData,
    TerminalTreeData,
    TreeData
} from "./types";
import {Content, Header} from "antd/es/layout/layout";
import {FIND, headerStyleLookUp} from "./Style";

const PAGE_SIZE = 50;

function CubeLookUp() {

    const [request, setRequest] = useState<RequestCubeLookUp>({organization:'', contract:'', shop:'', terminal: '',
        pageInfo: {pageNumber : 1, pageSize : PAGE_SIZE}});
    const [tbs, setTbs] = useState<TreeData[]>([]);
    const expandedKeys = useRef<string[]>([])
    const total = useRef(0);
    const currentPage = useRef(1);

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

    function mapTreeTb(pageData: PageDateLookUp): TreeData[] {
        let tbData: TbTreeData[] = pageData.dataCubes;
        total.current = pageData.total
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
                return {key: shop.code, title: shop.code, children: mapTreeTerminal(shop.terminals)}
            }
        )
    }

    function mapTreeTerminal(terminals: TerminalTreeData[]): TreeData[] {
        return terminals.map((terminal) => {
                return {key: terminal.code, title: terminal.code, children: []}
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
        if (request.organization?.length > 2
            || request.contract?.length > 2
            || request.shop?.length > 2
            || request.terminal?.length > 2) {
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
        let rq: RequestCubeLookUp = {...request, organization: '', shop: '', terminal: '', contract: value,
            pageInfo: {pageSize: PAGE_SIZE, pageNumber: 1}}
        doRequest(rq)
    }

    function onFilterOrganization(value: string) {
        let rq: RequestCubeLookUp = {...request, contract: '', shop: '', terminal: '', organization: value,
            pageInfo: {pageSize: PAGE_SIZE, pageNumber: 1}}
        doRequest(rq)
    }

    function onFilterShop(value: string) {
        let rq:RequestCubeLookUp = {...request, contract:'', organization: '', terminal: '', shop: value,
            pageInfo: {pageSize: PAGE_SIZE, pageNumber: 1}}
        doRequest(rq)
    }

    function onFilterTerminal(value: string) {
        let rq:RequestCubeLookUp = {...request, contract:'', organization: '', shop: '', terminal: value,
            pageInfo: {pageSize: PAGE_SIZE, pageNumber: 1}}
        doRequest(rq)
    }

    const onChangeCurrentPage: PaginationProps['onChange'] = (page) => {
        let rq: RequestCubeLookUp = {...request, pageInfo: {pageSize: PAGE_SIZE, pageNumber: page}}
        doRequest(rq)
    };

    function doRequest(rq: RequestCubeLookUp) {
        currentPage.current = rq.pageInfo.pageNumber;
        setRequest(rq)
    }

    return (
        <div>
            <Header style={headerStyleLookUp}>
                {FIND}<Input addonBefore="ИНН Организации" size={"small"} style={{ width: 200 }}
                             value ={request.organization} onChange={(e) => onFilterOrganization(e.target.value)}></Input>
                {FIND}<Input addonBefore="N договора" size={"small"} style={{ width: 200 }}
                             value = {request.contract} onChange={(e) => onFilterContract(e.target.value)}></Input>
                {FIND}<Input addonBefore="МИД ТСТ" size={"small"} style={{ width: 200 }}
                             value ={request.shop} onChange={(e) => onFilterShop(e.target.value)}></Input>
                {FIND}<Input addonBefore="ТИД Терминала" size={"small"} style={{ width: 200 }}
                             value ={request.terminal} onChange={(e) => onFilterTerminal(e.target.value)}></Input>
            </Header>
            <Content style={{padding: '10px 20px 10px'}}>
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
                <Pagination
                    total={total.current}
                    showTotal={(total) => `Всего ${total}`}
                    defaultPageSize={PAGE_SIZE}
                    defaultCurrent={1}
                    pageSize={PAGE_SIZE}
                    current={currentPage.current} onChange={onChangeCurrentPage}
                />
            </Content>
        </div>
    )

}

export default CubeLookUp