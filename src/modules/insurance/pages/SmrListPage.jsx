import React, {useEffect, useRef, useState} from 'react';
import {
    Button,
    Card,
    Col,
    Drawer,
    Flex,
    Form,
    Input,
    InputNumber,
    notification,
    Row, Select,
    Space,
    Spin,
    Tag,
    Tooltip
} from "antd";
import {DownloadOutlined, PlusOutlined, DollarOutlined} from "@ant-design/icons";
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {request} from "../../../services/api";
import {URLS} from "../../../constants/url";
import {getSelectOptionsListFromData} from "../../../utils";
import {get} from "lodash";
import {STATUS_LIST, STATUS_LIST_COLOR} from "../../../constants";
import {useGetAllQuery, usePostQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {useStore} from "../../../store";
import {isNil} from "lodash/lang";

const SmrListPage = () => {
    const {t} = useTranslation()
    const ref = useRef();
    const drawerRef = useRef();
    const formRef = useRef(null);
    const {user} = useStore()
    const [form] = Form.useForm()
    const [loadingReport, setLoadingReport] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null)
    const [selectedRowKey, setSelectedRowKey] = useState(null);

    const {mutate: attachRequest, isPending: isPendingAttach} = usePostQuery({})


    const {data: branches, isLoading: isLoadingBranch} = useGetAllQuery({
        key: KEYS.branches, url: `${URLS.branches}/list`
    })
    const branchesList = getSelectOptionsListFromData(get(branches, `data.data`, []), '_id', 'branchName')

    useEffect(() => {
        if(currentRecord && selectedRowKey) {
            form.setFieldValue('sumInsurancePremium', get(currentRecord, 'policy.ins_premium_smr', 0))
            form.setFieldValue('attachedSum', get(currentRecord, 'attachedSum', 0))
        }
    }, [currentRecord,selectedRowKey]);


    const attach = (attrs) => {
        const {attachmentSum,attach} = attrs;
        attachRequest({
            url: `${URLS.smrTransactionAttach}?contract_id=${get(currentRecord,'contract_id')}`,
            attributes: {
                attach,
                transaction: selectedRowKey,
                attachmentSum,
            }
        }, {
            onSuccess: () => {
                setSelectedRowKey(null)
                drawerRef.current?.reload()
                ref.current?.reload()
            },
        })
    }

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
                actionRef={ref}
                rowKey={'application_number'}
                responseListKeyName={'docs'}
                formRef={formRef}
                defaultCollapsed
                columns={[
                    {
                        title: t('Филиал'),
                        dataIndex: 'branch',
                        valueType: 'select',
                        initialValue: get(user, 'branch._id'),
                        render: (_, record) => get(record, 'branch.branchName'),
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: branchesList
                        },
                        width: 200
                    },
                    {
                        title: t('Страхователь'),
                        dataIndex: 'insurant',
                        render: (_, row) => get(row, 'insurant.name'),
                        width: 250
                    },
                    {
                        title: t('Номер договора'),
                        dataIndex: 'number',
                        render: (_, record) => get(record, 'policy.number'),
                        width: 150,
                    },
                    {
                        title: t('Серия полиса'),
                        dataIndex: 'seria',
                        render: (_, record) => get(record, 'policy.seria'),
                        width: 120,
                        align: 'right'
                    },
                    {
                        title: t('Номер полиса'),
                        dataIndex: 'number',
                        render: (_, record) => get(record, 'policy.number'),
                        width: 120,
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
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'policy.ins_sum', 0)),
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
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'policy.ins_premium', 0)),
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
                        render: (text, record) => [
                            <Flex justify={'flex-end'}>
                                <Tooltip title={t('Распределение к полису')}>
                                    <Button onClick={() => setCurrentRecord(record)} shape="circle"
                                            icon={<DollarOutlined/>}/>
                                </Tooltip>
                            </Flex>
                        ],
                    },
                ]}
                url={`${URLS.smrList}`}>
                {({actionRef}) => <Space>
                    <Button loading={loadingReport} type={'dashed'} icon={<DownloadOutlined/>} onClick={() => {
                        setLoadingReport(true)
                        const {
                            date,
                            ...rest
                        } = formRef?.current?.getFieldsValue?.()
                        const {current, pageSize} = actionRef?.current?.pageInfo
                        request.get(URLS.smrPortfelReport, {
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
            <Drawer open={!isNil(currentRecord)} title={t('Распределение к полису')} width={1280}
                    onClose={() => setCurrentRecord(null)}>
                <Datagrid
                    actionRef={drawerRef}
                    x={1000}
                    size={10}
                    params={{
                        branch: get(user, 'branch._id'),
                        isAvailable: true,
                    }}
                    rowKey={'_id'}
                    responseListKeyName={'data'}
                    formRef={formRef}
                    defaultCollapsed
                    rowSelection={{
                        type: 'radio',
                        selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
                        onChange: (keys) => {
                            setSelectedRowKey(keys[0])
                        },
                    }}
                    columns={[
                        {
                            title: t('Дата п/п'),
                            dataIndex: 'payment_order_date',
                            render: (text, record) => get(record, 'payment_order_date'),
                            valueType: 'dateRange',
                            search: {
                                transform: (value) => ({
                                    fromDate: value[0],
                                    toDate: value[1],
                                }),
                            },
                        },
                        {
                            title: t('Наименоменование отправителя'),
                            dataIndex: 'sender_name',
                            render: (_, row) => get(row, 'sender_name'),
                            hideInSearch: true
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
                            render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'payment_amount', 0)),
                            align: 'center'
                        },
                        {
                            title: t('Прикрепленная сумма'),
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
                            hideInTable: true
                        },
                        {
                            title: t('Детали платежа'),
                            dataIndex: 'payment_details',
                            render: (_, row) => get(row, 'payment_details'),
                        },
                        {
                            title: t('Доступная сумма'),
                            dataIndex: 'available_sum',
                            valueType: 'digitRange',
                            search: {
                                transform: (value) => ({
                                    available_sum_from: value[0],
                                    available_sum_to: value[1],
                                }),
                            },
                            fieldProps: {
                                style: {width: '100%'},
                                formatter: (value) =>
                                    value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                                parser: (value) => value?.replace(/(,*)/g, ''),
                            },
                            render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'available_sum', 0)),
                            align: 'center'
                        },
                        {
                            title: t('is1C?'),
                            dataIndex: 'is1C',
                            valueType: 'switch',
                            hideInTable: true
                        },
                    ]}
                    url={`${URLS.transactions}/list`}/>
                <Card className={'mt-4'}>
                    <Spin spinning={isPendingAttach}>
                    {selectedRowKey  && <Form
                        form={form}
                        name="attach"
                        layout={'vertical'}
                        onFinish={attach}
                        initialValues={{
                            attachmentSum:0,
                            attach:true
                        }}
                        autoComplete="off"
                    > <Row gutter={16} align={'bottom'}>
                        <Col span={6}>
                            <Form.Item name={'sumInsurancePremium'} label={t('Сумма оплаты по полису:')}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) =>
                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                    }
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    disabled
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={'attachedSum'} label={t('Сумма прикреплённых средств:')}>
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) =>
                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                    }
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    disabled
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={'attachmentSum'} label={t('Сумма к прикреплению:')} >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    min={0}
                                    formatter={(value) =>
                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                    }
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name={'attach'} label={t('Прикрепить или отсоединить к полису')} >
                                <Select options={[ {
                                    value: false,
                                    label: t('Отсоединить')
                                },
                                    {
                                        value: true,
                                        label: t('Прикрепить')
                                    },]} />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item  label={null} >
                                <Button block type="primary" htmlType="submit" className={'font-medium'}>
                                    {t('Отправить')}
                                </Button>
                            </Form.Item>
                        </Col>
                    </Row>
                    </Form>}
                    </Spin>
                </Card>
            </Drawer>
        </>
    );
};

export default SmrListPage;
