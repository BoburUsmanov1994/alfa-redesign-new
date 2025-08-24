import React, {useRef} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useTranslation} from "react-i18next";
import {Button, Space, Tag} from "antd";
import {DownloadOutlined, EditOutlined, PlusOutlined, EyeOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {CLAIM_STATUS_LIST, PERSON_TYPE} from "../../../constants";
import {get, keys, values} from "lodash";
import {useGetAllQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData} from "../../../utils";


const ClaimListPage = () => {
    const {t} = useTranslation();
    const actionRef = useRef();
    const navigate = useNavigate();
    let {data: branches} = useGetAllQuery({
        key: KEYS.branches, url: `${URLS.branches}/list`, params: {
            params: {
                limit: 100
            }
        }
    })
    branches = getSelectOptionsListFromData(get(branches, `data.data`, []), '_id', 'branchName')

    let {data: statusList} = useGetAllQuery({
        key: KEYS.claimStatus, url: `${URLS.claimStatus}`, params: {
            params: {
                limit: 100
            }
        }
    })
    console.log('statusList', statusList)
    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Претензионный портфель')}
                extra={[
                    <Button onClick={() => navigate('/claims/create')} type="primary" icon={<PlusOutlined/>}>
                        {t('Добавить')}
                    </Button>,
                ]}
            />
            <Datagrid
                span={4}
                rowKey={'_id'}
                responseListKeyName={'docs'}
                actionRef={actionRef}
                columns={[
                    {
                        title: t('Номер заявления'),
                        dataIndex: 'claimNumber',
                        width: 100,
                        align: 'center',
                    },
                    {
                        title: t('Дата заявления'),
                        dataIndex: 'claimDate',
                        render: (text) => dayjs(text).format('YYYY-MM-DD'),
                        width: 100,
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Дата заявления'),
                        dataIndex: 'claimDate',
                        width: 150,
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                startDate: value[0],
                                endDate: value[1],
                            }),
                        },
                        hideInTable: true,
                    },
                    {
                        title: t('Статус'),
                        dataIndex: 'status',
                        valueType: 'select',
                        width: 100,
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: get(statusList, 'data', [])?.map(item => ({value: item, label: item})) || [],
                        },
                        render: (text) => <Tag color={get(CLAIM_STATUS_LIST, `${text}`, 'blue')}>{text}</Tag>
                    },
                    {
                        title: t('Юр/физ'),
                        dataIndex: 'applicant',
                        width: 100,
                        align: 'center',
                        hideInSearch: true,
                        render: (text) => get(text, 'organization.name') ? t('Юр') : t('физ')
                    },
                    {
                        title: t('Юр/физ'),
                        dataIndex: 'applicant',
                        valueType: 'select',
                        width: 100,
                        align: 'center',
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: values(PERSON_TYPE)?.map(item => ({value: item, label: item})) || [],
                        },
                        hideInTable: true,
                    },
                    {
                        title: t('Филиал'),
                        width: 175,
                        dataIndex: 'agreement',
                        render: (_, record) => get(record, 'agreement.branch.branchName'),
                        hideInSearch: true,
                    },
                    {
                        title: t('Филиал'),
                        valueType: 'select',
                        dataIndex: 'branch',
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: branches
                        },
                        hideInTable: true,
                    },
                    {
                        title: t('Страховой продукт'),
                        dataIndex: 'product',
                        render: (text) => get(text, 'name'),
                        width: 200,
                    },
                    {
                        title: t('Классы страхования'),
                        dataIndex: 'agreement',
                        render: (text) => get(text,'product.risk',[])?.map(item=>get(item,'insuranceClass.name'))?.join(', '),
                        hideInSearch: true,
                        align: 'center',
                        width: 175,
                    },
                    {
                        title: t('Серия и номер полиса'),
                        dataIndex: 'policy',
                        align: 'center',
                        render: (text, record) => <span>{get(record, 'polisSeria')}{get(record, 'polisNumber')}</span>,
                        width: 175,
                    },
                    {
                        title: t('Период страхования'),
                        dataIndex: 'polisDate',
                        hideInSearch: true,
                        width: 100,
                        align: 'center',
                    },
                    {
                        title: t('Страховая сумма'),
                        dataIndex: 'insuranceSum',
                        hideInSearch: true,
                        width: 125,
                        align: 'center',
                    },
                    {
                        title: t('Дата события'),
                        dataIndex: 'eventCircumstances',
                        render: (text) => dayjs(get(text, 'eventDateTime')).format('YYYY-MM-DD HH:mm'),
                        width: 150,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Дата события'),
                        dataIndex: 'eventCircumstances',
                        valueType: 'dateRange',
                        hideInTable: true,
                        search: {
                            transform: (value) => ({
                                eventStart: value[0],
                                eventEnd: value[1],
                            }),
                        },
                    },
                    {
                        title: t('Страховой риск'),
                        dataIndex: 'insuranceRisk',
                        hideInSearch: true,
                        width: 150,
                        align: 'center',
                    },
                    {
                        title: t('Объект страхования'),
                        dataIndex: 'claimType',
                        render: (text) => get(text, 'type'),
                        hideInSearch: true,
                        width: 150,
                        align: 'center',
                    },
                    {
                        title: t('Сумма заявленного убытка'),
                        dataIndex: 'claimType',
                        render: (text) => '-',
                        hideInSearch: true,
                        width: 150,
                        align: 'center',
                    },
                    {
                        title: t('Сумма выплаты'),
                        dataIndex: 'claimType',
                        render: (text) => '-',
                        hideInSearch: true,
                        width: 150,
                        align: 'center',
                    },
                    {
                        title: t('Дата урегулирования'),
                        dataIndex: 'settlementDate',
                        width: 100,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Дата урегулирования'),
                        dataIndex: 'settlementDate',
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                settlementStart: value[0],
                                settlementEnd: value[1],
                            }),
                        },
                        hideInTable: true,
                    },
                    {
                        title: t('Дата выплаты'),
                        dataIndex: 'paymentDate',
                        width: 100,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Дата выплаты'),
                        dataIndex: 'paymentDate',
                        width: 100,
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                paymentStart: value[0],
                                paymentEnd: value[1],
                            }),
                        },
                        align: 'center',
                        hideInTable: true,
                    },
                    {
                        title: t('Регресс'),
                        dataIndex: 'claimType',
                        render: (text) => '-',
                        width: 100,
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Дата регресса'),
                        dataIndex: 'claimType',
                        render: (text) => '-',
                        width: 100,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Доля перестраховщиков'),
                        dataIndex: 'claimType',
                        render: (text) => '-',
                        width: 125,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Действия'),
                        dataIndex: 'id',
                        fixed: 'right',
                        align: 'right',
                        width: 100,
                        hideInSearch: true,
                        render: (_id, record) => <Space>
                            <Button onClick={() => navigate(`/claims/view/${get(record, 'claimNumber')}`)}
                                    className={'cursor-pointer'}
                                    icon={<EyeOutlined/>} />
                            <Button onClick={() => navigate(`/claims/edit/${get(record, 'claimNumber')}`)}
                                    className={'cursor-pointer'}
                                    icon={<EditOutlined/>} />
                        </Space>
                    }

                ]}
                url={`${URLS.claims}`}>
                {({actionRef}) => <Space>
                    <Button type={'dashed'} icon={<DownloadOutlined/>}>
                        {t('Отчет')}
                    </Button>
                </Space>}
            </Datagrid>
        </>
    );
};

export default ClaimListPage;
