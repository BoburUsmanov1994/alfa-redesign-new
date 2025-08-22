import React, {useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {Button, notification, Space, Spin, Tag} from "antd";
import { PlusOutlined,DownloadOutlined} from "@ant-design/icons"
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {getSelectOptionsListFromData} from "../../../utils";
import {get, head, last} from "lodash";
import {request} from "../../../services/api";
import dayjs from "dayjs";
import {useGetAllQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {STATUS_LIST, STATUS_LIST_COLOR} from "../../../constants";
import {useStore} from "../../../store";
import {useNavigate} from "react-router-dom";



const AgreementsPage = () => {
    const {t}=useTranslation()
    const navigate = useNavigate();
    const formRef = useRef(null);
    const {user} = useStore()
    const [group,setGroup] = useState(null);
    const [subGroup,setSubGroup] = useState(null);
    const [loading,setLoading] = useState(false);
    const [loadingReport,setLoadingReport] = useState(false);

    let {data: subGroups} = useGetAllQuery({
        key: KEYS.subgroupsofproductsFilter,
        url: URLS.subgroupsofproductsFilter,
        params: {
            params: {
                group
            }
        },
        enabled: !!group
    })
    let {data: products} = useGetAllQuery({
        key: [KEYS.productsfilter, subGroup],
        url: URLS.products,
        params: {
            params: {
                subGroup: subGroup
            }
        },
        enabled: !!subGroup
    })
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
                className={'p-0 mb-1.5'}
                title={t('Соглашения')}
                extra={[
                    <Button onClick={()=>navigate('/agreements/create')}  type="primary" icon={<PlusOutlined  />}>
                        {t('Добавить')}
                    </Button>,
                ]}
            />
            <Datagrid
                formRef={formRef}
                defaultCollapsed
                columns={[
                    {
                        title:t('Филиал'),
                        dataIndex: 'branch',
                        valueType: 'select',
                        hideInTable: true,
                        initialValue:get(user,'branch._id'),
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options:branchesList
                        },
                    },
                    {
                        title:t('Номер соглашения'),
                        dataIndex: 'agreementNumber',
                        copyable: true,
                        width: 185,
                    },
                    {
                        title:t('Дата соглашения'),
                        dataIndex: 'agreementDate',
                        render: (text,record) => dayjs(get(record,'agreementDate')).format('DD.MM.YYYY'),
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                agreementDateFrom: value[0],
                                agreementDateTo: value[1],
                            }),
                        },
                        align:'center',
                        width:85
                    },
                    {
                        title:t('Страхователь'),
                        dataIndex: 'insurant',
                        render: (_,_tr) => get(_tr, 'insurant.organization.name', `${get(_tr, 'insurant.person.fullName.lastname', '-')} ${get(_tr, 'insurant.person.fullName.firstname', '-')} ${get(_tr, 'insurant.person.fullName.middlename', '-')}`),
                        width:175
                    },
                    {
                        title:t('Выгодоприобретатель'),
                        dataIndex: 'beneficiary',
                        render: (_,_tr) => get(_tr, 'beneficiary.organization.name', `${get(_tr, 'beneficiary.person.fullName.lastname', '-')} ${get(_tr, 'beneficiary.person.fullName.firstname', '-')} ${get(_tr, 'beneficiary.person.fullName.middlename', '-')}`),
                        width:175
                    },
                    {
                        title:t('Начало страхования'),
                        dataIndex: 'startOfInsurance',
                        render: (text,record) => dayjs(get(record,'startOfInsurance')).format('DD.MM.YYYY'),
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                startOfInsuranceFrom: value[0],
                                startOfInsuranceTo: value[1],
                            }),
                        },
                        align:'center',
                        width:85
                    },
                    {
                        title:t('Окончание страхования'),
                        dataIndex: 'endOfInsurance',
                        render: (text,record) => dayjs(get(record,'endOfInsurance')).format('DD.MM.YYYY'),
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                endOfInsuranceFrom: value[0],
                                endOfInsuranceTo: value[1],
                            }),
                        },
                        align:'center',
                        width:85
                    },
                    {
                        title:t('Выберите категорию'),
                        dataIndex: 'group',
                        valueType: 'select',
                        hideInTable: true,
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            onChange:setGroup,
                        },
                        request: async () => {
                            const groups =  await request.get(`${URLS.groupsofproducts}/list`)
                            return getSelectOptionsListFromData(get(groups, `data.data`, []), '_id', 'name')
                        },
                    },
                    {
                        title:t('Выберите подкатегорию'),
                        dataIndex: 'subGroup',
                        valueType: 'select',
                        hideInTable: true,
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: getSelectOptionsListFromData(get(subGroups, `data.data`, []), '_id', 'name') || [],
                            onChange:setSubGroup,
                        },
                    },
                    {
                        title:t('Наименование продукта'),
                        dataIndex: 'product',
                        valueType: 'select',
                        render:(_,row)=>get(row,'product.name'),
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: getSelectOptionsListFromData(get(products, `data.data`, []), '_id', 'name') || [],
                        },
                        width:190
                    },
                    {
                        title: t('Общая страховая сумма'),
                        dataIndex: 'totalInsuranceSum',
                        valueType: 'digit',
                        fieldProps: {
                            style: { width: '100%' },
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        align:'right',
                        hideInSearch: true,
                        width:120
                    },
                    {
                        title: t('Общая страховая сумма от'),
                        dataIndex: 'totalInsuranceSumFrom',
                        valueType: 'digit',
                        fieldProps: {
                            style: { width: '100%' },
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        hideInTable: true,
                    },
                    {
                        title: t('Общая страховая сумма до'),
                        dataIndex: 'totalInsuranceSumTo',
                        valueType: 'digit',
                        fieldProps: {
                            style: { width: '100%' },
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        hideInTable: true,
                    },
                    {
                        title: t('Общая страховая премия'),
                        dataIndex: 'totalInsurancePremium',
                        valueType: 'digit',
                        fieldProps: {
                            style: { width: '100%' },
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        align:'right',
                        hideInSearch: true,
                        width:100
                    },
                    {
                        title: t('Общая страховая премия от'),
                        dataIndex: 'totalInsurancePremiumFrom',
                        valueType: 'digit',
                        fieldProps: {
                            style: { width: '100%' },
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        hideInTable: true,
                    },
                    {
                        title: t('Общая страховая премия до'),
                        dataIndex: 'totalInsurancePremiumTo',
                        valueType: 'digit',
                        fieldProps: {
                            style: { width: '100%' },
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        hideInTable: true,
                    },
                    {
                        title:t('Номер полиса'),
                        dataIndex: 'policy[0].number',
                        hideInSearch: true,
                        align:'center',
                        render: (text, record) =>get(record, 'policy[0].number'),
                        width:80
                    },
                    {
                        title:t('Дата ввода в систему'),
                        dataIndex: 'createdAt',
                        render: (text,record) => dayjs(get(record,'createdAt')).format('DD.MM.YYYY'),
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                createdAtFrom: value[0],
                                createdAtTo: value[1],
                            }),
                        },
                        align:'center',
                        width:85
                    },
                    {
                        title:t('Статус'),
                        dataIndex: 'status',
                        align:'center',
                        valueType: 'select',
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: STATUS_LIST || [],
                        },
                        render:(_,record) => <Tag  className={'mx-auto'} color={STATUS_LIST_COLOR[get(record,'status')] || 'default'}>{get(record,'status')}</Tag>,
                        width:80,
                    },
                    {
                        title: t('Действия'),
                        valueType: 'option',
                        align:'right',
                        render: (text, record, _, action) => [
                            <Button size={'small'} className={'mx-auto'} key="edit" type="link" onClick={() => console.log('Edit', record)}>
                                {t('Редактировать')}
                            </Button>,
                            <Button size={'small'} className={'mx-auto'} key="delete" type="link" danger onClick={() => console.log('Delete', record)}>
                                {t('Удалить')}
                            </Button>,
                        ],
                        width:200,
                    },
                ]}
                url={`${URLS.agreements}/list`} >
                {({actionRef})=> <Space><Button loading={loading}  type={'dashed'}   icon={<DownloadOutlined />} onClick={() =>{
                    const {createdAtFrom,createdAtTo,branch} = formRef?.current?.getFieldsValue?.()
                    setLoading(true)
                    request.get(URLS.agreementWeeklyReport,{
                        params: {
                            createdAtFrom,
                            createdAtTo,
                            branch
                        },
                        responseType: 'blob',
                    }).then(res => {
                        const blob = new Blob([res.data], { type: res.data.type });
                        const blobUrl = URL.createObjectURL(blob);
                        window.open(blobUrl,'_self')
                        notification['success']({
                            message: 'Успешно'
                        })
                    }).catch((err)=>{
                        notification['error']({
                            message: err?.response?.data?.message || 'Ошибка'
                        })
                    }).finally(()=>{
                        setLoading(false)
                    })
                }}>
                    {t('Отчет')}
                </Button>
                    <Button loading={loadingReport}  type={'dashed'}   icon={<DownloadOutlined />} onClick={() =>{
                        setLoadingReport(true)
                        const {agreementDate,startOfInsurance,endOfInsurance,createdAt,...rest} = formRef?.current?.getFieldsValue?.()
                        const {current,pageSize} = actionRef?.current?.pageInfo
                        request.get(URLS.agreementPortfelReport,{
                            params: {
                                page:current,
                                limit:pageSize,
                                agreementDateFrom:head(agreementDate),
                                agreementDateTo: last(agreementDate),
                                startOfInsuranceFrom:head(startOfInsurance),
                                startOfInsuranceTo: last(startOfInsurance),
                                endOfInsuranceFrom:head(endOfInsurance),
                                endOfInsuranceTo: last(endOfInsurance),
                                createdAtFrom:head(createdAt),
                                createdAtTo: last(createdAt),
                                ...rest
                            },
                            responseType: 'blob',
                        }).then(res => {
                            const blob = new Blob([res.data], { type: res.data.type });
                            const blobUrl = URL.createObjectURL(blob);
                            window.open(blobUrl,'_self')
                            notification['success']({
                                message: 'Успешно'
                            })
                        }).catch((err)=>{
                            notification['error']({
                                message: err?.response?.data?.message || 'Ошибка'
                            })
                        }).finally(()=>{
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

export default AgreementsPage;
