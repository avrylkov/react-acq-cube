import React, {useEffect, useRef, useState} from "react";
import {
    DEEP_PAGE_SIZE,
    FIRST_DEEP_REQUEST,
    LOOK_UP_LEVEL,
    LOOK_UP_PAGE_SIZE,
    Metric,
    PageDateDeep,
    PageInfo,
    Projection,
    RequestCubeDeep,
    RequestCubeDeepCode,
    RequestCubeDeepName,
    RequestCubeLookUp,
    sleep,
    SortDirection, SortInfo,
    Stack
} from "./types";
import {Content, Header} from "antd/es/layout/layout";
import {
    Breadcrumb,
    Button,
    Card,
    Col,
    Flex,
    Input,
    Pagination,
    PaginationProps,
    Row,
    Select,
    Spin,
    Tooltip
} from "antd";
import {ARROW_DOWN, ARROW_UP, BOOK, FIND, GO_HOME, headerStyleDeep} from "./Style";
import {ItemType} from "antd/es/breadcrumb/Breadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {setDeepRequest, setLookUpRequest, setProjection} from "../redux/store";

function CubeLookDeep() {

    const loading = useRef<boolean>(true);
    const [metrics, setMetrics] = useState<Metric[]>([]);

    // const [request, setRequest] = useState<RequestCubeDeep>({label: RequestCubeDeepName[RequestCubeDeepCode.ALL].parent,
    //     code: RequestCubeDeepCode.ALL,  pageInfo: {pageNumber : 1, pageSize : PAGE_SIZE}});
    const request: RequestCubeDeep = useSelector((state: any) => state.deepRequest);
    const dispatch = useDispatch();

    const prevRequests = useRef(new Stack<RequestCubeDeep>(request));

    const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);
    const [selectedMetric, setSelectedMetric] = useState<string>()
    const total = useRef(0);
    const currentPage = useRef(1);



    function getMetric() {
        let url: string = process.env.REACT_APP_URL_DEEP ? process.env.REACT_APP_URL_DEEP : '-'
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
                return data
            }).catch(error => console.warn(error))
    }

    useEffect(() => {
        const fetchData = async () => {
            await sleep(250);
            getMetric().then(data => {
                let page: PageDateDeep = data
                total.current = page.total
                setMetrics(page.dataCubes)
                loading.current = false
                //console.log(metrics)
            })

        };
        //
        fetchData();
    }, [request]);

    function doNewRequest(newRq: RequestCubeDeep, isHistory: boolean = true) {
        loading.current = true
        if (isHistory) {
            prevRequests.current.push(newRq)
        }
        currentPage.current = newRq.pageInfo.pageNumber
        dispatch(setDeepRequest(newRq))
    }

    function onLookDeep(metricCode: string) {
        let pageInfo : PageInfo = {pageSize: DEEP_PAGE_SIZE, pageNumber: currentPage.current}
        if (request.code === RequestCubeDeepCode.ALL) {
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.ALL_TB].parent, code: RequestCubeDeepCode.ALL_TB,
                pageInfo: pageInfo, codeFilter: undefined }
            doNewRequest(rq)
        } else if (request.code === RequestCubeDeepCode.ALL_TB) {
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.TB].parent, code: RequestCubeDeepCode.TB, tb: metricCode,
                pageInfo: pageInfo, codeFilter: undefined}
            doNewRequest(rq)
        } else if (request.code === RequestCubeDeepCode.TB) {
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.GOSB].parent, code: RequestCubeDeepCode.GOSB, gosb: metricCode,
                pageInfo: pageInfo, codeFilter: undefined}
            doNewRequest(rq)
        } else if (request.code === RequestCubeDeepCode.GOSB) {
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.ORG].parent, code: RequestCubeDeepCode.ORG, org: metricCode,
                pageInfo: pageInfo, codeFilter: undefined}
            doNewRequest(rq)}
        else if (request.code === RequestCubeDeepCode.ORG) {
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.CONTRACT].parent, code: RequestCubeDeepCode.CONTRACT, contract: metricCode,
                pageInfo: pageInfo, codeFilter: undefined}
            doNewRequest(rq)
        } else if (request.code === RequestCubeDeepCode.CONTRACT) {
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.SHOP].parent, code: RequestCubeDeepCode.SHOP, shop: metricCode,
                pageInfo: pageInfo, codeFilter: undefined}
            doNewRequest(rq)
        }
    }

    function onSortMetric(metricName: string) {
        setSelectedMetric(metricName)
        sortMetric(metricName, sortDirection)
    }

    function onSortDirection() {
        switch (sortDirection) {
            case SortDirection.DESC:
                setSortDirection(SortDirection.ASC)
                sortMetric(selectedMetric, SortDirection.ASC)
                break
            case SortDirection.ASC:
                setSortDirection(SortDirection.DESC)
                sortMetric(selectedMetric, SortDirection.DESC)
                break
        }
    }

    function sortMetric(metricName: string | undefined, direction: SortDirection) {
        if (metricName !== undefined) {
            currentPage.current = 1;
            let pageInfo: PageInfo = {pageSize: DEEP_PAGE_SIZE, pageNumber: 1}
            let sortInfo: SortInfo = {metricName: metricName, ascending: direction === SortDirection.ASC}
            let rq: RequestCubeDeep = {...request, pageInfo: pageInfo, sortInfo: sortInfo}
            doNewRequest(rq, false)
        }
    }

    // JS version
    // function sortMetric(direction: SortDirection) {
    //     setSortDirection(direction)
    //
    //     function compareMetricFunc(a: Metric, b: Metric) {
    //         let findA = a.metrics.find((metricValue) => metricValue.name === selectedMetric.current);
    //         let findB = b.metrics.find((metricValue) => metricValue.name === selectedMetric.current);
    //         if (findA !== undefined && findB !== undefined) {
    //             if (findA.value < findB.value) {
    //                 return direction === SortDirection.ASC ? -1 : 1;
    //             }
    //             if (findA.value > findB.value) {
    //                 return direction === SortDirection.ASC ? 1 : -1;
    //             }
    //         }
    //         return 0;
    //     }
    //
    //     metrics.sort(compareMetricFunc)
    //     setMetrics(metrics.splice(0))
    // }

    function getMetricsNameForSelect() {
        let metric = metrics.find((v) => v.code.length > 0);
        return metric?.metrics.map((f) => {
            return {value: f.name, label: f.name}
        })
    }

    function onFilter(value: string) {
        let pageInfo: PageInfo = {pageSize: DEEP_PAGE_SIZE, pageNumber: 1}
        let rq = {...request, pageInfo: pageInfo, codeFilter: value}
        doNewRequest(rq, false)
    }

    function getRequestPath2(): ItemType[] {
        let requests : RequestCubeDeep[] = prevRequests.current.items()
        return requests.map((i, index) => {return {title: getCrumbElement(i.label + getCriteria(i), index)} as ItemType;})
    }

    function getCriteria(rq: RequestCubeDeep) {
        if (rq.shop !== undefined) {
            return "(" + rq.shop + ")"
        }
        if (rq.contract !== undefined) {
            return "(" + rq.contract + ")"
        }
        if (rq.org !== undefined) {
            return "(" + rq.org + ")"
        }
        if (rq.gosb !== undefined) {
            return "(" + rq.gosb + ")"
        }
        if (rq.tb !== undefined) {
            return "(" + rq.tb + ")"
        }
        return ""
    }

    const onChangeCurrentPage: PaginationProps['onChange'] = (page) => {
        //console.log(page);
        let pageInfo: PageInfo = {...request.pageInfo, pageNumber: page}
        let rq: RequestCubeDeep = {...request, pageInfo: pageInfo}
        doNewRequest(rq, false)
    };

    const gridStyleCell1: React.CSSProperties = {
        width: '60%',
        textAlign: 'left',
    };
    const gridStyleCell2: React.CSSProperties = {
        width: '40%'
    };

    function onCrumbClick(key : number) {
        console.log(key);
        if ((key + 1) < prevRequests.current.size()) {
            let n = prevRequests.current.size() - (key + 1)
            prevRequests.current.removeLast(n)
            let last = prevRequests.current.last();
            if (last !== undefined) {
                doNewRequest(last, false)
            }
        }
    }

    function getCrumbElement(label: string, key: number) {
        return <a style={{color: "yellow"}} onClick={(e) => {
            onCrumbClick(key)
        }}>{label}</a>
    }

    function onGoHome() {
        let current = prevRequests.current;
        if (current !== undefined) {
            prevRequests.current.clear()
            doNewRequest(FIRST_DEEP_REQUEST)
        }
    }

    function onCardMetricTitleClick(code: string) {
        console.log("onCardTitleClick", code, prevRequests.current.last()?.code)
        let codeRq = prevRequests.current.last()?.code;
        let rqLookUp: RequestCubeLookUp = {level: LOOK_UP_LEVEL.NONE, code:'',
            pageInfo: {pageSize: LOOK_UP_PAGE_SIZE, pageNumber: 1}
        }
        switch (codeRq) {
            case RequestCubeDeepCode.ALL_TB:
                rqLookUp = {...rqLookUp, level: LOOK_UP_LEVEL.TB, code: code}
                break
            case RequestCubeDeepCode.TB:
                rqLookUp = {...rqLookUp, level: LOOK_UP_LEVEL.GOSB, code: code}
                break
            case RequestCubeDeepCode.GOSB:
                rqLookUp = {...rqLookUp, level: LOOK_UP_LEVEL.ORGANIZATION, code: code}
                break
            case RequestCubeDeepCode.ORG:
                rqLookUp = {...rqLookUp, level: LOOK_UP_LEVEL.CONTRACT, code: code}
                break
            case RequestCubeDeepCode.CONTRACT:
                rqLookUp = {...rqLookUp, level: LOOK_UP_LEVEL.SHOP, code: code}
                break
            case RequestCubeDeepCode.SHOP:
                rqLookUp = {...rqLookUp, level: LOOK_UP_LEVEL.TERMINAL, code: code}
                break
        }
        dispatch(setProjection(Projection.LOOK_UP))
        dispatch(setLookUpRequest(rqLookUp))
    }


    return (
        <div>
            <Header style={headerStyleDeep}>
                <Row>
                    <Col span={12}>
                        {FIND}<Input size={"small"} style={{width: '50%'}}
                                     placeholder="Поиск"
                                     value = {request.codeFilter}
                                     onChange={(e) => onFilter(e.target.value)}></Input>
                    </Col>
                    <Col span={12}>
                        <Tooltip title="В начало">
                            <Button onClick={onclick => onGoHome()} size={"small"} >{GO_HOME}</Button>
                        </Tooltip>
                    </Col>
                </Row>
                <Row style={{marginTop: '10px'}}>
                    <Col span={24}>
                        <Tooltip title="Сортировка">
                            <Button size={"small"} onClick={onSortDirection}>{sortDirection === SortDirection.ASC ? ARROW_UP : ARROW_DOWN}</Button>
                            <Select
                                size={"small"}
                                style={{width: '50%'}}
                                value={selectedMetric}
                                onChange={onSortMetric}
                                options={getMetricsNameForSelect()}/>
                        </Tooltip>
                    </Col>
                </Row>
                <Breadcrumb
                    separator="=>"
                    items={getRequestPath2()}
                />
            </Header>

            <Content style={{padding: '10px 20px 10px'}}>
                <span>{RequestCubeDeepName[request.code].child}</span>
                <Spin size="large" style={{marginLeft : '35%'}} spinning={loading.current}></Spin>
                {
                    metrics.map((metric, index) => (
                        <Card title={<a onClick={(e) => onCardMetricTitleClick(metric.code)}>{(index + 1) + ') ' + metric.code}</a>}  size="small" style={{margin: '0px 0px 10px'}}>
                            {request.code !== RequestCubeDeepCode.SHOP &&
                                <Flex vertical={false}>
                                    <Card.Grid style={gridStyleCell1}>
                                        <ul>
                                            {
                                                metric.metrics.map((metricValue) =>
                                                    <li>{metricValue.name} : {metricValue.value}</li>)
                                            }
                                        </ul>
                                    </Card.Grid>
                                     <Card.Grid style={gridStyleCell2}><Button type="primary" onClick={(onclick) => onLookDeep(metric.code)}>
                                        Открыть{BOOK}</Button>
                                    </Card.Grid>
                                </Flex>}
                        </Card>
                    ))
                }
                <Pagination
                    total={total.current}
                    showTotal={(total) => `Всего ${total}`}
                    defaultPageSize={DEEP_PAGE_SIZE}
                    defaultCurrent={1}
                    pageSize={DEEP_PAGE_SIZE}
                    current={currentPage.current} onChange={onChangeCurrentPage}
                />
            </Content>
        </div>
    )

}

export default CubeLookDeep