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

const OsagoListPage = () => {
    const {t} = useTranslation()
    const formRef = useRef(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const {user} = useStore()

    const {data: branches, isLoading: isLoadingBranch} = useGetAllQuery({
        key: KEYS.branches, url: `${URLS.branches}/list`
    })
    const branchesList = getSelectOptionsListFromData(get(branches, `data.data`, []), '_id', 'branchName')

    if (isLoadingBranch) {
        return <Spin spinning fullscreen/>
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
                rowKey={'application_number'}
                responseListKeyName={'docs'}
                formRef={formRef}
                defaultCollapsed
                columns={[
                    {
                        title: t('Филиал'),
                        dataIndex: 'branch',
                        valueType: 'select',
                        hideInTable: true,
                        initialValue: get(user, 'branch._id'),
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: branchesList
                        }
                    },
                    {
                        title: t('Серия полиса'),
                        dataIndex: 'seria',
                        render: (_, record) => get(record, 'seria'),
                        width: 120,
                        align: 'right'
                    },
                    {
                        title: t('Номер полиса'),
                        dataIndex: 'number',
                        render: (_, record) => get(record, 'number'),
                        width: 120,
                    },
                    {
                        title: t('Собственник'),
                        dataIndex: 'owner',
                        render: (_, row) =>
                            get(row, "owner.applicantIsOwner")
                                ? get(row, "applicant.person")
                                    ? `${get(row, "applicant.person.fullName.lastname")} ${get(
                                        row,
                                        "applicant.person.fullName.firstname"
                                    )}  ${get(row, "applicant.person.fullName.middlename")}`
                                    : get(row, "applicant.organization.name")
                                : get(row, "owner.person")
                                    ? `${get(row, "owner.person.fullName.lastname")} ${get(
                                        row,
                                        "owner.person.fullName.firstname"
                                    )}  ${get(row, "owner.person.fullName.middlename")}`
                                    : get(row, "owner.organization.name"),
                        width: 250,
                        hideInSearch:true
                    },
                    {
                        title: t('Заявитель'),
                        dataIndex: 'applicant',
                        render: (_, row) => get(row, "applicant.person")
                            ? `${get(row, "applicant.person.fullName.lastname")} ${get(
                                row,
                                "applicant.person.fullName.firstname"
                            )}  ${get(row, "applicant.person.fullName.middlename")}`
                            : get(row, "applicant.organization.name"),
                        width: 250
                    },

                    {
                        title: t('Транспортное средство'),
                        dataIndex: 'modelCustomName',
                        render: (_, record) => get(record, 'vehicle.modelCustomName'),
                        width: 180,
                        align: 'center'
                    },
                    {
                        title: t('Страховая сумма'),
                        dataIndex: 'sumInsured',
                        valueType: 'digit',
                        fieldProps: {
                            style: {width: '100%'},
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        align: 'right',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'cost.sumInsured', 0)),
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
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'cost.insurancePremium', 0)),
                        width: 175
                    },

                    {
                        title: t('Оплачено'),
                        dataIndex: 'insurancePremiumPaidToInsurer',
                        valueType: 'digit',
                        align: 'right',
                        render: (_, record) =>  Intl.NumberFormat('en-US')?.format(get(record, 'cost.insurancePremiumPaidToInsurer', 0)),
                        width: 175
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
                        width: 100,
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
                url={`${URLS.osagoList}`}>
                {({actionRef}) => <Space>
                    <Button loading={loadingReport} type={'dashed'} icon={<DownloadOutlined/>} onClick={() => {
                        setLoadingReport(true)
                        const {
                            date,
                            ...rest
                        } = formRef?.current?.getFieldsValue?.()
                        const {current, pageSize} = actionRef?.current?.pageInfo
                        request.get(URLS.osgagoPortfelReport, {
                            responseType: 'blob',
                            params: {
                                page: current,
                                limit: pageSize,
                                ...rest
                            },
                        }).then(res => {
                            const blob = new Blob([res.data], {type: res.data.type});
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl, '_self')
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

export default OsagoListPage;
