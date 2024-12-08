import {Input, Pagination, PaginationProps, Tree, TreeProps} from "antd";
import {DownOutlined} from '@ant-design/icons';
import React, {useEffect, useRef, useState} from "react";
import {
    ContrTreeData,
    DEEP_PAGE_SIZE,
    GosbTreeData,
    OrgTreeData,
    PageDateLookUp,
    PageInfo,
    Projection,
    RequestCubeDeep,
    RequestCubeDeepCode,
    RequestCubeDeepName,
    RequestCubeLookUp,
    ShopTreeData,
    TbTreeData,
    TerminalTreeData,
    TreeData
} from "./types";
import {Content, Header} from "antd/es/layout/layout";
import {FIND, headerStyleLookUp} from "./Style";
import {useDispatch} from "react-redux";
import {setDeepRequest, setProjection} from "../redux/store";

const PAGE_SIZE = 50;

function CubeLookUp() {

    const [request, setRequest] = useState<RequestCubeLookUp>({organization:'', contract:'', shop:'', terminal: '',
        pageInfo: {pageNumber : 1, pageSize : PAGE_SIZE}});
    const [tbs, setTbs] = useState<TreeData[]>([]);
    const tbsRef = useRef(tbs)
    const expandedKeys = useRef<string[]>([])
    const total = useRef(0);
    const currentPage = useRef(1);
    const dispatch = useDispatch();

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
                tbsRef.current = data
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
        //console.log('selected', selectedKeys, info);
        let levels = info.node.pos.split('-')
        let levelPath = getLevelPath(1, levels, tbsRef.current);
        let pageInfo: PageInfo = {pageSize: DEEP_PAGE_SIZE, pageNumber: 1}
        dispatch(setProjection(Projection.DEEP))
        switch (levelPath.length) {
            case 1:
                dispatch(setDeepRequest(createRequestCubeDeepTb(levelPath, pageInfo)))
                break
            case 2:
                dispatch(setDeepRequest(createRequestCubeDeepGosb(levelPath, pageInfo)))
                break
            case 3:
                dispatch((setDeepRequest(createRequestCubeDeepOrg(levelPath, pageInfo))))
                break
            case 4:
                dispatch((setDeepRequest(createRequestCubeDeepContract(levelPath, pageInfo))))
                break
            case 5:
                dispatch((setDeepRequest(createRequestCubeDeepShop(levelPath, pageInfo))))
                break
        }
    };

    function createRequestCubeDeepTb(levelPath: string[], pageInfo: PageInfo) {
        let rq: RequestCubeDeep = {
            label: RequestCubeDeepName[RequestCubeDeepCode.TB].parent,
            code: RequestCubeDeepCode.TB,
            tb: levelPath[0],
            pageInfo: pageInfo
        }
        return rq
    }

    function createRequestCubeDeepGosb(levelPath: string[], pageInfo: PageInfo) {
        let rq: RequestCubeDeep = {
            label: RequestCubeDeepName[RequestCubeDeepCode.GOSB].parent,
            code: RequestCubeDeepCode.GOSB,
            tb: levelPath[0], gosb: levelPath[1], pageInfo: pageInfo
        }
        return rq
    }

    function createRequestCubeDeepOrg(levelPath: string[], pageInfo: PageInfo) {
        let rq: RequestCubeDeep = {
            label: RequestCubeDeepName[RequestCubeDeepCode.ORG].parent,
            code: RequestCubeDeepCode.ORG,
            tb: levelPath[0], gosb: levelPath[1], org: levelPath[2], pageInfo: pageInfo
        }
        return rq
    }

    function createRequestCubeDeepContract(levelPath: string[], pageInfo: PageInfo) {
        let rq: RequestCubeDeep = {
            label: RequestCubeDeepName[RequestCubeDeepCode.CONTRACT].parent,
            code: RequestCubeDeepCode.CONTRACT,
            tb: levelPath[0], gosb: levelPath[1], org: levelPath[2], contract: levelPath[3],
            pageInfo: pageInfo
        }
        return rq
    }

    function createRequestCubeDeepShop(levelPath: string[], pageInfo: PageInfo) {
        let rq: RequestCubeDeep = {
            label: RequestCubeDeepName[RequestCubeDeepCode.SHOP].parent,
            code: RequestCubeDeepCode.SHOP,
            tb: levelPath[0], gosb: levelPath[1], org: levelPath[2], contract: levelPath[3], shop: levelPath[4],
            pageInfo: pageInfo
        }
        return rq
    }

    function getLevelPath(curLevel : number, lelels: string[], data: TreeData[]): string[] {
        let path: string[] = []
        if (curLevel < lelels.length) {
            path.push(data[Number(lelels[curLevel])].key)
            let pathNext = getLevelPath(curLevel + 1, lelels, data[Number(lelels[curLevel])].children)
            return [...path, ...pathNext]
        }
        return path
    }


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