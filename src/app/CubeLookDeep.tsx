import React, {useEffect, useRef, useState} from "react";
import {
    DEEP_PAGE_SIZE,
    FIRST_DEEP_REQUEST,
    MEDIA_TYPE,
    Metric,
    PageDateDeep,
    PageInfo,
    RequestCubeDeep,
    RequestCubeDeepCode,
    RequestCubeDeepName,
    sleep,
    SortDirection,
    Stack,
    URL
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
import {setDeepRequest} from "../redux/store";

function CubeLookDeep() {

    const loading = useRef<boolean>(true);
    const [metrics, setMetrics] = useState<Metric[]>([]);

    // const [request, setRequest] = useState<RequestCubeDeep>({label: RequestCubeDeepName[RequestCubeDeepCode.ALL].parent,
    //     code: RequestCubeDeepCode.ALL,  pageInfo: {pageNumber : 1, pageSize : PAGE_SIZE}});
    const request: RequestCubeDeep = useSelector((state: any) => state.deepRequest);
    const dispatch = useDispatch();

    const prevRequests = useRef(new Stack<RequestCubeDeep>(request));

    const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);
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
        //setRequest(newRq)
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

    function getMetricsNameForSelect() {
        let metric = metrics.find((v) => v.code.length > 0);
        return metric?.metrics.map((f) => {
            return {value: f.name, label: f.name}
        })
    }

    function onFilter(value: string) {
        let rq = {...request, codeFilter: value}
        doNewRequest(rq)
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
        doNewRequest(rq)
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
                                onChange={onSortMetric}
                                options={getMetricsNameForSelect()}/>
                        </Tooltip>
                    </Col>
                </Row>
                <Breadcrumb
                    items={getRequestPath2()}
                />
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