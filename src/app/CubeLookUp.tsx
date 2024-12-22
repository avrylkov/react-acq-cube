import {Col, Input, Pagination, PaginationProps, Row, Spin, Tree, TreeProps} from "antd";
import {DownOutlined} from '@ant-design/icons';
import React, {useEffect, useRef, useState} from "react";
import {
    ContrTreeData,
    DEEP_PAGE_SIZE,
    GosbTreeData,
    LOOK_UP_LEVEL,
    LOOK_UP_PAGE_SIZE,
    OrgTreeData,
    PageDateLookUp,
    PageInfo,
    Projection,
    RequestCubeDeep,
    RequestCubeDeepCode,
    RequestCubeDeepName,
    RequestCubeLookUp,
    ShopTreeData, sleep,
    TbTreeData,
    TerminalTreeData,
    TreeData
} from "./types";
import {Content, Header} from "antd/es/layout/layout";
import {FIND, headerStyleLookUp} from "./Style";
import {useDispatch, useSelector} from "react-redux";
import {setDeepRequest, setLookUpRequest, setProjection} from "../redux/store";

const REQUEST_CODE_LENGTH = 3;

function CubeLookUp() {

    const request: RequestCubeLookUp = useSelector((state: any) => state.lookUpRequest);
    const loading = useRef<boolean>(isLoading(request));
    const dispatch = useDispatch();

    const [tbs, setTbs] = useState<TreeData[]>([]);
    const tbsRef = useRef(tbs)
    const expandedKeys = useRef<string[]>([])
    const total = useRef(0);
    const currentPage = useRef(1);

    function getMetric() {
        let url = process.env.REACT_APP_URL_LOOK_UP ? process.env.REACT_APP_URL_LOOK_UP : '-'
        let media = process.env.REACT_APP_MEDIA_TYPE ? process.env.REACT_APP_MEDIA_TYPE : 'application/json'
        return fetch(url, {
            method: "POST",
            //mode: "no-cors",
            headers: {
                'Content-Type': media
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

    useEffect(() => {
        const fetchData = async () => {
            await sleep(250);
            getMetric().then(data => {
                //debugger
                expandedKeys.current = getKeys(data)
                setTbs(data)
                tbsRef.current = data
                loading.current = false
                //console.log(metrics)
            })

        };
        if (isLoading(request)) {
            fetchData();
        }
    }, [request]);

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

    const onSelectTreeNone: TreeProps['onSelect'] = (selectedKeys, info) => {
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

    function getLevelPath(curLevel: number, lelels: string[], data: TreeData[]): string[] {
        let path: string[] = []
        if (curLevel < lelels.length) {
            path.push(data[Number(lelels[curLevel])].key)
            let pathNext = getLevelPath(curLevel + 1, lelels, data[Number(lelels[curLevel])].children)
            return [...path, ...pathNext]
        }
        return path
    }


    function onFilterContract(value: string) {
        let rq: RequestCubeLookUp = {
            ...request, level: LOOK_UP_LEVEL.CONTRACT, code: value,
            pageInfo: {pageSize: LOOK_UP_PAGE_SIZE, pageNumber: 1}
        }
        doNewRequest(rq)
    }

    function onFilterOrganization(value: string) {
        let rq: RequestCubeLookUp = {
            ...request, level: LOOK_UP_LEVEL.ORGANIZATION, code: value,
            pageInfo: {pageSize: LOOK_UP_PAGE_SIZE, pageNumber: 1}
        }
        doNewRequest(rq)
    }

    function onFilterShop(value: string) {
        let rq: RequestCubeLookUp = {
            ...request, level: LOOK_UP_LEVEL.SHOP, code: value,
            pageInfo: {pageSize: LOOK_UP_PAGE_SIZE, pageNumber: 1}
        }
        doNewRequest(rq)
    }

    function onFilterTerminal(value: string) {
        let rq: RequestCubeLookUp = {
            ...request, level: LOOK_UP_LEVEL.TERMINAL, code: value,
            pageInfo: {pageSize: LOOK_UP_PAGE_SIZE, pageNumber: 1}
        }
        doNewRequest(rq)
    }

    const onChangeCurrentPage: PaginationProps['onChange'] = (page) => {
        let rq: RequestCubeLookUp = {...request, pageInfo: {pageSize: LOOK_UP_PAGE_SIZE, pageNumber: page}}
        doNewRequest(rq)
    };

    function doNewRequest(rq: RequestCubeLookUp) {
        if (isLoading(rq)) {
            loading.current = true
        }
        currentPage.current = rq.pageInfo.pageNumber;
        dispatch(setLookUpRequest(rq))
    }

    function isLoading(rq: RequestCubeLookUp) {
        return rq.code.length >= REQUEST_CODE_LENGTH
    }

    return (
        <div>
            <Header style={headerStyleLookUp}>
                <Row>
                    <Col>
                        {FIND}<Input addonBefore="ИНН Организации" size={"small"} style={{width: 250}}
                                     value={request.level === LOOK_UP_LEVEL.ORGANIZATION ? request.code : ''}
                                     onChange={(e) => onFilterOrganization(e.target.value)}></Input>
                    </Col>
                    <Col>
                        {FIND}<Input addonBefore="N договора" size={"small"} style={{width: 250}}
                                     value={request.level === LOOK_UP_LEVEL.CONTRACT ? request.code : ''}
                                     onChange={(e) => onFilterContract(e.target.value)}></Input>
                    </Col>
                    <Col>
                        {FIND}<Input addonBefore="МИД ТСТ" size={"small"} style={{width: 250}}
                                     value={request.level === LOOK_UP_LEVEL.SHOP ? request.code : ''}
                                     onChange={(e) => onFilterShop(e.target.value)}></Input>
                    </Col>
                    <Col>
                        {FIND}<Input addonBefore="ТИД Терминала" size={"small"} style={{width: 250}}
                                     value={request.level === LOOK_UP_LEVEL.TERMINAL ? request.code : ''}
                                     onChange={(e) => onFilterTerminal(e.target.value)}></Input>
                    </Col>
                </Row>
            </Header>
            <Content style={{padding: '10px 20px 10px'}}>
                <Spin size="large" style={{marginLeft : '15%'}} spinning={loading.current}>
                    {(!loading.current && request.code.length < REQUEST_CODE_LENGTH) && <p className={'spin-content'}>Поиск от 3х символов..</p>}</Spin>
                <Tree
                    showLine
                    switcherIcon={<DownOutlined/>}
                    onSelect={onSelectTreeNone}
                    defaultExpandAll
                    //defaultExpandedKeys={['10']}
                    expandedKeys={expandedKeys.current}
                    autoExpandParent={true}
                    treeData={tbs}
                />
                <Pagination
                    total={total.current}
                    showTotal={(total) => `Всего ${total}`}
                    defaultPageSize={LOOK_UP_PAGE_SIZE}
                    defaultCurrent={1}
                    pageSize={LOOK_UP_PAGE_SIZE}
                    current={currentPage.current} onChange={onChangeCurrentPage}
                />
            </Content>
        </div>
    )

}

export default CubeLookUp