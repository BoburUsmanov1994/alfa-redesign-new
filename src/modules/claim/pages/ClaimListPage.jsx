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
                        width: 150,
                    },
                    {
                        title: t('Дата заявления'),
                        dataIndex: 'claimDate',
                        render: (text) => dayjs(text).format('YYYY-MM-DD HH:mm'),
                        width: 150,
                        valueType: 'dateRange',
                    },
                    {
                        title: t('Статус'),
                        dataIndex: 'status',
                        valueType: 'select',
                        width: 100,
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: keys(CLAIM_STATUS_LIST)?.map(item => ({value: item, label: item})) || [],
                        },
                        render: (text) => <Tag color={CLAIM_STATUS_LIST[text] || 'default'}>{text}</Tag>
                    },
                    {
                        title: t('Юр/физ'),
                        dataIndex: 'applicant',
                        valueType: 'select',
                        width: 100,
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: values(PERSON_TYPE)?.map(item => ({value: item, label: item})) || [],
                        },
                        render: (text) => get(text, 'organization.name') ? t('Юр') : t('физ')
                    },
                    {
                        title: t('Филиал'),
                        width: 175,
                        dataIndex: 'branch',
                        valueType: 'select',
                        render: (_, record) => get(record, 'branch.branchName'),
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: branches
                        },
                    },
                    {
                        title: t('Страховой продукт'),
                        dataIndex: 'product',
                        render: (text) => get(text, 'name'),
                        width: 175,
                    },
                    {
                        title: t('Классы страхования'),
                        dataIndex: 'product',
                        render: (text) => get(text, 'name'),
                        hideInSearch: true,
                        width: 175,
                    },
                    {
                        title: t('Серия и номер полиса'),
                        dataIndex: 'polisSeria',
                        render: (text, record) => <span>{text} {get(record, 'polisNumber')}</span>,
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
                        valueType: 'dateRange',
                        width: 100,
                        align: 'center',
                    },
                    {
                        title: t('Страховой риск'),
                        dataIndex: 'insuranceRisk',
                        hideInSearch: true,
                        width: 150,
                    },
                    {
                        title: t('Объект страхования'),
                        dataIndex: 'claimType',
                        render: (text) => get(text, 'type'),
                        hideInSearch: true,
                        width: 150
                    },
                    {
                        title: t('Сумма заявленного убытка'),
                        dataIndex: 'claimType',
                        render: (text) => '-',
                        hideInSearch: true,
                        width: 150
                    },
                    {
                        title: t('Сумма выплаты'),
                        dataIndex: 'claimType',
                        render: (text) => '-',
                        hideInSearch: true,
                        width: 150
                    },
                    {
                        title: t('Дата урегулирования'),
                        dataIndex: 'claimType',
                        render: (text) => '-',
                        valueType: 'dateRange',
                        width: 100,
                        align: 'center',
                    },
                    {
                        title: t('Дата выплаты'),
                        dataIndex: 'claimType',
                        render: (text) => '-',
                        valueType: 'dateRange',
                        width: 100,
                        align: 'center',
                    },
                    {
                        title: t('Регресс'),
                        dataIndex: 'claimType',
                        render: (text) => '-',
                        width: 100,
                        hideInSearch: true,
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
                        align: 'center',
                        width: 250,
                        render: (_id) => <Space>
                            <Button onClick={() => navigate(`/claims/view/${_id}`)} className={'cursor-pointer'}
                                    icon={<EyeOutlined/>}>{t('Детали')}</Button>
                            <Button onClick={() => navigate(`/claims/edit/${_id}`)} className={'cursor-pointer'}
                                    icon={<EditOutlined/>}>{t('Редактировать')}</Button>
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
