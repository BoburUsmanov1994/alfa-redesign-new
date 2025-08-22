import React, {useEffect, useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {Button, Col, DatePicker, Drawer, Flex, Form, Input, Popconfirm, Row, Select, Spin, Tooltip} from "antd";
import {PlusOutlined, DeleteOutlined, EditOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useDeleteQuery, useGetAllQuery, usePostQuery, usePutQuery} from "../../../hooks/api";
import {isNil} from "lodash/lang";
import {get} from "lodash";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../utils";
import {useStore} from "../../../store";
import MaskedInput from "../../../components/masked-input";
import dayjs from "dayjs";

const EmployeesPage = () => {
    const [form] = Form.useForm();
    const {t} = useTranslation()
    const ref = useRef();
    const {user} = useStore()
    const [open, setOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const regionId =  Form.useWatch('region', form)
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

    let {data: positionList} = useGetAllQuery({key: KEYS.position, url: `${URLS.position}/list`})
    positionList = getSelectOptionsListFromData(get(positionList, `data.data`, []), '_id', 'name')
    let {data: documentTypeList} = useGetAllQuery({key: KEYS.documentType, url: `${URLS.documentType}/list`})
    documentTypeList = getSelectOptionsListFromData(get(documentTypeList, `data.data`, []), '_id', 'name')
    const {data: genders} = useGetAllQuery({
        key: KEYS.genders, url: `${URLS.genders}/list`
    })
    const genderList = getSelectOptionsListFromData(get(genders, `data.data`, []), '_id', 'name')

    let {data: regions} = useGetAllQuery({key: KEYS.regions, url: `${URLS.regions}/list`})
    regions = getSelectOptionsListFromData(get(regions, `data.data`, []), '_id', 'name')

    const {data: district} = useGetAllQuery({
        key: [KEYS.districts, regionId],
        url: `${URLS.districts}/list`,
        params: {
            params: {
                region: regionId
            }
        },
        enabled: !!(regionId)
    })
    const districtList = getSelectOptionsListFromData(get(district, `data.data`, []), '_id', 'name')

    const create = (attrs) => {
        const {dateofbirth,dateofmanagerdocument,expirationdate,...rest} = attrs;
        mutate({url: URLS.employee, attributes: {...rest,dateofbirth:dayjs(dateofbirth).format('YYYY-MM-DD'),
                dateofmanagerdocument:dayjs(dateofmanagerdocument).format('YYYY-MM-DD'),
                expirationdate:dayjs(dateofmanagerdocument).format('YYYY-MM-DD')}}, {
            onSuccess: () => {
                setOpen(false)
                form.resetFields()
                ref.current?.reload()
            }
        })
    }

    const update = (attrs) => {
        const {dateofbirth,dateofmanagerdocument,expirationdate,...rest} = attrs;
        updateRequest({
            url: `${URLS.employee}/${get(currentRecord, '_id')}`, attributes:{...rest,dateofbirth:dayjs(dateofbirth).format('YYYY-MM-DD'),
                dateofmanagerdocument:dayjs(dateofmanagerdocument).format('YYYY-MM-DD'),
                expirationdate:dayjs(dateofmanagerdocument).format('YYYY-MM-DD')}
        }, {
            onSuccess: () => {
                setCurrentRecord(null)
                ref.current?.reload()
            }
        })
    }
    const remove = (_id) => {
        removeRequest({url: `${URLS.employee}/${_id}`}, {
            onSuccess: () => {
                ref.current?.reload()
            }
        })
    }

    useEffect(() => {
        if (currentRecord) {
            form.setFieldsValue(currentRecord);
            form.setFieldValue('position', get(currentRecord, 'position._id'))
            form.setFieldValue('branch', get(currentRecord, 'branch._id'))
            form.setFieldValue('dateofmanagerdocument', dayjs(get(currentRecord, 'dateofmanagerdocument')))
            form.setFieldValue('expirationdate', dayjs(get(currentRecord, 'expirationdate')))
            form.setFieldValue('dateofbirth', dayjs(get(currentRecord, 'dateofbirth')))
            form.setFieldValue('region', parseInt(get(currentRecord, 'region')))
            form.setFieldValue('district', parseInt(get(currentRecord, 'district')))
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
                        title: t('Полное имя'),
                        dataIndex: 'fullname',
                        hideInSearch: true
                    },
                    {
                        title: t('Position'),
                        dataIndex: 'position',
                        render: (_, record) => get(record, 'position.name'),
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Phone'),
                        dataIndex: 'telephonenumber',
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Passport'),
                        dataIndex: 'documentnumber',
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Email'),
                        dataIndex: 'emailforcontacts',
                        hideInSearch: true,
                        align: 'center',
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
                url={`${URLS.employee}/list`}
            />
            <Drawer open={open} title={t('Добавить')} onClose={() => setOpen(false)} width={900}>
                <Spin spinning={isPending}>
                    <Form
                        name="employee"
                        layout={'vertical'}
                        onFinish={create}
                        autoComplete="off"
                        form={form}
                    >
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Полное имя")}
                                    name="fullname"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Position")}
                                    name="position"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={positionList}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Document type")}
                                    name="typeofdocumentsformanager"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={documentTypeList}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Document number")}
                                    name="documentnumber"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item
                                    label={t("Document date")}
                                    name={'dateofmanagerdocument'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <DatePicker  format="DD-MM-YYYY"  />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item
                                    label={t("Expration date")}
                                    name={'expirationdate'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <DatePicker  format="DD-MM-YYYY"  />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Телефон")}
                                    name={'telephonenumber'}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={"+\\9\\98 (99) 999-99-99"}  />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={'emailforcontacts'}
                                    rules={[
                                        {
                                            type: 'email',
                                            message: t('Введите действительный адрес электронной почты'),
                                        },
                                        {required: true, message: t('Обязательное поле')}
                                    ]}
                                >
                                    <Input  />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Филиал")}
                                    name="branch"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={branches}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Gender")}
                                    name="gender"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={genderList}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Passport seria")}
                                    name={'passportSeries'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={'aa'}  className={'uppercase'} placeholder={'__'} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Passport number")}
                                    name={'passportNumber'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={'9999999'} placeholder={'_______'} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("PINFL")}
                                    name={'pin'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={'99999999999999'} placeholder={'______________'}  />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Region")}
                                    name="region"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={regions}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("District")}
                                    name="district"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={districtList}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Address")}
                                    name="address"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("job_title")}
                                    name="job_title"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item
                                    label={t("Date of birth")}
                                    name={'dateofbirth'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <DatePicker  format="DD-MM-YYYY"  />
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
                    width={900}>
                <Spin spinning={isPendingUpdate}>
                    <Form
                        layout={'vertical'}
                        onFinish={update}
                        autoComplete="off"
                        form={form}
                    >
                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Полное имя")}
                                    name="fullname"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Position")}
                                    name="position"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={positionList}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Document type")}
                                    name="typeofdocumentsformanager"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={documentTypeList}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Document number")}
                                    name="documentnumber"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item
                                    label={t("Document date")}
                                    name={'dateofmanagerdocument'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <DatePicker  format="DD-MM-YYYY"  />
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item
                                    label={t("Expration date")}
                                    name={'expirationdate'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <DatePicker  format="DD-MM-YYYY"  />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Телефон")}
                                    name={'telephonenumber'}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={"+\\9\\98 (99) 999-99-99"}  />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={'emailforcontacts'}
                                    rules={[
                                        {
                                            type: 'email',
                                            message: t('Введите действительный адрес электронной почты'),
                                        },
                                        {required: true, message: t('Обязательное поле')}
                                    ]}
                                >
                                    <Input  />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Филиал")}
                                    name="branch"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={branches}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Gender")}
                                    name="gender"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={genderList}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Passport seria")}
                                    name={'passportSeries'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={'aa'}  className={'uppercase'} placeholder={'__'} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Passport number")}
                                    name={'passportNumber'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={'9999999'} placeholder={'_______'} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("PINFL")}
                                    name={'pin'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={'99999999999999'} placeholder={'______________'}  />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Region")}
                                    name="region"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={regions}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("District")}
                                    name="district"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={districtList}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("Address")}
                                    name="address"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    label={t("job_title")}
                                    name="job_title"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={4}>
                                <Form.Item
                                    label={t("Date of birth")}
                                    name={'dateofbirth'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <DatePicker  format="DD-MM-YYYY"  />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={null}>
                                    <Button  type="primary" htmlType="submit" className={'font-medium mt-3 min-w-40'}>
                                        {t('Save')}
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

export default EmployeesPage;
