import React, {useEffect, useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {Button, Drawer, Flex, Form, Input, InputNumber, Popconfirm, Select, Spin, Tooltip} from "antd";
import {PlusOutlined,DeleteOutlined,EditOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useDeleteQuery, useGetAllQuery, usePostQuery, usePutQuery} from "../../../hooks/api";
import {isNil} from "lodash/lang";
import {get} from "lodash";
import {getSelectOptionsListFromData} from "../../../utils";
import {KEYS} from "../../../constants/key";

const AccountingPage = () => {
    const [form] = Form.useForm();
    const {t} = useTranslation()
    const ref = useRef();
    const [open, setOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const {mutate, isPending} = usePostQuery({})
    const {mutate:updateRequest, isPending:isPendingUpdate} = usePutQuery({})
    const {mutate:removeRequest, isPending:isPendingRemove} = useDeleteQuery({})

    let {data: accounts} = useGetAllQuery({
        key: KEYS.account, url: `${URLS.account}/list`
    })
    accounts = getSelectOptionsListFromData(get(accounts, `data.data`, []), '_id', 'account_name')

    const create = (attrs) => {
        mutate({url: URLS.account, attributes: {...attrs}}, {
            onSuccess: () => {
                setOpen(false)
                ref.current?.reload()
            }
        })
    }

    const update = (attrs) => {
        updateRequest({
            url:`${URLS.account}/${get(currentRecord,'_id')}`,attributes: {...attrs}
        },{
            onSuccess:()=>{
                setCurrentRecord(null)
                ref.current?.reload()
            }
        })
    }
    const remove = (_id) => {
        removeRequest({url:`${URLS.account}/${_id}`},{
            onSuccess:()=>{
                ref.current?.reload()
            }
        })
    }

    useEffect(() => {
        if (currentRecord) {
            form.setFieldsValue(currentRecord);
            form.setFieldValue('debt_account',get(currentRecord,'debt_account._id'));
            form.setFieldValue('cred_account',get(currentRecord,'cred_account._id'));
        }
    }, [currentRecord]);


    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Счёт')}
                extra={[
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => setOpen(true)}>
                        {t('Добавить')}
                    </Button>,
                ]}
            />
            <Datagrid
                actionRef={ref}
                showSearch={false}
                columns={[
                    {
                        title: t('Название счёта'),
                        dataIndex: 'account_name',
                        hideInSearch: true
                    },
                    {
                        title: t('Номер счёта'),
                        dataIndex: 'account_ID',
                        hideInSearch: true,
                        align:'center'
                    },
                    {
                        title: t('Действия'),
                        valueType: 'option',
                        align: 'right',
                        render: (text, record, _, action) => [
                           <Flex justify={'flex-end'}  gap={"middle"} flex={1}>
                               <Tooltip title={t('Редактировать')}>
                                   <Button onClick={()=>setCurrentRecord(record)}  shape="circle" icon={<EditOutlined />} />
                               </Tooltip>
                               <Popconfirm
                                   title={t('Вы хотите удалить?')}
                                   onConfirm={()=>remove(get(record,'_id'))}
                                   okButtonProps={{ loading:isPendingRemove }}
                               >
                                   <Tooltip title={t('Удалить')}>
                                       <Button  danger shape="circle" icon={<DeleteOutlined />} />
                                   </Tooltip>
                               </Popconfirm>
                           </Flex>
                        ],
                        width: 200,
                    },
                ]}
                url={`${URLS.account}/list`}
            />
            <Drawer open={open} title={t('Добавить')} onClose={() => setOpen(false)} width={400}>
                <Spin spinning={isPending}>
                    <Form
                        name="group"
                        layout={'vertical'}
                        onFinish={create}
                        autoComplete="off"
                    >
                        <Form.Item
                            label={t("Название счёта")}
                            name="account_name"
                            rules={[{required: true, message: t('Обязательное поле')}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item
                            label={t("Номер счёта")}
                            name="account_ID"
                            rules={[{required: true, message: t('Обязательное поле')}]}
                        >
                            <InputNumber className={'w-full'}/>
                        </Form.Item>

                        <Form.Item label={null}>
                            <Button block type="primary" htmlType="submit" className={'font-medium mt-3'}>
                                {t('Отправить')}
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Drawer>
            <Drawer open={!isNil(currentRecord)} title={t('Редактировать')} onClose={() => setCurrentRecord(null)} width={400}>
                <Spin spinning={isPendingUpdate}>
                    <Form
                        layout={'vertical'}
                        onFinish={update}
                        autoComplete="off"
                        form={form}
                    >
                        <Form.Item
                            label={t("Название счёта")}
                            name="account_name"
                            rules={[{required: true, message: t('Обязательное поле')}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item
                            label={t("Номер счёта")}
                            name="account_ID"
                            rules={[{required: true, message: t('Обязательное поле')}]}
                        >
                            <InputNumber className={'w-full'}/>
                        </Form.Item>
                        <Form.Item label={null}>
                            <Button  block type="primary" htmlType="submit" className={'font-medium'}>
                                {t('Сохранить')}
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Drawer>
        </>
    );
};

export default AccountingPage;
