import React, {useRef, useState} from 'react';
import {Button, Form, notification, Select, Spin, Tag} from "antd";
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {get, isEmpty} from "lodash";
import dayjs from "dayjs";
import {KEYS} from "../../../constants/key";
import {useGetAllQuery, usePostQuery} from "../../../hooks/api";
import {getSelectOptionsListFromData} from "../../../utils";
import {STATUS_LIST_COLOR} from "../../../constants";
import {useNavigate} from "react-router-dom";

const SmrDistributePage = () => {
    const {t} = useTranslation()
    const formRef = useRef(null);
    const navigate = useNavigate();
    const submitType = useRef(null);
    const [selectedKeys,setSelectedKeys] = useState([]);
    const {
        mutate: distributeRequest,
        isPending
    } = usePostQuery({})

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
                message: t('Please select smr')
            })
        }  else {
            distributeRequest({
                url: URLS.smrDistribute,
                attributes: {
                    ...attrs,
                    attach: submitType.current,
                    smrs: selectedKeys,
                }
            })
            navigate(`/insurance/smr`)
        }
    }
    return (
        <Spin spinning={isPending}>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('СМР Распределение')}
                extra={<Form className={'flex !mb-0'} onFinish={distribute}
                             autoComplete="off">
                    <Form.Item name={'branchId'} className={'mb-0 mr-3'} label={t('Филиалы')} rules={[{required: true, message: t('Обязательное поле')}]}>
                        <Select placeholder={t('Выбирать')} className={'min-w-60'} options={branches}  />
                    </Form.Item>
                    <Form.Item className={'mb-0'} label={null}>
<Button onClick={() => (submitType.current = true)} type={'primary'} htmlType={'submit'}>{t('Распределить')}</Button>
<Button onClick={() => (submitType.current = false)} type={'primary'} htmlType="submit" danger className={'ml-2'}>{t('Открепить')}</Button>
                    </Form.Item>
                </Form>}
            />
            <Datagrid
                showSearch={false}
                size={100}
                rowKey={'_id'}
                responseListKeyName={'docs'}
                formRef={formRef}
                rowSelection={{
                    selectedRowKeys:selectedKeys,
                    onChange: (keys) => {
                        setSelectedKeys(keys)
                    },
                }}
                columns={[

                    {
                        title: t('Наименование'),
                        dataIndex: 'insurant',
                        render: (_, _tr) => get(_tr, 'insurant.name'),
                        width: 250
                    },
                    {
                        title: t('Филиал'),
                        dataIndex: 'branch',
                        render: (_, _tr) => get(_tr, 'branch.branchName'),
                        width: 200
                    },
                    {
                        title: t('Номер договора'),
                        dataIndex: 'contract_id',
                        width: 150,
                        align: 'center',
                    },
                    {
                        title: t('Серия полиса'),
                        dataIndex: 'policy.seria',
                        render: (_, _tr) => get(_tr, 'policy.seria'),
                        width: 125,
                        align: 'right',
                    },
                    {
                        title: t('Номер полиса'),
                        dataIndex: 'policy.number',
                        render: (_, _tr) => get(_tr, 'policy.number'),
                        width: 150,
                    },
                    {
                        title: t('Страховая сумма'),
                        dataIndex: 'ins_sum',
                        align: 'right',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'policy.ins_sum', 0)),
                        width: 175
                    },
                    {
                        title: t('Страховая премия'),
                        dataIndex: 'ins_premium',
                        align: 'right',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'policy.ins_premium', 0)),
                        width: 175
                    },
                    {
                        title: t('Снято на договор'),
                        dataIndex: 'attachedSum',
                        align: 'center',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'attachedSum', 0)),
                        width: 175
                    },
                    {
                        title: t('Создано в'),
                        dataIndex: 'createdAt',
                        render: (text, record) => dayjs(get(record, 'createdAt')).format("DD.MM.YYYY"),
                        align: 'center',
                        width: 125
                    },
                    {
                        title:t('Статус'),
                        dataIndex: 'attachStatus',
                        align:'center',
                        render:(_,record) => <Tag  className={'mx-auto'} color={STATUS_LIST_COLOR[get(record,'attachStatus')] || 'default'}>{get(record,'attachStatus')}</Tag>,
                        width:80,
                    },
                ]}
                url={`${URLS.smrList}`} />
        </Spin>
    );
};

export default SmrDistributePage;
