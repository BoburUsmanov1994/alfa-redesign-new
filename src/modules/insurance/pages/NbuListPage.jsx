import React, {useRef, useState} from 'react';
import {Button, notification, Space} from "antd";
import {DownloadOutlined} from "@ant-design/icons";
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {request} from "../../../services/api";
import {URLS} from "../../../constants/url";
import {get} from "lodash";

const NbuListPage = () => {
    const {t} = useTranslation()
    const formRef = useRef(null);
    const [loadingReport, setLoadingReport] = useState(false);

    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Страхование кредитов НБУ')}
            />
            <Datagrid
                rowKey={'createdAt'}
                responseListKeyName={'docs'}
                formRef={formRef}
                defaultCollapsed
                columns={[

                    {
                        title: t('Имя клиента'),
                        dataIndex: 'client_name',
                        render: (_, _tr) => get(_tr, 'insurant.client_name'),
                        width: 250
                    },
                    {
                        title: t('ПИНФЛ'),
                        dataIndex: 'client_pinfl',
                        render: (_, _tr) => get(_tr, 'insurant.client_pinfl'),
                        width: 150
                    },
                    {
                        title: t('Дата рождения'),
                        dataIndex: 'client_birthday',
                        valueType: 'date',
                        render: (_, _tr) => get(_tr, 'insurant.client_birthday'),
                        width: 150,
                        align: 'center',
                    },
                    {
                        title: t('Название кредита'),
                        dataIndex: 'credit_name',
                        render: (_, _tr) => get(_tr, 'policies.credit_name'),
                        width: 200
                    },
                    {
                        title: t('Сумма кредита в центах'),
                        dataIndex: 'credit_amount_in_cents',
                        valueType: 'digit',
                        fieldProps: {
                            style: {width: '100%'},
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        align: 'right',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'policies.credit_amount_in_cents', 0)),
                        width: 175
                    },
                    {
                        title: t('Дата начала кредита'),
                        dataIndex: 'begin_credit_date',
                        render: (text, record) => get(record, 'policies.begin_credit_date'),
                        valueType: 'date',
                        hideInSearch: true,
                        align: 'center',
                        width: 125
                    },
                    {
                        title: t('Дата окончания кредита'),
                        dataIndex: 'end_credit_date',
                        render: (text, record) => get(record, 'policies.end_credit_date'),
                        valueType: 'date',
                        hideInSearch: true,
                        align: 'center',
                        width: 125
                    },
                    {
                        title: t('Дата кредита'),
                        dataIndex: 'date',
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                begin_credit_date: value[0],
                                end_credit_date: value[1],
                            }),
                        },
                        hideInTable:true,
                    },
                    {
                        title: t('Номер полиса'),
                        dataIndex: 'policy_number',
                        render: (text, record) => get(record, 'policies.policy_number'),
                        align: 'center',
                        width: 150
                    },
                    {
                        title: t('Cтраховая сумма в центах'),
                        dataIndex: 'insurance_amount_in_cents',
                        valueType: 'digit',
                        align: 'right',
                        fieldProps: {
                            style: {width: '100%'},
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        render: (_, record) =>  Intl.NumberFormat('en-US')?.format(get(record, 'policies.insurance_amount_in_cents', 0)),
                        width: 125
                    },
                    {
                        title: t('Cтраховая премия в центах'),
                        dataIndex: 'insurance_premium_in_cents',
                        valueType: 'digit',
                        align: 'right',
                        fieldProps: {
                            style: {width: '100%'},
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        render: (_, record) =>  Intl.NumberFormat('en-US')?.format(get(record, 'policies.insurance_premium_in_cents', 0)),
                        width: 125
                    },
                    {
                        title: t('Скачать'),
                        dataIndex: 'policies.url',
                        align: 'center',
                        valueType: 'link',
                        render: (_, record) => <Button size={'large'} icon={<DownloadOutlined />} type={'link'} href={get(record,'policies.url','#')} target={'_blank'} />,
                        hideInSearch:true,
                        width: 80,
                    },
                ]}
                url={`${URLS.nbuIntegrations}`}>
                {() => <Space>
                    <Button loading={loadingReport} type={'dashed'} icon={<DownloadOutlined/>} onClick={() => {
                        setLoadingReport(true)
                        request.get(URLS.nbuPortfelReport, {
                            responseType: 'blob',
                            params: {
                            },
                        }).then(res => {
                            const blob = new Blob([res.data], { type: res.data.type });
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl,'_self')
                            notification['success']({
                                message: 'Успешно'
                            })
                        }).catch((err) => {
                            notification['error']({
                                message: err?.response?.data?.message || 'Ошибка'
                            })
                        }).finally(() => {
                            setLoadingReport(false)
                        })
                    }}>
                        {t('Отчет')}
                    </Button>
                </Space>}
            </Datagrid>
        </>
    );
};

export default NbuListPage;
