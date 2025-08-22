import React, {useEffect, useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {Button, Col, Drawer, Flex, Form, Input, Popconfirm, Row, Select, Spin, Switch, Tooltip} from "antd";
import {PlusOutlined, DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useDeleteQuery, useGetAllQuery, usePostQuery, usePutQuery} from "../../../hooks/api";
import {isNil} from "lodash/lang";
import {get} from "lodash";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData} from "../../../utils";
import {useStore} from "../../../store";

const AccountsPage = () => {
    const [form] = Form.useForm();
    const {t} = useTranslation()
    const ref = useRef();
    const {user} = useStore()
    const [open, setOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const {mutate, isPending} = usePostQuery({})
    const {mutate: updateRequest, isPending: isPendingUpdate} = usePutQuery({})
    const {mutate: removeRequest, isPending: isPendingRemove} = useDeleteQuery({})

    let {data: branches, isLoading} = useGetAllQuery({
        key: KEYS.branches, url: `${URLS.branches}/list`, params: {
            params: {
                limit: 100
            }
        }
    })
    branches = getSelectOptionsListFromData(get(branches, `data.data`, []), '_id', 'branchName')

    let {data: employeeList} = useGetAllQuery({key: KEYS.employee, url: `${URLS.employee}/list`})
    employeeList = getSelectOptionsListFromData(get(employeeList, `data.data`, []), '_id', 'fullname')
    let {data: agents} = useGetAllQuery({key: ['agents-list'], url: `${URLS.agents}/list`})
    agents = getSelectOptionsListFromData(get(agents, `data.data`, []), '_id', ['organization.nameoforganization', 'person.secondname', 'person.name'])
    let {data: roles} = useGetAllQuery({key: KEYS.role, url: `${URLS.role}/list`})
    roles = getSelectOptionsListFromData(get(roles, `data.data`, []), '_id', 'name')
    let {data: status} = useGetAllQuery({key: KEYS.userStatus, url: `${URLS.userStatus}/list`})
    status = getSelectOptionsListFromData(get(status, `data.data`, []), '_id', 'name')

    const create = (attrs) => {
        mutate({url: URLS.user, attributes: {...attrs}}, {
            onSuccess: () => {
                setOpen(false)
                ref.current?.reload()
            }
        })
    }

    const update = (attrs) => {
        updateRequest({
            url: `${URLS.user}/${get(currentRecord, '_id')}`, attributes: {...attrs}
        }, {
            onSuccess: () => {
                setCurrentRecord(null)
                ref.current?.reload()
            }
        })
    }
    const remove = (_id) => {
        removeRequest({url: `${URLS.user}/${_id}`}, {
            onSuccess: () => {
                ref.current?.reload()
            }
        })
    }

    useEffect(() => {
        if (currentRecord) {
            form.setFieldsValue(currentRecord);
            form.setFieldValue('role', get(currentRecord, 'role._id'))
            form.setFieldValue('status', get(currentRecord, 'status._id'))
            form.setFieldValue('agent', get(currentRecord, 'agent._id'))
            form.setFieldValue('employee', get(currentRecord, 'employee._id'))
            form.setFieldValue('branch', get(currentRecord, 'branch._id'))
        }
    }, [currentRecord]);

    if (isLoading) {
        return <Spin spinning fullscreen/>
    }
    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Все пользователи')}
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
                        title: t('Имя'),
                        dataIndex: 'name',
                        hideInSearch: true
                    },
                    {
                        title: t('Имя пользователя'),
                        dataIndex: 'username',
                        hideInSearch: true
                    },

                    {
                        title: t('Филиал'),
                        dataIndex: 'branch',
                        valueType: 'select',
                        initialValue: get(user, 'branch._id'),
                        render: (_, record) => get(record, 'branch.branchName'),
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: branches
                        },
                    },
                    {
                        title: t('Роль'),
                        dataIndex: 'role',
                        render: (_, record) => get(record, 'role.name'),
                        hideInSearch: true
                    },
                    {
                        title: t('Статус'),
                        dataIndex: 'status',
                        render: (_, record) => get(record, 'status.name'),
                        hideInSearch: true
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
                url={`${URLS.user}/list`}
            />
            <Drawer open={open} title={t('Добавить')} onClose={() => setOpen(false)} width={600}>
                <Spin spinning={isPending}>
                    <Form
                        name="group"
                        layout={'vertical'}
                        onFinish={create}
                        autoComplete="off"
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Имя")}
                                    name="name"
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Филиал")}
                                    name="branch"
                                >
                                    <Select
                                        showSearch
                                        options={branches}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Сотрудник")}
                                    name="employee"
                                >
                                    <Select showSearch
                                        options={employeeList}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Агент")}
                                    name="agent"
                                >
                                    <Select
                                        showSearch
                                        options={agents}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Имя пользователя")}
                                    name="username"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Пароль")}
                                    name="password"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input.Password/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Роль")}
                                    name="role"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        showSearch
                                        options={roles}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Статус")}
                                    name="status"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        showSearch
                                        options={status}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Выдавать полис без оплаты")}
                                    name="isCheckPayment"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={null}>
                                    <Button  type="primary" htmlType="submit" className={'font-medium mt-3 min-w-40'}>
                                        {t('Отправить')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Drawer>
            <Drawer open={!isNil(currentRecord)} title={t('Редактировать')} onClose={() => setCurrentRecord(null)}
                    width={600}>
                <Spin spinning={isPendingUpdate}>
                    <Form
                        layout={'vertical'}
                        onFinish={update}
                        autoComplete="off"
                        form={form}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Имя")}
                                    name="name"
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Филиал")}
                                    name="branch"
                                >
                                    <Select
                                        showSearch
                                        options={branches}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Сотрудник")}
                                    name="employee"
                                >
                                    <Select showSearch
                                            options={employeeList}
                                            placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Агент")}
                                    name="agent"
                                >
                                    <Select
                                        showSearch
                                        options={agents}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Имя пользователя")}
                                    name="username"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label={t("Роль")}
                                    name="role"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        showSearch
                                        options={roles}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Статус")}
                                    name="status"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        showSearch
                                        options={status}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Выдавать полис без оплаты")}
                                    name="isCheckPayment"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={null}>
                                    <Button  type="primary" htmlType="submit" className={'font-medium mt-3 min-w-40'}>
                                        {t('Сохранить')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Drawer>
        </>
    );
};

export default AccountsPage;
