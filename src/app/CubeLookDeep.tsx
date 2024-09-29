import React, {useEffect, useRef, useState} from "react";
import {Metric, RequestCubeDeep, RequestCubeDeepCode, SortDirection, Stack} from "./types";
import {Content, Header} from "antd/es/layout/layout";
import {Button, Card, Input, Select} from "antd";
import {ARROW_DOWN, ARROW_UP, FIND, GO_BACK, GO_HOME, headerStyle} from "./Style";

function CubeLookDeep() {

    const [metrics, setMetrics] = useState<Metric[]>([]);
    const [request, setRequest] = useState<RequestCubeDeep>({label: "Все ТБ", code: "ALL"});
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
        prevRequests.current.push(request)
        if (request.code === RequestCubeDeepCode[RequestCubeDeepCode.ALL]) {
            setRequest({label: "По каждому ТБ", code: "ALL_TB"})
        } else if (request.code === RequestCubeDeepCode[RequestCubeDeepCode.ALL_TB]) {
            setRequest({label: "ТБ", code: "TB", tb: metricCode})
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


    return (
        <div>
            <Header style={headerStyle}>{request.label}
                {FIND}<Input size={"small"} style={{width: '15%'}} onChange={(e) => onFilter(e.target.value)}></Input>
                <Button onClick={onclick => onGoBack()} size={"small"} style={{left: '35%'}}>{GO_BACK} Назад</Button>
                <Button onClick={onclick => onGoHome()} size={"small"} style={{left: '36%'}}>{GO_HOME}</Button>

                <Button size={"small"}
                        onClick={onSortDirection}>{sortDirection === SortDirection.ASC ? ARROW_UP : ARROW_DOWN}</Button>
                <Select
                    size={"small"}
                    style={{width: 120}}
                    onChange={onSortMetric}
                    options={getMetricsNameForSelect()}/>
            </Header>

            <Content style={{padding: '10px 20px 10px'}}>
                {
                    metrics.map((metric) => (
                        <Card title={metric.code} size="small" style={{margin: '0px 0px 10px'}}>
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