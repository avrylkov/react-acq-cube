import React, {useEffect, useRef, useState} from "react";
import {
    Metric,
    RequestCubeDeep,
    RequestCubeDeepCode,
    RequestCubeDeepCodeKey,
    RequestCubeDeepName,
    SortDirection,
    Stack
} from "./types";
import {Content, Header} from "antd/es/layout/layout";
import {Button, Card, Col, Flex, Input, Row, Select} from "antd";
import {ARROW_DOWN, ARROW_RIGHT, ARROW_UP, FIND, GO_BACK, GO_HOME, headerStyle} from "./Style";

function CubeLookDeep() {

    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [request, setRequest] = useState<RequestCubeDeep>({label: RequestCubeDeepName[RequestCubeDeepCode.ALL], code: RequestCubeDeepCode.ALL});
    const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.ASC);
    //const [filter, setFilter] = useState<string>();
    //
    const prevRequests = useRef(new Stack<RequestCubeDeep>());
    const selectedMetric = useRef<string>()

    function getMetric() {
        return fetch('http://localhost:8081/cube', {
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
                return data
            }).catch(error => console.warn(error))
    }

    useEffect(() => {
        const fetchData = async () => {
            getMetric().then(data => {
                setMetrics(data)
                //console.log(metrics)
            })

        };
        //
        fetchData();
    }, [request]);

    function onLookDeep(metricCode: string) {
        debugger
        if (request.code === RequestCubeDeepCode.ALL) {
            prevRequests.current.push(request)
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.ALL], code: RequestCubeDeepCode.ALL_TB, codeFilter: undefined }
            setRequest(rq)
        } else if (request.code === RequestCubeDeepCode.ALL_TB) {
            prevRequests.current.push(request)
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.TB], code: RequestCubeDeepCode.TB, tb: metricCode, codeFilter: undefined}
            setRequest(rq)
        } else if (request.code === RequestCubeDeepCode.TB) {
            prevRequests.current.push(request)
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.GOSB], code: RequestCubeDeepCode.GOSB, gosb: metricCode, codeFilter: undefined}
            setRequest(rq)
        } else if (request.code === RequestCubeDeepCode.GOSB) {
            prevRequests.current.push(request)
            let rq: RequestCubeDeep = {...request, label: RequestCubeDeepName[RequestCubeDeepCode.ORG], code: RequestCubeDeepCode.ORG, org: metricCode, codeFilter: undefined}
            setRequest(rq)
        }
    }

    function onGoBack() {
        let pop = prevRequests.current.pop();
        if (pop !== undefined) {
            setRequest(pop)
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
                setRequest(firstRequest)
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
        setRequest(rq)
    }

    function getRequestPath() {
        let path: string[] = []
        let rq= RequestCubeDeepCode[request.code]
        for (let key in RequestCubeDeepCode) {
            let requestCubeDeepCode = RequestCubeDeepCode[key as RequestCubeDeepCodeKey]
            let cubeDeepName = RequestCubeDeepName[requestCubeDeepCode]
            path.push(cubeDeepName)
            if (rq === key) {
                return path;
            }
        }
        return path
    }

    return (
        <div>
            <Header style={headerStyle}>
                <Row>
                    {/*<Col span={4}>*/}
                    {/*    {request.label}*/}
                    {/*</Col>*/}
                    <Col span={6}>
                        {FIND}<Input size={"small"} style={{width: 150}}
                                     value = {request.codeFilter}
                                     onChange={(e) => onFilter(e.target.value)}></Input>
                    </Col>
                    <Col span={6}>
                        <Button onClick={onclick => onGoBack()} size={"small"} >{GO_BACK} Назад</Button>
                        <Button onClick={onclick => onGoHome()} size={"small"} >{GO_HOME}</Button>
                    </Col>
                    <Col>
                        <Button size={"small"} onClick={onSortDirection}>{sortDirection === SortDirection.ASC ? ARROW_UP : ARROW_DOWN}</Button>
                        <Select
                            size={"small"}
                            style={{width: 120}}
                            onChange={onSortMetric}
                            options={getMetricsNameForSelect()}/>
                    </Col>
                </Row>
                <Flex gap={"small"} vertical={false} style={{margin: '5px'}}>
                    {
                        getRequestPath().map((v) => (<div>{ARROW_RIGHT}{v}</div>))
                    }
                </Flex>
            </Header>

            <Content style={{padding: '10px 20px 10px'}}>
                {
                    metrics.map((metric, index) => (
                        <Card title={(index + 1) + ') ' + metric.code} size="small" style={{margin: '0px 0px 10px'}}>
                            <Card.Grid>
                                <ul>
                                    {
                                        metric.metrics.map((metricValue) =>
                                            <li>{metricValue.name} : {metricValue.value}</li>)
                                    }
                                </ul>
                            </Card.Grid>
                            <Card.Grid><Button type="primary" onClick={onclick => onLookDeep(metric.code)}>Открыть
                                +</Button></Card.Grid>
                        </Card>
                    ))
                }
            </Content>
        </div>
    )

}

export default CubeLookDeep