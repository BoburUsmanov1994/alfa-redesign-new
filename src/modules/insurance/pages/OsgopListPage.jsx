import React, {useRef, useState} from 'react';
import {Button, notification, Space, Spin, Tag} from "antd";
import {DownloadOutlined, PlusOutlined} from "@ant-design/icons";
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {request} from "../../../services/api";
import {URLS} from "../../../constants/url";
import {getSelectOptionsListFromData} from "../../../utils";
import {get, head, isEqual, last} from "lodash";
import dayjs from "dayjs";
import {STATUS_LIST, STATUS_LIST_COLOR} from "../../../constants";
import {useGetAllQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {useStore} from "../../../store";

const OsgopListPage = () => {
    const {t} = useTranslation()
    const formRef = useRef(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const {user} = useStore()

    const {data: branches,isLoading:isLoadingBranch} = useGetAllQuery({
        key: KEYS.branches, url: `${URLS.branches}/list`
    })
    const branchesList = getSelectOptionsListFromData(get(branches, `data.data`, []), '_id', 'branchName')

    if(isLoadingBranch){
        return <Spin spinning fullscreen />
    }
    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Список соглашений')}
                extra={[
                    <Button type="primary" icon={<PlusOutlined/>}>
                        {t('Добавить')}
                    </Button>,
                ]}
            />
            <Datagrid
                rowKey={'osgop_formId'}
                responseListKeyName={'docs'}
                formRef={formRef}
                defaultCollapsed
                columns={[
                    {
                        title: t('Филиал'),
                        dataIndex: 'branch',
                        valueType: 'select',
                        hideInTable: true,
                        initialValue:get(user,'branch._id'),
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: branchesList
                        }
                    },
                    {
                        title: t('Номер соглашения'),
                        dataIndex: 'number',
                        copyable: true,
                        width: 185,
                    },
                    {
                        title: t('Серия полиса'),
                        dataIndex: 'seriaPolicy',
                        render: (_, record) => get(record, 'policies[0].seria'),
                        width: 120,
                        align: 'right'
                    },
                    {
                        title: t('Номер полиса'),
                        dataIndex: 'numberPolicy',
                        render: (_, record) => get(record, 'policies[0].number'),
                        width: 120,
                    },
                    {
                        title: t('ИНН/ ПИНФЛ'),
                        dataIndex: 'innOrpinfl',
                        render: (_, record) => get(record,'insurant.person.passportData.pinfl',get(record, 'insurant.organization.inn')),
                        width: 150,
                        align: 'center',
                    },
                    {
                        title: t('Страхователь'),
                        dataIndex: 'insurant',
                        render: (_, _tr) => get(_tr, 'insurant.organization.name', `${get(_tr, 'insurant.person.fullName.lastname', '-')} ${get(_tr, 'insurant.person.fullName.firstname', '-')} ${get(_tr, 'insurant.person.fullName.middlename', '-')}`),
                        width: 250
                    },
                    {
                        title: t('Собственник'),
                        dataIndex: 'owner',
                        render: (_, _tr) => get(_tr, 'owner.organization.name', `${get(_tr, 'owner.person.fullName.lastname', '-')} ${get(_tr, 'owner.person.fullName.firstname', '-')} ${get(_tr, 'owner.person.fullName.middlename', '-')}`),
                        width: 250
                    },
                    {
                        title: t('Гос.номер ТС'),
                        dataIndex: 'govNumber',
                        render: (_, record) => get(record, 'policies[0].objects[0].vehicle.govNumber'),
                        width: 125,
                        align:'center'
                    },
                    {
                        title: t('Страховая сумма'),
                        dataIndex: 'insuranceSum',
                        valueType: 'digit',
                        fieldProps: {
                            style: {width: '100%'},
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        align: 'right',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'sum', 0)),
                        width: 175
                    },
                    {
                        title: t('Страховая премия'),
                        dataIndex: 'insurancePremium',
                        valueType: 'digit',
                        fieldProps: {
                            style: {width: '100%'},
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        align: 'right',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'premium', 0)),
                        width: 125
                    },
                    {
                        title: t('Дата начало периода полиса'),
                        dataIndex: 'contractStartDate',
                        render: (text, record) => get(record, 'contractStartDate') ? dayjs(get(record, 'contractStartDate')).format('DD.MM.YYYY'):'-',
                        valueType: 'date',
                        hideInSearch: true,
                        align: 'center',
                        width: 100
                    },
                    {
                        title: t('Дата окончания периода полиса'),
                        dataIndex: 'contractEndDate',
                        render: (text, record) => get(record, 'contractEndDate') ? dayjs(get(record, 'contractEndDate')).format('DD.MM.YYYY'):'-',
                        valueType: 'date',
                        hideInSearch: true,
                        align: 'center',
                        width: 100
                    },
                    {
                        title: t('Дата  периода полиса'),
                        dataIndex: 'date',
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                startDate: value[0],
                                endDate: value[1],
                            }),
                        },
                        hideInTable:true,
                    },
                    {
                        title: t('Дата выдачи полиса'),
                        dataIndex: 'sentDate',
                        render: (text, record) => get(record, 'sentDate') ? dayjs(get(record, 'sentDate')).format('DD.MM.YYYY'):'-',
                        valueType: 'date',
                        align: 'center',
                        width: 100
                    },
                    {
                        title: t('Оплачено'),
                        dataIndex: 'insurancePremium',
                        valueType: 'digit',
                        align: 'right',
                        render: (_, record) => isEqual(get(record,'status'),"payed") ? Intl.NumberFormat('en-US')?.format(get(record, 'premium', 0)):0,
                        hideInSearch: true,
                        width: 125
                    },
                    {
                        title: t('Статус'),
                        dataIndex: 'status',
                        align: 'center',
                        valueType: 'select',
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: STATUS_LIST || [],
                        },
                        render: (_, record) => <Tag className={'mx-auto'}
                                                    color={STATUS_LIST_COLOR[get(record, 'status')] || 'default'}>{get(record, 'status')}</Tag>,
                        width: 80,
                    },
                    {
                        title: t('Скачать'),
                        dataIndex: 'status',
                        align: 'center',
                        valueType: 'link',
                        render: (_, record) => <Button size={'large'} icon={<DownloadOutlined />} type={'link'} href={get(record,'url','#')} target={'_blank'} />,
                        hideInSearch:true,
                        width: 80,
                    },
                    {
                        title: t('Действия'),
                        valueType: 'option',
                        align: 'right',
                        render: (text, record, _, action) => [
                            <Button size={'small'} className={'mx-auto'} key="edit" type="link"
                                    onClick={() => console.log('Edit', record)}>
                                {t('Редактировать')}
                            </Button>,
                            <Button size={'small'} className={'mx-auto'} key="delete" type="link" danger
                                    onClick={() => console.log('Delete', record)}>
                                {t('Удалить')}
                            </Button>,
                        ],
                        width: 200,
                    },
                ]}
                url={`${URLS.osgopList}`}>
                {({actionRef}) => <Space>
                    <Button loading={loadingReport} type={'dashed'} icon={<DownloadOutlined/>} onClick={() => {
                        setLoadingReport(true)
                        const {
                          date,
                            ...rest
                        } = formRef?.current?.getFieldsValue?.()
                        const {current, pageSize} = actionRef?.current?.pageInfo
                        request.get(URLS.osgopPortfelReport, {
                            responseType: 'blob',
                            params: {
                                page: current,
                                limit: pageSize,
                                startDate: head(date),
                                endDate: last(date),
                                ...rest
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
                        {t('Отчет по портфелю')}
                    </Button>
                </Space>}
            </Datagrid>
        </>
    );
};

export default OsgopListPage;
