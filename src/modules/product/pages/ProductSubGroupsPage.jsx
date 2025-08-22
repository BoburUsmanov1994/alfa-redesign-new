import React, {useEffect, useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {Button, Drawer, Flex, Form, Input, Popconfirm, Select, Spin, Tooltip} from "antd";
import {PlusOutlined, DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useDeleteQuery, useGetAllQuery, usePostQuery, usePutQuery} from "../../../hooks/api";
import {isNil} from "lodash/lang";
import {get} from "lodash";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData} from "../../../utils";

const ProductSubGroupsPage = () => {
    const [form] = Form.useForm();
    const {t} = useTranslation()
    const ref = useRef();
    const [open, setOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const {mutate, isPending} = usePostQuery({})
    const {mutate: updateRequest, isPending: isPendingUpdate} = usePutQuery({})
    const {mutate: removeRequest, isPending: isPendingRemove} = useDeleteQuery({})

    let {data: groups} = useGetAllQuery({
        key: KEYS.groupsofproducts,
        url: `${URLS.groupsofproducts}/list`,
    })

    const create = (attrs) => {
        mutate({url: URLS.subgroupsofproducts, attributes: {...attrs}}, {
            onSuccess: () => {
                setOpen(false)
                ref.current?.reload()
            }
        })
    }

    const update = (attrs) => {
        updateRequest({
            url: `${URLS.subgroupsofproducts}/${get(currentRecord, '_id')}`, attributes: {...attrs}
        }, {
            onSuccess: () => {
                setCurrentRecord(null)
                ref.current?.reload()
            }
        })
    }
    const remove = (_id) => {
        removeRequest({url: `${URLS.subgroupsofproducts}/${_id}`}, {
            onSuccess: () => {
                ref.current?.reload()
            }
        })
    }

    useEffect(() => {
        if (currentRecord) {
            form.setFieldsValue(currentRecord);
            form.setFieldValue('group', get(currentRecord, 'group._id'))
        }
    }, [currentRecord]);


    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Подгруппы продуктов')}
                extra={[
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => setOpen(true)}>
                        {t('Добавить')}
                    </Button>,
                ]}
            />
            <Datagrid
                actionRef={ref}
                columns={[
                    {
                        title: t('Название'),
                        dataIndex: 'name',
                        hideInSearch: true
                    },
                    {
                        title: t('Группа'),
                        dataIndex: 'group',
                        valueType: 'select',
                        render: (_, record) => get(record, 'group.name'),
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: getSelectOptionsListFromData(get(groups, `data.data`, []), '_id', 'name')
                        },
                    },
                    {
                        title: t('Действия'),
                        valueType: 'option',
                        align: 'right',
                        render: (text, record) => [
                            <Flex justify={'flex-end'} gap={"middle"} flex={1}>
                                <Tooltip title={t('Редактировать')}>
                                    <Button onClick={() => setCurrentRecord(record)} shape="circle"
                                            icon={<EditOutlined/>}/>
                                </Tooltip>
                                <Popconfirm
                                    title={t('Вы хотите удалить?')}
                                    onConfirm={() => remove(get(record, '_id'))}
                                    okButtonProps={{loading: isPendingRemove}}
                                >
                                    <Tooltip title={t('Удалить')}>
                                        <Button danger shape="circle" icon={<DeleteOutlined/>}/>
                                    </Tooltip>
                                </Popconfirm>
                            </Flex>
                        ],
                        width: 200,
                    },
                ]}
                url={`${URLS.subgroupsofproducts}/list`}
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
                            label={t("Группа")}
                            name="group"
                            rules={[{required: true, message: t('Обязательное поле')}]}
                        >
                            <Select options={getSelectOptionsListFromData(get(groups, `data.data`, []), '_id', 'name')}
                                    placeholder={t('Выбирать')}/>
                        </Form.Item>
                        <Form.Item
                            label={t("Название")}
                            name="name"
                            rules={[{required: true, message: t('Обязательное поле')}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item label={null}>
                            <Button block type="primary" htmlType="submit" className={'font-medium'}>
                                {t('Отправить')}
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Drawer>
            <Drawer open={!isNil(currentRecord)} title={t('Редактировать')} onClose={() => setCurrentRecord(null)}
                    width={400}>
                <Spin spinning={isPendingUpdate}>
                    <Form
                        layout={'vertical'}
                        onFinish={update}
                        autoComplete="off"
                        form={form}
                    >
                        <Form.Item
                            label={t("Группа")}
                            name="group"
                            rules={[{required: true, message: t('Обязательное поле')}]}
                        >
                            <Select options={getSelectOptionsListFromData(get(groups, `data.data`, []), '_id', 'name')}
                                    placeholder={t('Выбирать')}/>
                        </Form.Item>
                        <Form.Item
                            label={t("Название")}
                            name="name"
                            rules={[{required: true, message: t('Обязательное поле')}]}
                        >
                            <Input/>
                        </Form.Item>
                        <Form.Item label={null}>
                            <Button block type="primary" htmlType="submit" className={'font-medium'}>
                                {t('Сохранить')}
                            </Button>
                        </Form.Item>
                    </Form>
                </Spin>
            </Drawer>
        </>
    );
};

export default ProductSubGroupsPage;
