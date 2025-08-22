import React, {useEffect, useRef, useState} from 'react';
import {Button, Input, InputNumber} from "antd";
import {PageHeader, ProTable} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {get} from "lodash";
import {useGetAllQuery, usePutQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {URLS} from "../../../constants/url";

const AgentCommissionPage = () => {
    const {t} = useTranslation()
    const actionRef = useRef(null);
    const [dataSource, setDataSource] = useState([]);

    let {data,isLoading} = useGetAllQuery({
        key: KEYS.agentCommission, url: `${URLS.agentCommission}/list`
    })
    const {mutate, isPending} = usePutQuery({listKeyId: KEYS.specificList})

    const update = () => {
        mutate({
                   url:'api/branch/edit/bulk-update',
                   attributes:dataSource
        });
    }

    useEffect(() => {
        if(data){
            setDataSource(get(data,'data.data',[]))
        }
    },[data])
    console.log('dataSource',dataSource)
    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Банк реквизиты филиалов')}
            />
            <ProTable
                dataSource={dataSource}
                loading={isLoading}
                style={{cursor: 'pointer'}}
                search={{
                    layout: 'vertical',
                    resetButtonProps: {
                        danger: true,
                    },
                }}
                columns={[
                    {
                        title: t('Наименование агента'),
                        dataIndex: 'agent',
                        render:(_,item)=>get(item, 'agent.person.name') ? `${get(item, 'agent.person.secondname')} ${get(item, 'agent.person.name')} ${get(item, 'agent.person.middlename')}` : get(item, 'agent.organization.nameoforganization'),
                        width:150,
                    },
                    {
                        title: t('Агентское вознаграждение(минимум (%))'),
                        dataIndex: 'commission',
                        align: 'center',
                        editable:true,
                        render: (_, record, index) => (
                            <InputNumber
                                value={get(record, 'commission.minimumPercent',0)}
                                onChange={(e) => {
                                    const newData = [...dataSource]
                                    setDataSource(newData);
                                }}
                            />
                        ),
                        width:100,
                        hideInSearch:true
                    },
                    {
                        title: t('Агентское вознаграждение(максимум (%))'),
                        dataIndex: 'commission',
                        align: 'center',
                        editable:true,
                        render: (_, record, index) => (
                            <InputNumber
                                value={get(record, 'commission.maximumPercent',0)}
                                onChange={(e) => {
                                    const newData = [...dataSource];
                                    newData[index]['commission.maximumPercent'] = e.target.value;
                                    setDataSource(newData);
                                }}
                            />
                        ),
                        width:100,
                        hideInSearch:true
                    },
                    {
                        title: t('Расчетный счет'),
                        dataIndex: 'checkingAccount',
                        align: 'center',
                        width:350,
                        render: (_, record, index) => (
                            <Input
                                value={get(record, 'checkingAccount')}
                                onChange={(e) => {
                                    const newData = [...dataSource];
                                    newData[index].checkingAccount = e.target.value;
                                    setDataSource(newData);
                                }}
                            />
                        ),
                    },
                ]}
                actionRef={actionRef}
                cardBordered
                pagination={false}
                rowKey={'id'}
                toolBarRender={false}
                revalidateOnFocus
                defaultSize={'small'}
            />
            <Button loading={isPending} onClick={update} type={'primary'} className={'mt-6 min-w-80'}>{t("Сохранить")}</Button>
        </>
    );
};

export default AgentCommissionPage;
