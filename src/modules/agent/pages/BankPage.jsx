import React, {useEffect, useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {
    Button,
    Col,
    Divider,
    Drawer,
    Flex,
    Form,
    Input, InputNumber,
    Popconfirm,
    Row,
    Select,
    Spin, Switch,
    Tooltip,
    Typography
} from "antd";
import {PlusOutlined, DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useDeleteQuery, useGetAllQuery, usePostQuery, usePutQuery} from "../../../hooks/api";
import {isNil} from "lodash/lang";
import {get} from "lodash";
import MaskedInput from "../../../components/masked-input";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData} from "../../../utils";

const BankPage = () => {
    const [form] = Form.useForm();
    const {t} = useTranslation()
    const ref = useRef();
    const [open, setOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const {mutate, isPending} = usePostQuery({})
    const {mutate: updateRequest, isPending: isPendingUpdate} = usePutQuery({})
    const {mutate: removeRequest, isPending: isPendingRemove} = useDeleteQuery({})

    let {data: banks} = useGetAllQuery({key: KEYS.bank, url: `${URLS.bank}/list`})
    banks = getSelectOptionsListFromData(get(banks, `data.data`, []), '_id', 'name')

    let {data: products} = useGetAllQuery({key: KEYS.products, url: `${URLS.products}`})
    products = getSelectOptionsListFromData(get(products, `data.data`, []), 'code', 'name')

    const create = (attrs) => {
        mutate({url: URLS.bank, attributes: {...attrs}}, {
            onSuccess: () => {
                setOpen(false)
                ref.current?.reload()
                form.resetFields()
            }
        })
    }

    const update = (attrs) => {
        updateRequest({
            url: `${URLS.bank}/${get(currentRecord, '_id')}`, attributes: {...attrs}
        }, {
            onSuccess: () => {
                setCurrentRecord(null)
                ref.current?.reload()
                form.resetFields()
            }
        })
    }
    const remove = (_id) => {
        removeRequest({url: `${URLS.bank}/${_id}`}, {
            onSuccess: () => {
                ref.current?.reload()
            }
        })
    }

    useEffect(() => {
        if (currentRecord) {
            form.setFieldsValue(currentRecord);
        }
    }, [currentRecord, form]);


    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Bank')}
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
                        title: t('Наименование'),
                        dataIndex: 'name',
                        hideInSearch: true
                    },
                    {
                        title: t('INN'),
                        dataIndex: 'inn',
                        hideInSearch: true
                    },
                    {
                        title: t('Username'),
                        dataIndex: 'username',
                        hideInSearch: true
                    },
                    {
                        title: t('Действия'),
                        valueType: 'option',
                        align: 'right',
                        render: (text, record, _, action) => [
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
                url={`${URLS.bank}/list`}
            />
            <Drawer open={open} title={t('Добавить')} onClose={() => setOpen(false)} width={800}>
                <Spin spinning={isPending}>
                    <Form
                        name="bank"
                        layout={'vertical'}
                        onFinish={create}
                        autoComplete="off"
                    >
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name={'mainBank'} label={t('Главный банк')}
                                >
                                    <Select placeholder={t('Выбирать')} showSearch allowClear options={banks}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("ИНН")}
                                    name={'inn'}
                                >
                                    <MaskedInput mask={'99999999'} maskChar={null} placeholder={'_________'}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Имя")}
                                    name="name"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Username")}
                                    name="username"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Password")}
                                    name="password"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input.Password/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>

                                <Form.List name="rates"   initialValue={[{}]}>
                                    {
                                        (fields, {add, remove}) => (<>
                                            <Flex align={'center'} className={'pr-5'}>
                                                <Divider orientation="left"><Typography.Title
                                                    level={5}>{t("Добавить ставку")}</Typography.Title></Divider>
                                                <Button onClick={()=>add()} className={'flex-none mr-3'} type="primary" icon={<PlusOutlined/>}/>
                                            </Flex>
                                            {
                                                fields?.map(({name,...restField}) => <Row gutter={16}  className={'mb-3'}>
                                                    <Col span={9}>
                                                        <Form.Item {...restField} name={[name,'productCode']} label={t('Продукт')}   rules={[{required: true, message: t('Обязательное поле')}]}
                                                        >
                                                            <Select placeholder={t('Выбирать')} showSearch allowClear options={products}/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item {...restField} name={[name,'rate']} label={t('Rate')}
                                                        >
                                                          <InputNumber className={'w-full'} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={5}>
                                                        <Form.Item
                                                            {...restField}
                                                            label={t("Allow change rate?")}
                                                            name={[name,'allowChangeRate']}
                                                            valuePropName="checked"
                                                            initialValue={false}
                                                        >
                                                            <Switch/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={5}>
                                                        <Form.Item
                                                            {...restField}
                                                            label={t("Has rate tied to term?")}
                                                            name={[name,'hasRateTiedToTerm']}
                                                            valuePropName="checked"
                                                            initialValue={false}
                                                        >
                                                            <Switch/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={1}>
                                                        {fields.length > 1 ? <Button shape={'circle'} icon={<DeleteOutlined />} danger onClick={() => remove(name)}  /> : null}
                                                    </Col>
                                                </Row>)
                                            }
                                        </>)
                                    }
                                </Form.List>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={null}>
                                    <Button block type="primary" htmlType="submit" className={'font-medium'}>
                                        {t('Отправить')}
                                    </Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Spin>
            </Drawer>
            <Drawer open={!isNil(currentRecord)} title={t('Редактировать')} onClose={() => setCurrentRecord(null)}
                    width={800}>
                <Spin spinning={isPendingUpdate}>
                    <Form
                        layout={'vertical'}
                        onFinish={update}
                        autoComplete="off"
                        form={form}
                    >
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item name={'mainBank'} label={t('Главный банк')}
                                >
                                    <Select placeholder={t('Выбирать')} showSearch allowClear options={banks}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("ИНН")}
                                    name={'inn'}
                                >
                                    <MaskedInput mask={'99999999'} maskChar={null} placeholder={'_________'}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Имя")}
                                    name="name"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Username")}
                                    name="username"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>

                            <Col span={24}>

                                <Form.List name="rates"   initialValue={[{}]}>
                                    {
                                        (fields, {add, remove}) => (<>
                                            <Flex align={'center'} className={'pr-5'}>
                                                <Divider orientation="left"><Typography.Title
                                                    level={5}>{t("Добавить ставку")}</Typography.Title></Divider>
                                                <Button onClick={()=>add()} className={'flex-none mr-3'} type="primary" icon={<PlusOutlined/>}/>
                                            </Flex>
                                            {
                                                fields?.map(({name,...restField}) => <Row gutter={16}  className={'mb-3'}>
                                                    <Col span={9}>
                                                        <Form.Item {...restField} name={[name,'productCode']} label={t('Продукт')}   rules={[{required: true, message: t('Обязательное поле')}]}
                                                        >
                                                            <Select placeholder={t('Выбирать')} showSearch allowClear options={products}/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item {...restField} name={[name,'rate']} label={t('Rate')}
                                                        >
                                                            <InputNumber className={'w-full'} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={5}>
                                                        <Form.Item
                                                            {...restField}
                                                            label={t("Allow change rate?")}
                                                            name={[name,'allowChangeRate']}
                                                            valuePropName="checked"
                                                            initialValue={false}
                                                        >
                                                            <Switch/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={5}>
                                                        <Form.Item
                                                            {...restField}
                                                            label={t("Has rate tied to term?")}
                                                            name={[name,'hasRateTiedToTerm']}
                                                            valuePropName="checked"
                                                            initialValue={false}
                                                        >
                                                            <Switch/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={1}>
                                                        {fields.length > 1 ? <Button shape={'circle'} icon={<DeleteOutlined />} danger onClick={() => remove(name)}  /> : null}
                                                    </Col>
                                                </Row>)
                                            }
                                        </>)
                                    }
                                </Form.List>
                            </Col>

                            <Col span={24}>
                                <Form.Item label={null}>
                                    <Button block type="primary" htmlType="submit" className={'font-medium'}>
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

export default BankPage;
