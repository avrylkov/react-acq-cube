import React, {useEffect, useRef, useState} from "react";
import {
    Metric, PageDate, PageInfo,
    RequestCubeDeep,
    RequestCubeDeepCode,
    RequestCubeDeepCodeKey,
    RequestCubeDeepName, sleep,
    SortDirection,
    Stack
} from "./types";
import {Content, Header} from "antd/es/layout/layout";
import {Button, Card, Col, Flex, Input, Pagination, PaginationProps, Row, Select, Spin, Tooltip} from "antd";
import {ARROW_DOWN, ARROW_RIGHT, ARROW_UP, BOOK, FIND, GO_BACK, GO_HOME, headerStyle} from "./Style";

const PAGE_SIZE = 20;

const URL = 'http://localhost:8081/deep'
const MEDIA_TYPE = 'application/json'

// const URL = 'https://functions.yandexcloud.net/d4eqh0ifdrcs2sakrct0?integration=raw'
// const MEDIA_TYPE = 'text/plain'


function CubeLookDeep() {

    const loading = useRef<boolean>(true);
    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [request, setRequest] = useState<RequestCubeDeep>({label: RequestCubeDeepName[RequestCubeDeepCode.ALL].parent,
        code: RequestCubeDeepCode.ALL,
        pageInfo: {pageNumber : 1, pageSize : PAGE_SIZE}});
    const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);
    //const [filter, setFilter] = useState<string>();
    //
    const prevRequests = useRef(new Stack<RequestCubeDeep>());
    const selectedMetric = useRef<string>()
    const total = useRef(0);
    const currentPage = useRef(1);



    function getMetric() {
        return fetch(URL, {
            method: "POST",
            //mode: "no-cors",
            headers: {
                'Content-Type': MEDIA_TYPE
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
            await sleep(500);
            getMetric().then(data => {
                let page: PageDate = data
                total.current = page.total
                setMetrics(page.dataCubes)
                loading.current = false
                //console.log(metrics)
            })

        };
        //
        fetchData();
    }, [request]);

    function doRequest(rq: RequestCubeDeep) {
        loading.current = true
        setRequest(rq)
    }

    function onLookDeep(metricCode: string) {
        let pageInfo : PageInfo = {pageSize: PAGE_SIZE, pageNumber: currentPage.current}
        if (request.code === RequestCubeDeepCode.ALL) {
            prevRequests.current.push(request)
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.ALL].parent, code: RequestCubeDeepCode.ALL_TB,
                pageInfo: pageInfo, codeFilter: undefined }
            doRequest(rq)
        } else if (request.code === RequestCubeDeepCode.ALL_TB) {
            prevRequests.current.push(request)
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.TB].parent, code: RequestCubeDeepCode.TB, tb: metricCode,
                pageInfo: pageInfo, codeFilter: undefined}
            doRequest(rq)
        } else if (request.code === RequestCubeDeepCode.TB) {
            prevRequests.current.push(request)
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.GOSB].parent, code: RequestCubeDeepCode.GOSB, gosb: metricCode,
                pageInfo: pageInfo, codeFilter: undefined}
            doRequest(rq)
        } else if (request.code === RequestCubeDeepCode.GOSB) {
            prevRequests.current.push(request)
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.ORG].parent, code: RequestCubeDeepCode.ORG, org: metricCode,
                pageInfo: pageInfo, codeFilter: undefined}
            doRequest(rq)}
        else if (request.code === RequestCubeDeepCode.ORG) {
            prevRequests.current.push(request)
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.CONTRACT].parent, code: RequestCubeDeepCode.CONTRACT, contract: metricCode,
                pageInfo: pageInfo, codeFilter: undefined}
            doRequest(rq)
        } else if (request.code === RequestCubeDeepCode.CONTRACT) {
            prevRequests.current.push(request)
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.SHOP].parent, code: RequestCubeDeepCode.SHOP, shop: metricCode,
                pageInfo: pageInfo, codeFilter: undefined}
            doRequest(rq)
        }
    }

    function onGoBack() {
        let rq = prevRequests.current.pop();
        if (rq !== undefined) {
            doRequest(rq)
            currentPage.current = rq.pageInfo.pageNumber
        }
    }

    function onSortMetric(metricName: string) {
        selectedMetric.current = metricName
        sortMetric(sortDirection)
    }

    function onSortDirection() {
        switch (sortDirection) {
            case SortDirection.DESC:
                sortMetric(SortDirection.ASC)
                break
            case SortDirection.ASC:
                sortMetric(SortDirection.DESC)
                break
        }
    }

    function sortMetric(direction: SortDirection) {
        setSortDirection(direction)

        function compareMetricFunc(a: Metric, b: Metric) {
            let findA = a.metrics.find((metricValue) => metricValue.name === selectedMetric.current);
            let findB = b.metrics.find((metricValue) => metricValue.name === selectedMetric.current);
            if (findA !== undefined && findB !== undefined) {
                if (findA.value < findB.value) {
                    return direction === SortDirection.ASC ? -1 : 1;
                }
                if (findA.value > findB.value) {
                    return direction === SortDirection.ASC ? 1 : -1;
                }
            }
            return 0;
        }

        metrics.sort(compareMetricFunc)
        setMetrics(metrics.splice(0))
    }

    function onGoHome() {
        let current = prevRequests.current;
        if (current !== undefined) {
            let firstRequest = current.first();
            if (firstRequest !== undefined) {
                prevRequests.current = new Stack()
                doRequest(firstRequest)
                currentPage.current = firstRequest.pageInfo.pageNumber
            }
        }
    }

    function getMetricsNameForSelect() {
        // return [{ value: 'jack', label: 'Jack' }]
        let metric = metrics.find((v) => v.code.length > 0);
        return metric?.metrics.map((f) => {
            return {value: f.name, label: f.name}
        })
    }

    function onFilter(value: string) {
        let rq = {...request, codeFilter: value}
        doRequest(rq)
    }

    function getRequestPath() {
        let path: string[] = []
        let rq= RequestCubeDeepCode[request.code]
        for (let key in RequestCubeDeepCode) {
            let requestCubeDeepCode = RequestCubeDeepCode[key as RequestCubeDeepCodeKey]
            let cubeDeepName = RequestCubeDeepName[requestCubeDeepCode].parent
            path.push(cubeDeepName)
            if (rq === key) {
                return path;
            }
        }
        return path
    }

    const onChangeCurrentPage: PaginationProps['onChange'] = (page) => {
        //console.log(page);
        currentPage.current = page;
        let rq: RequestCubeDeep = {...request, pageInfo: {pageSize: PAGE_SIZE, pageNumber: page}}
        doRequest(rq)
    };

    const gridStyleCell1: React.CSSProperties = {
        width: '60%',
        textAlign: 'left',
    };
    const gridStyleCell2: React.CSSProperties = {
        width: '40%'
    };

    return (
        <div>
            <Header style={headerStyle}>
                <Row>
                    <Col span={12}>
                        {FIND}<Input size={"small"} style={{width: '50%'}}
                                     placeholder="Поиск"
                                     value = {request.codeFilter}
                                     onChange={(e) => onFilter(e.target.value)}></Input>
                    </Col>
                    <Col span={12}>
                        <Button onClick={onclick => onGoBack()} size={"small"} >{GO_BACK} Назад</Button>
                        <Tooltip title="В начало">
                            <Button onClick={onclick => onGoHome()} size={"small"} >{GO_HOME}</Button>
                        </Tooltip>
                    </Col>
                </Row>
                <Row style={{marginTop: '10px'}}>
                    <Col span={12}>
                        <Tooltip title="Сортировка">
                            <Button size={"small"} onClick={onSortDirection}>{sortDirection === SortDirection.ASC ? ARROW_UP : ARROW_DOWN}</Button>
                            <Select
                                size={"small"}
                                style={{width: 120}}
                                onChange={onSortMetric}
                                options={getMetricsNameForSelect()}/>
                        </Tooltip>
                    </Col>
                </Row>
                <Flex gap={"small"} vertical={false} style={{margin: '5px'}}>
                    {
                        getRequestPath().map((v) => (<div>{ARROW_RIGHT} {v}</div>))
                    }
                </Flex>
            </Header>

            <Content style={{padding: '10px 20px 10px'}}>
                <span>{RequestCubeDeepName[request.code].child}</span>
                <Spin size="large" style={{marginLeft : '35%'}} spinning={loading.current}>
                </Spin>
                {
                    metrics.map((metric, index) => (
                        <Card title={(index + 1) + ') ' + metric.code} size="small" style={{margin: '0px 0px 10px'}}>
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
                                     <Card.Grid style={gridStyleCell2}><Button type="primary" onClick={onclick => onLookDeep(metric.code)}>
                                        Открыть{BOOK}</Button>
                                    </Card.Grid>
                                </Flex>}
                        </Card>
                    ))
                }
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

export default CubeLookDeep