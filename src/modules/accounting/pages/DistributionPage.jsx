import React, {useRef, useState} from 'react';
import {Button, Flex, Form, notification, Popconfirm, Select, Spin, Tooltip} from "antd";
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {get, isEmpty} from "lodash";
import dayjs from "dayjs";
import {KEYS} from "../../../constants/key";
import {useDeleteQuery, useGetAllQuery, usePostQuery} from "../../../hooks/api";
import {getSelectOptionsListFromData} from "../../../utils";
import {useNavigate} from "react-router-dom";
import {DeleteOutlined} from "@ant-design/icons";

const DistributionPage = () => {
    const {t} = useTranslation()
    const formRef = useRef(null);
    const actionRef = useRef(null);
    const navigate = useNavigate();
    const submitType = useRef(null);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const {
        mutate: distributeRequest,
        isPending
    } = usePostQuery({})
    const {
        mutate: deleteRequest
    } = useDeleteQuery({})

    let {data: branches} = useGetAllQuery({
        key: KEYS.branches, url: `${URLS.branches}/list`, params: {
            params: {
                limit: 100
            }
        }
    })
    branches = getSelectOptionsListFromData(get(branches, `data.data`, []), '_id', 'branchName')

    const distribute = (attrs) => {
        if (isEmpty(selectedKeys)) {
            notification['warning']({
                message: t('Пожалуйста, выберите строку')
            })
        } else {
            distributeRequest({
                url: URLS.transactionDistribute,
                attributes: {
                    ...attrs,
                    attach: submitType.current,
                    transactions: selectedKeys,
                }
            })
            navigate(`/accounting/policy`)
        }
    }
    const remove = (_id) => {
        deleteRequest({url: `api/transaction/${_id}`},{onSuccess:()=>{
                actionRef.current?.reload()
            }})
    }
    return (
        <Spin spinning={isPending}>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Распределение')}
                extra={<Form className={'flex !mb-0'} onFinish={distribute}
                             autoComplete="off">
                    <Form.Item name={'branch'} className={'mb-0 mr-3'} label={t('Филиалы')}
                               rules={[{required: true, message: t('Обязательное поле')}]}>
                        <Select placeholder={t('Выбирать')} className={'min-w-60'} options={branches}/>
                    </Form.Item>
                    <Form.Item className={'mb-0'} label={null}>
                        <Button onClick={() => (submitType.current = true)} type={'primary'}
                                htmlType={'submit'}>{t('Распределить')}</Button>
                        <Button onClick={() => (submitType.current = false)} type={'primary'} htmlType="submit" danger
                                className={'ml-2'}>{t('Открепить')}</Button>
                    </Form.Item>
                </Form>}
            />
            <Datagrid
                defaultCollapsed
                size={50}
                rowKey={'_id'}
                formRef={formRef}
                actionRef={actionRef}
                params={{
                    isAvailable:true
                }}
                rowSelection={{
                    selectedRowKeys: selectedKeys,
                    onChange: (keys) => {
                        setSelectedKeys(keys)
                    },
                }}
                columns={[

                    {
                        title: t('Статус прикрепления'),
                        dataIndex: 'status_of_attachment',
                        render: (_, _tr) => get(_tr, 'status_of_attachment'),
                        valueType:'select',
                        fieldProps:{
                            options:[{value: 'Новый', label: 'Новый'}, {value: 'Готов', label: 'Готов'}]
                        },
                        width: 125,
                        align:'center'
                    },
                    {
                        title: t('Филиал'),
                        dataIndex: 'branch',
                        valueType:'select',
                        fieldProps:{
                            options:branches
                        },
                        render: (_, _tr) => get(_tr, 'branch.branchName'),
                        width: 200
                    },
                    {
                        title: t('Дата п/п'),
                        dataIndex: 'payment_order_date',
                        width: 150,
                        valueType: 'dateRange',
                        render:(_,record)=>get(record,'payment_order_date'),
                        search: {
                            transform: (value) => ({
                                fromDate: value[0],
                                toDate: value[1],
                            }),
                        },
                        align: 'center',
                    },
                    {
                        title: t('Наименоменование отправителя'),
                        dataIndex: 'sender_name',
                        render: (_, _tr) => get(_tr, 'sender_name'),
                        width: 175,
                    },
                    {
                        title: t('Сумма поступления'),
                        dataIndex: 'payment_amount',
                        valueType: 'digitRange',
                        fieldProps: {
                            style: {width: '100%'},
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        search: {
                            transform: (value) => ({
                                payment_amount_from: value[0],
                                payment_amount_to: value[1],
                            }),
                        },
                        align: 'right',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'payment_amount', 0)),
                        width: 150
                    },
                    {
                        title: t('Снято на договор'),
                        dataIndex: 'attached_sum',
                        valueType: 'digitRange',
                        fieldProps: {
                            style: {width: '100%'},
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        search: {
                            transform: (value) => ({
                                attached_sum_from: value[0],
                                attached_sum_to: value[1],
                            }),
                        },
                        align: 'right',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'attached_sum', 0)),
                        width: 150
                    },
                    {
                        title: t('Доступная сумма'),
                        dataIndex: 'available_sum',
                        valueType: 'digitRange',
                        fieldProps: {
                            style: {width: '100%'},
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        search: {
                            transform: (value) => ({
                                available_sum_from: value[0],
                                available_sum_to: value[1],
                            }),
                        },
                        align: 'right',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'available_sum', 0)),
                        width: 150
                    },
                    {
                        title: t('Детали платежа'),
                        dataIndex: 'payment_details',
                        render: (_, _tr) => get(_tr, 'payment_details'),
                        width: 225,
                    },
                    {
                        title: t('ИНН отправителя'),
                        dataIndex: 'sender_taxpayer_number',
                        render: (text, record) => get(record, 'sender_taxpayer_number'),
                        align: 'center',
                        width: 125
                    },
                    {
                        title: t('ИНН банка отправителя'),
                        dataIndex: 'sender_bank_taxpayer_number',
                        render: (_, record) => get(record, 'sender_bank_taxpayer_number','-'),
                        align: 'center',
                        width: 125
                    },
                    {
                        title: t('МФО отправителя'),
                        dataIndex: 'sender_bank_code',
                        render: (_, record) => get(record, 'sender_bank_code','-'),
                        align: 'center',
                        width: 85
                    },
                    {
                        title: t('Р/С отправителя'),
                        dataIndex: 'sender_bank_account',
                        render: (_, record) => get(record, 'sender_bank_account','-'),
                        width: 175
                    },
                    {
                        title: t('ИНН банка получателя'),
                        dataIndex: 'recipient_bank_taxpayer_number',
                        render: (_, record) => get(record, 'recipient_bank_taxpayer_number','-'),
                        width: 125
                    },
                    {
                        title: t('МФО банка получателя'),
                        dataIndex: 'recipient_bank_code',
                        render: (_, record) => get(record, 'recipient_bank_code','-'),
                        width: 85,
                        align:'center',
                    },
                    {
                        title: t('Р/С получателя'),
                        dataIndex: 'recipient_bank_account',
                        render: (_, record) => get(record, 'recipient_bank_account','-'),
                        width: 175
                    },
                    {
                        title: t('Создано в'),
                        dataIndex: 'createdAt',
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                createdAtFrom: value[0],
                                createdAtTo: value[1],
                            }),
                        },
                        render: (text, record) => dayjs(get(record, 'createdAt')).format("DD.MM.YYYY"),
                        align: 'center',
                        width: 125
                    },
                    {
                        title: t('is1C?'),
                        dataIndex: 'is1C',
                        valueType: 'switch',
                        render:(_,record)=>get(record,'is1C') ? t('Да') :t('Нет'),
                        width: 80
                    },
                    {
                        title: t('Действия'),
                        valueType: 'option',
                        align: 'right',
                        render: (text, record) => [
                            <Flex justify={'flex-end'} gap={"middle"} flex={1}>
                                <Popconfirm
                                    title={t('Вы хотите удалить?')}
                                    onConfirm={() => remove(get(record, '_id'))}
                                >
                                    <Tooltip title={t('Удалить')}>
                                        <Button danger shape="circle" icon={<DeleteOutlined/>}/>
                                    </Tooltip>
                                </Popconfirm>
                            </Flex>
                        ],
                        width: 85,
                    },

                ]}
                url={`${URLS.transactions}/list`}/>
        </Spin>
    );
};

export default DistributionPage;
