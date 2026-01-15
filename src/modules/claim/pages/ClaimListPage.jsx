import React, {useEffect, useRef} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useTranslation} from "react-i18next";
import {Button, Modal, Space, Tag} from "antd";
import {DownloadOutlined, EditOutlined, PlusOutlined, EyeOutlined, DeleteOutlined,ExclamationCircleFilled} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {CLAIM_STATUS_LIST, PERSON_TYPE} from "../../../constants";
import {get, isEqual, values} from "lodash";
import {useDeleteQuery, useGetAllQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData} from "../../../utils";
import numeral from "numeral";
import {useStore} from "../../../store";
import router from "../../../router";
const { confirm } = Modal;

const ClaimListPage = () => {
    const {user} = useStore()
    const {t} = useTranslation();
    const actionRef = useRef();
    const navigate = useNavigate();
    const {mutate, isPending} = useDeleteQuery({})
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

    const remove = (_id) => {
        mutate({
            url: `${URLS.claimDelete}?claimNumber=${_id}`,
        }, {
            onSuccess: () => {
                actionRef.current?.reload()
            }
        })
    }

    const showDeleteConfirm = (_id) => {
        confirm({
            title: t('Вы хотите удалить?'),
            icon: <ExclamationCircleFilled />,
            okText: 'Да',
            okType: 'danger',
            cancelText: 'Нет',
            onOk() {
                remove(_id)
            },
            onCancel() {

            },
        });
    };
    useEffect(() => {
        if(isEqual(get(user,'role.name'),'sek-member')){
            navigate(`/claims/jurnal`)
        }
    }, [user]);
    console.log('user',user)
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
                        render:(_,record)=>get(record,'regNumber',get(record,'claimNumber'))
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
                        align: 'center',
                        width: 125,
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: get(statusList, 'data', [])?.map(item => ({value: item, label: item})) || [],
                        },
                        render: (text) => <Tag color={get(CLAIM_STATUS_LIST, `${text}`, 'default')}>{t(text)}</Tag>,
                        hideInSearch: true,
                    },
                    {
                        title: t('Статус'),
                        dataIndex: 'status',
                        valueType: 'select',
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: get(statusList, 'data', [])?.map(item => ({value: item, label: t(item)})) || [],
                        },
                        hideInTable: true,
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
                            options: values(PERSON_TYPE)?.map(item => ({value: item, label: t(item)})) || [],
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
                        render: (text) => get(text, 'product.risk', [])?.map(item => get(item, 'insuranceClass.name'))?.join(', '),
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
                        dataIndex: 'policy',
                        hideInSearch: true,
                        width: 200,
                        align: 'center',
                        render: (text) => <span>{dayjs(get(text, 'startDate')).format('YYYY-MM-DD')} / {dayjs(get(text, 'endDate')).format('YYYY-MM-DD')}</span>,
                    },
                    {
                        title: t('Страховая сумма'),
                        dataIndex: 'policy',
                        hideInSearch: true,
                        width: 150,
                        align: 'center',
                        render: (text) => numeral(get(text, 'insuranceSum')).format('0,0.00')
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
                        dataIndex: 'agreement',
                        hideInSearch: true,
                        width: 150,
                        align: 'center',
                        render: (text) => get(text, 'objectOfInsurance', [])?.map(({type}) => t(type))?.join(', '),
                    },
                    {
                        title: t('Сумма заявленного убытка'),
                        dataIndex: 'totalDamageSum',
                        render: (text) => numeral(text).format('0,0.00'),
                        hideInSearch: true,
                        width: 150,
                        align: 'center',
                    },
                    {
                        title: t('Сумма выплаты'),
                        dataIndex: 'totalPaymentSum',
                        render: (text) => numeral(text).format('0,0.00'),
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
                        dataIndex: 'payment',
                        render: (text) => get(text, '[0].payoutDate') ? dayjs(get(text, '[0].payoutDate')).format('YYYY-MM-DD') : '-',
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
                        dataIndex: 'conclusionDUSP',
                        render: (text) => get(text, 'regress'),
                        width: 100,
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Дата регресса'),
                        dataIndex: 'conclusionDUSP',
                        render: (text) => get(text, 'regressDate'),
                        width: 100,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Доля перестраховщиков'),
                        dataIndex: 'decision',
                        render: (text) => numeral(get(text, 'decision.reinsurerShare',0)).format('0,0.00'),
                        width: 125,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Действия'),
                        dataIndex: 'id',
                        fixed: 'right',
                        align: 'right',
                        width: 125,
                        hideInSearch: true,
                        render: (_id, record) => <Space>
                            {!isEqual(get(record, 'status'), 'draft') &&
                                <Button onClick={() => navigate(`/claims/view/${get(record, 'claimNumber')}`)}
                                        className={'cursor-pointer'}
                                        icon={<EyeOutlined/>}/>}
                            {isEqual(get(record, 'status'), 'draft') &&
                                <Button onClick={() => navigate(`/claims/edit/${get(record, 'claimNumber')}`)}
                                        className={'cursor-pointer'}
                                        icon={<EditOutlined/>}/>}
                            <Button onClick={()=>showDeleteConfirm(get(record, 'claimNumber'))} danger
                                    className={'cursor-pointer'}
                                    icon={<DeleteOutlined/>}/>

                        </Space>
                    }

                ]}
                url={`${URLS.claims}`}>
                {() => <Space>
                    <Button type={'dashed'} icon={<DownloadOutlined/>}>
                        {t('Отчет')}
                    </Button>
                </Space>}
            </Datagrid>


        </>
    );
};

export default ClaimListPage;
