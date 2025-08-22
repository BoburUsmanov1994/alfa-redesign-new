import React, {useEffect, useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {
    Button,
    Col,
    DatePicker,
    Divider,
    Drawer,
    Flex,
    Form,
    Input, InputNumber, notification,
    Popconfirm,
    Row,
    Select,
    Spin,
    Switch,
    Tooltip, Typography
} from "antd";
import {PlusOutlined, DeleteOutlined, EditOutlined, DownloadOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useDeleteQuery, useGetAllQuery, usePostQuery, usePutQuery} from "../../../hooks/api";
import {isNil} from "lodash/lang";
import {get, isEqual} from "lodash";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../utils";
import dayjs from "dayjs";
import config from "../../../config";
import MaskedInput from "../../../components/masked-input";
import {PERSON_TYPE} from "../../../constants";
import CustomUpload from "../../../components/custom-upload";
import {find} from "lodash/collection";

const AgentsPage = () => {
    const [form] = Form.useForm();
    const {t} = useTranslation()
    const ref = useRef();
    const [open, setOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const {mutate, isPending} = usePostQuery({})
    const personType =  Form.useWatch('typeofpersons', form)
    const group =  Form.useWatch('group', form)
    const productSubGroupId =  Form.useWatch('subGroup', form)
    const productId =  Form.useWatch('product', form)
    const regionId =  Form.useWatch(['person','region'], form)
    const orgRegionId = Form.useWatch(['organization','region'], form)
    const {mutate: updateRequest, isPending: isPendingUpdate} = usePutQuery({})
    const {mutate: removeRequest, isPending: isPendingRemove} = useDeleteQuery({})

    let {data: branches} = useGetAllQuery({
        key: KEYS.branches, url: `${URLS.branches}/list`, params: {
            params: {
                limit: 100
            }
        }
    })
    branches = getSelectOptionsListFromData(get(branches, `data.data`, []), '_id', 'branchName')

    let { data: agentTypes } = useGetAllQuery({
        key: KEYS.typeofagent,
        url: `${URLS.typeofagent}/list`,
    });
    agentTypes = getSelectOptionsListFromData(
        get(agentTypes, `data.data`, []),
        "_id",
        "name"
    );

    let { data: genders } = useGetAllQuery({
        key: KEYS.genders,
        url: `${URLS.genders}/list`,
    });
    genders = getSelectOptionsListFromData(
        get(genders, `data.data`, []),
        "_id",
        "name"
    );

    let { data: citizenshipList } = useGetAllQuery({
        key: KEYS.residentType,
        url: `${URLS.residentType}`,
    });
    citizenshipList = getSelectOptionsListFromData(
        get(citizenshipList, `data.data`, []),
        "_id",
        "name"
    );

    let { data: regions } = useGetAllQuery({
        key: KEYS.regions,
        url: `${URLS.regions}/list`,
    });
    regions = getSelectOptionsListFromData(
        get(regions, `data.data`, []),
        "_id",
        "name"
    );

    let { data: districts } = useGetAllQuery({
        key: KEYS.districtsByRegion,
        url: `${URLS.districts}/list`,
        params: {
            params: {
                region:regionId || orgRegionId,
            },
        },
        enabled: !!(regionId || orgRegionId),
    });
    districts = getSelectOptionsListFromData(
        get(districts, `data.data`, []),
        "_id",
        "name"
    );

    let { data: employeeList } = useGetAllQuery({
        key: KEYS.employee,
        url: `${URLS.employee}/list`,
    });
    employeeList = getSelectOptionsListFromData(
        get(employeeList, `data.data`, []),
        "_id",
        "fullname"
    );

    let {data: groups} = useGetAllQuery({
        key: KEYS.groupsofproducts,
        url: `${URLS.groupsofproducts}/list`,
    })
    const groupsList = getSelectOptionsListFromData(get(groups, `data.data`, []), '_id', 'name')

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
    let subGroupList = getSelectOptionsListFromData(get(subGroups, `data.data`, []), '_id', 'name')

    let {data: productsList} = useGetAllQuery({
        key: [KEYS.productsfilter, productSubGroupId],
        url: URLS.products,
        params: {
            params: {
                subGroup: productSubGroupId
            }
        },
        enabled: !!productSubGroupId
    })
    let {data: productsAll} = useGetAllQuery({
        key: [KEYS.productsfilter],
        url: URLS.products,
    })
      productsAll = getSelectOptionsListFromData(
        get(productsAll, `data.data`, []),
        "_id",
        ["name"]
    );

    let  products = getSelectOptionsListFromData(
        get(productsList, `data.data`, []),
        "_id",
        ["name"]
    );


    let { data: classes } = useGetAllQuery({
        key: KEYS.classes,
        url: `${URLS.insuranceClass}/list`,
    });
    const classOptions = getSelectOptionsListFromData(
        get(classes, `data.data`, []),
        "_id",
        "name"
    );

    const create = (attrs) => {
        const {product,allowAgreement,group,limitOfAgreement,subGroup,...rest} = attrs;
        mutate({url: URLS.agents, attributes: {...rest}}, {
            onSuccess: () => {
                setOpen(false)
                ref.current?.reload()
                form.resetFields()
            }
        })
    }

    const update = (attrs) => {
        updateRequest({
            url: `${URLS.agents}/${get(currentRecord, '_id')}`, attributes: {...attrs}
        }, {
            onSuccess: () => {
                setCurrentRecord(null)
                ref.current?.reload()
                form.resetFields()
            }
        })
    }
    const remove = (_id) => {
        removeRequest({url: `${URLS.agents}/${_id}`}, {
            onSuccess: () => {
                ref.current?.reload()
            }
        })
    }

    const handleAdd = () => {
        const tariff = form.getFieldValue('tariff') || [];
        if(form.getFieldValue('product')) {
            const newTariff = {product: form.getFieldValue('product'), allowAgreement: form.getFieldValue('allowAgreement'), limitOfAgreement: form.getFieldValue('limitOfAgreement'), 'tariffPerClass': get(find(get(productsList, `data.data`, []),(_item)=>isEqual(get(_item,'_id'),productId)),'tariff.tariffPerClass',[]).map(({class:classItem,...rest})=>({...rest,class:get(classItem,'_id')}))};
            form.setFieldValue(
                'tariff', [...tariff, newTariff]
            );
        }else{
            notification['warning']({
                message:  t('Выбрать продукт')
            })
        }
    };

    useEffect(() => {
        if (currentRecord) {
            form.setFieldsValue(currentRecord);
            form.setFieldValue('branch', get(currentRecord, 'branch._id'))
            form.setFieldValue('typeofagent', get(currentRecord, 'typeofagent._id'))
            form.setFieldValue('agreementdate', dayjs(get(currentRecord, 'agreementdate')))
            form.setFieldValue(['person','dateofbirth'], dayjs(get(currentRecord, 'person.dateofbirth')))
            form.setFieldValue(['person','passportissuancedate'], dayjs(get(currentRecord, 'person.passportissuancedate')))
        }
    }, [currentRecord]);

    useEffect(() => {
        form.setFieldValue('allowAgreement', get(find(get(productsList, `data.data`, []),(_item)=>isEqual(get(_item,'_id'),productId)),'tariff.allowAgreement',false))
        form.setFieldValue('limitOfAgreement', get(find(get(productsList, `data.data`, []),(_item)=>isEqual(get(_item,'_id'),productId)),'tariff.limitOfAgreement',0))
    },[productId])

    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Страховые агенты')}
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
                        render: (_, record) => get(record, 'branch.branchName'),
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: branches
                        },
                        width: 200,
                    },
                    {
                        title: t('INN'),
                        dataIndex: 'inn',
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Agent type'),
                        dataIndex: 'typeofagent',
                        render: (_, record) => get(record, 'typeofagent.name'),
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Название организации'),
                        dataIndex: 'organization',
                        render: (_, record) => get(record, 'organization.nameoforganization','-'),
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Полное имя'),
                        dataIndex: 'person',
                        render: (_, record) => `${get(record, 'person.secondname','-')} ${get(record, 'person.name','-')} ${get(record, 'person.middlename','-')}`,
                        hideInSearch: true,
                        width:250
                    },
                    {
                        title: t('Номер соглашения'),
                        dataIndex: 'agreementnumber',
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Дата соглашения'),
                        dataIndex: 'agreementdate',
                        hideInSearch: true,
                        render:(_,_tr)=>dayjs(get(_tr,'agreementdate')).format("DD-MM-YYYY"),
                        align: 'center',
                    },
                    {
                        title: t('Файл соглашения'),
                        dataIndex: 'agreementPath',
                        align: 'center',
                        valueType: 'link',
                        render: (_, record) =>get(record,'agreementPath',) && <Button size={'large'} icon={<DownloadOutlined />} type={'link'} href={`${config.FILE_URL}/${get(record,'agreementPath')}`} target={'_blank'} />,
                        hideInSearch:true,
                        width: 125,
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
                        width: 150,
                    },
                ]}
                url={`${URLS.agents}/list`}
            />
            <Drawer open={open} title={t('Добавить')} onClose={() => {
                setOpen(false)
                setCurrentRecord(null)
                form.resetFields()
            }} width={1280}>
                <Spin spinning={isPending}>
                    <Form
                        form={form}
                        name="agent"
                        layout={'vertical'}
                        onFinish={create}
                        autoComplete="off"
                    >
                        <Row gutter={16}>
                            <Col span={6}>
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
                            <Col span={6}>
                                <Form.Item
                                    label={t("ИНН")}
                                    name={'inn'}
                                >
                                    <MaskedInput  mask={'99999999'} maskChar={null}  />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Номер соглашения")}
                                    name="agreementnumber"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Дата соглашения")}
                                    name={'agreementdate'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <DatePicker  format="DD-MM-YYYY"  />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Тип агента")}
                                    name="typeofagent"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={agentTypes}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Бенефициар")}
                                    name="isbeneficiary"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Фиксированный держатель полиса")}
                                    name="isfixedpolicyholder"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Тип лица")}
                                    name="typeofpersons"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={[
                                            {
                                                value: PERSON_TYPE.person,
                                                label: t(PERSON_TYPE.person),
                                            },
                                            {
                                                value: PERSON_TYPE.organization,
                                                label: t(PERSON_TYPE.organization),
                                            },
                                        ]}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            {
                                isEqual(personType,PERSON_TYPE.person) && <>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Photo")}
                                            name={['person','photo']}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Имя")}
                                            name={['person','name']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Отчество")}
                                            name={['person','middlename']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Фамилия")}
                                            name={['person','secondname']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Пол")}
                                            name={['person','gender']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={genders}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Дата рождения")}
                                            name={['person','dateofbirth']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <DatePicker  format="DD-MM-YYYY"  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Гражданство")}
                                            name={['person','citizenship']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={citizenshipList}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            name={['person','typeofdocument']}
                                            label={t('Тип документа')}
                                        >
                                           <CustomUpload   form={form}  name={['person','typeofdocument']}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Passport seria")}
                                            name={['person','passportSeries']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput  mask={'aa'} maskChar={null} placeholder={'__'} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Passport number")}
                                            name={['person','passportNumber']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput  mask={'9999999'} maskChar={null} placeholder={'_______'} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("PINFL")}
                                            name={['person','pin']}
                                        >
                                            <MaskedInput  mask={'99999999999999'} maskChar={null} placeholder={'______________'} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Дата выдачи паспорта")}
                                            name={['person','passportissuancedate']}
                                        >
                                            <DatePicker  format="DD-MM-YYYY"  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Кем выдан паспорт")}
                                            name={['person','passportissuedby']}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Region")}
                                            name={['person','region']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={regions}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("District")}
                                            name={['person','district']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={districts}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Адрес")}
                                            name={['person','address']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Почтовый индекс")}
                                            name={['person','postcode']}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Телефон")}
                                            name={['person','telephonenumber']}
                                            getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                        >
                                            <MaskedInput  mask={"+\\9\\98 (99) 999-99-99"}  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Электронная почта")}
                                            name={['person','emailforcontact']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Личный счёт")}
                                            name={['person','personalaccount']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Транзитный счёт")}
                                            name={['person','transitaccount']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("МФО")}
                                            name={['person','mfo']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Название банка")}
                                            name={['person','nameofbank']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Номер карты")}
                                            name={['person','numberofcard']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                </>
                            }

                            {
                                isEqual(personType,PERSON_TYPE.organization) && <>
                                <Col span={6}>
                                    <Form.Item
                                        label={t("Название организации")}
                                        name={['organization','nameoforganization']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("ОКЭД")}
                                            name={['organization','oked']}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("МФО")}
                                            name={['organization','mfo']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Название банка")}
                                            name={['organization','nameofbank']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("ИНН банка")}
                                            name={['organization','innofbank']}
                                        >
                                            <MaskedInput  mask={'99999999'} maskChar={null} placeholder={'_________'}  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Плановый счёт")}
                                            name={['organization','scheduledaccount']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Region")}
                                            name={['organization','region']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={regions}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("District")}
                                            name={['organization','district']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={districts}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Адрес")}
                                            name={['organization','address']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Почтовый индекс")}
                                            name={['organization','postcode']}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Расчётный счёт")}
                                            name={['organization','checkingaccount']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Сотрудники")}
                                            name={['organization','employees']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                mode={'multiple'}
                                                allowClear
                                                showSearch
                                                options={employeeList}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                </>
                                }

                            <Col span={6}>
                                <Form.Item
                                    label={t("UUID")}
                                    name="uuid"
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Используется наша панель")}
                                    name="isUsedourpanel"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Используется наш API?")}
                                    name="isUserRestAPI"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Divider orientation="left"><Typography.Title level={4}>{t("Тарифы")}</Typography.Title></Divider>
                            </Col>
                            <Col span={24}>
                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Form.Item name={'group'} label={t('Выберите категорию')}>
                                            <Select allowClear showSearch options={groupsList} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={'subGroup'} label={t('Выберите подкатегорию')}>
                                            <Select allowClear showSearch options={subGroupList} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={'product'} label={t('Продукты')}>
                                            <Select  allowClear showSearch options={products} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={'allowAgreement'} label={t('Разрешить заключение договоров')} valuePropName="checked"
                                                   initialValue={false}>
                                            <Switch/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                    <Form.Item name={'limitOfAgreement'} label={t('Лимит ответственности')}>
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
                                        <Form.Item label={' '}>
                                        <Button onClick={handleAdd}>{t('Применить')}</Button>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider />
                                <Form.List name="tariff">
                                    {(fields, { remove }) => (
                                        <>
                                        {fields.map(({ key, name, fieldKey, ...restField }) => <Col span={24}>
                                            <Row gutter={16}>
                                                <Col span={6}>
                                            <Form.Item
                                                {...restField}
                                                label={t('Продукты')}
                                                name={[name, 'product']}
                                                rules={[{required: true, message: t('Обязательное поле')}]}
                                            >
                                                        <Select  disabled options={productsAll} />
                                            </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item
                                                        label={t("Разрешить заключение договоров")}
                                                        name={[name, 'allowAgreement']}
                                                        valuePropName="checked"
                                                        initialValue={false}
                                                    >
                                                        <Switch disabled/>
                                                    </Form.Item>
                                                </Col>
                                                <Col span={4}>
                                                    <Form.Item name={[name,'limitOfAgreement']} label={t('Лимит ответственности')}>
                                                        <InputNumber
                                                            disabled
                                                            style={{ width: '100%' }}
                                                            min={0}
                                                            formatter={(value) =>
                                                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                            }
                                                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                        />
                                                    </Form.Item>
                                                </Col>
                                                <Col span={9}>
                                                    <Form.List name={[name,'tariffPerClass']}>
                                                        {
                                                            (childFields) => (<>{childFields?.map(({name:_name,..._restField})=>{
                                                                return (
                                                                    <Row gutter={8}>
                                                                        <Col span={10}>
                                                                            <Form.Item
                                                                                {..._restField}
                                                                                label={t('Class')}
                                                                                name={[_name, 'class']}
                                                                                rules={[{required: true, message: t('Обязательное поле')}]}
                                                                            >
                                                                                <Select  disabled   options={classOptions} />
                                                                            </Form.Item>
                                                                        </Col>
                                                                        <Col span={6}>
                                                                            <Form.Item
                                                                                {..._restField}
                                                                                label={t('Min')}
                                                                                name={[_name, 'min']}

                                                                            >
                                                                                <InputNumber />
                                                                            </Form.Item>
                                                                        </Col>
                                                                        <Col span={6}>
                                                                            <Form.Item
                                                                                {..._restField}
                                                                                label={t('Max')}
                                                                                name={[_name, 'max']}

                                                                            >
                                                                                <InputNumber />
                                                                            </Form.Item>
                                                                        </Col>
                                                                    </Row>
                                                                )
                                                            })}</>)
                                                        }
                                                    </Form.List>
                                                </Col>
                                                <Col span={1}>
                                                    <Form.Item label={' '}>
                                                        <Button type="primary" onClick={()=>remove(name)} danger icon={<DeleteOutlined />} shape={'circle'} />
                                                    </Form.Item>
                                                </Col>
                                            </Row>
                                        </Col>)}
                                        </>)
                                    }
                                </Form.List>

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
            <Drawer open={!isNil(currentRecord)} title={t('Редактировать')} onClose={() => {
                setCurrentRecord(null)
                setOpen(false)
                form.resetFields()
            }}
                    width={1280}>
                <Spin spinning={isPendingUpdate}>
                    <Form
                        form={form}
                        name="agent"
                        layout={'vertical'}
                        onFinish={update}
                        autoComplete="off"
                    >
                        <Row gutter={16}>
                            <Col span={6}>
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
                            <Col span={6}>
                                <Form.Item
                                    label={t("ИНН")}
                                    name={'inn'}
                                >
                                    <MaskedInput  mask={'99999999'} maskChar={null}  />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Номер соглашения")}
                                    name="agreementnumber"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Дата соглашения")}
                                    name={'agreementdate'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <DatePicker  format="DD-MM-YYYY"  />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Тип агента")}
                                    name="typeofagent"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={agentTypes}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Бенефициар")}
                                    name="isbeneficiary"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Фиксированный держатель полиса")}
                                    name="isfixedpolicyholder"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Тип лица")}
                                    name="typeofpersons"
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select
                                        allowClear
                                        showSearch
                                        options={[
                                            {
                                                value: PERSON_TYPE.person,
                                                label: t(PERSON_TYPE.person),
                                            },
                                            {
                                                value: PERSON_TYPE.organization,
                                                label: t(PERSON_TYPE.organization),
                                            },
                                        ]}
                                        placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            {
                                isEqual(personType,PERSON_TYPE.person) && <>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Photo")}
                                            name={['person','photo']}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Имя")}
                                            name={['person','name']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Отчество")}
                                            name={['person','middlename']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Фамилия")}
                                            name={['person','secondname']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Пол")}
                                            name={['person','gender']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={genders}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Дата рождения")}
                                            name={['person','dateofbirth']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <DatePicker  format="DD-MM-YYYY"  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Гражданство")}
                                            name={['person','citizenship']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={citizenshipList}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            name={['person','typeofdocument']}
                                            label={t('Тип документа')}
                                        >
                                            <CustomUpload   form={form}  name={['person','typeofdocument']}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Passport seria")}
                                            name={['person','passportSeries']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput  mask={'aa'} maskChar={null} placeholder={'__'} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Passport number")}
                                            name={['person','passportNumber']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput  mask={'9999999'} maskChar={null} placeholder={'_______'} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("PINFL")}
                                            name={['person','pin']}
                                        >
                                            <MaskedInput  mask={'99999999999999'} maskChar={null} placeholder={'______________'} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Дата выдачи паспорта")}
                                            name={['person','passportissuancedate']}
                                        >
                                            <DatePicker  format="DD-MM-YYYY"  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Кем выдан паспорт")}
                                            name={['person','passportissuedby']}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Region")}
                                            name={['person','region']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={regions}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("District")}
                                            name={['person','district']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={districts}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Адрес")}
                                            name={['person','address']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Почтовый индекс")}
                                            name={['person','postcode']}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Телефон")}
                                            name={['person','telephonenumber']}
                                            getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                        >
                                            <MaskedInput  mask={"+\\9\\98 (99) 999-99-99"}  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Электронная почта")}
                                            name={['person','emailforcontact']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Личный счёт")}
                                            name={['person','personalaccount']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Транзитный счёт")}
                                            name={['person','transitaccount']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("МФО")}
                                            name={['person','mfo']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Название банка")}
                                            name={['person','nameofbank']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Номер карты")}
                                            name={['person','numberofcard']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                </>
                            }

                            {
                                isEqual(personType,PERSON_TYPE.organization) && <>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Название организации")}
                                            name={['organization','nameoforganization']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("ОКЭД")}
                                            name={['organization','oked']}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("МФО")}
                                            name={['organization','mfo']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Название банка")}
                                            name={['organization','nameofbank']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("ИНН банка")}
                                            name={['organization','innofbank']}
                                        >
                                            <MaskedInput  mask={'99999999'} maskChar={null} placeholder={'_________'}  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Плановый счёт")}
                                            name={['organization','scheduledaccount']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Region")}
                                            name={['organization','region']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={regions}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("District")}
                                            name={['organization','district']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                allowClear
                                                showSearch
                                                options={districts}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Адрес")}
                                            name={['organization','address']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Почтовый индекс")}
                                            name={['organization','postcode']}
                                        >
                                            <Input />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Расчётный счёт")}
                                            name={['organization','checkingaccount']}
                                        >
                                            <Input  />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item
                                            label={t("Сотрудники")}
                                            name={['organization','employees']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Select
                                                mode={'multiple'}
                                                allowClear
                                                showSearch
                                                options={employeeList}
                                                placeholder={t('Выбирать')}/>
                                        </Form.Item>
                                    </Col>
                                </>
                            }

                            <Col span={6}>
                                <Form.Item
                                    label={t("UUID")}
                                    name="uuid"
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Используется наша панель")}
                                    name="isUsedourpanel"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Используется наш API?")}
                                    name="isUserRestAPI"
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Divider orientation="left"><Typography.Title level={4}>{t("Тарифы")}</Typography.Title></Divider>
                            </Col>
                            <Col span={24}>
                                <Row gutter={16}>
                                    <Col span={6}>
                                        <Form.Item name={'group'} label={t('Выберите категорию')}>
                                            <Select allowClear showSearch options={groupsList} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={'subGroup'} label={t('Выберите подкатегорию')}>
                                            <Select allowClear showSearch options={subGroupList} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={'product'} label={t('Продукты')}>
                                            <Select  allowClear showSearch options={products} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={'allowAgreement'} label={t('Разрешить заключение договоров')} valuePropName="checked"
                                                   initialValue={false}>
                                            <Switch/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item name={'limitOfAgreement'} label={t('Лимит ответственности')}>
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
                                        <Form.Item label={' '}>
                                            <Button onClick={handleAdd}>{t('Применить')}</Button>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Divider />
                                <Form.List name="tariff">
                                    {(fields, { remove }) => (
                                        <>
                                            {fields.map(({ key, name, fieldKey, ...restField }) => <Col span={24}>
                                                <Row gutter={16}>
                                                    <Col span={6}>
                                                        <Form.Item
                                                            {...restField}
                                                            label={t('Продукты')}
                                                            name={[name, 'product']}
                                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                                        >
                                                            <Select  disabled options={productsAll} />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item
                                                            label={t("Разрешить заключение договоров")}
                                                            name={[name, 'allowAgreement']}
                                                            valuePropName="checked"
                                                            initialValue={false}
                                                        >
                                                            <Switch disabled/>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={4}>
                                                        <Form.Item name={[name,'limitOfAgreement']} label={t('Лимит ответственности')}>
                                                            <InputNumber
                                                                disabled
                                                                style={{ width: '100%' }}
                                                                min={0}
                                                                formatter={(value) =>
                                                                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                                }
                                                                parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={9}>
                                                        <Form.List name={[name,'tariffPerClass']}>
                                                            {
                                                                (childFields) => (<>{childFields?.map(({name:_name,..._restField})=>{
                                                                    return (
                                                                        <Row gutter={8}>
                                                                            <Col span={10}>
                                                                                <Form.Item
                                                                                    {..._restField}
                                                                                    label={t('Class')}
                                                                                    name={[_name, 'class']}
                                                                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                                                                >
                                                                                    <Select  disabled   options={classOptions} />
                                                                                </Form.Item>
                                                                            </Col>
                                                                            <Col span={6}>
                                                                                <Form.Item
                                                                                    {..._restField}
                                                                                    label={t('Min')}
                                                                                    name={[_name, 'min']}

                                                                                >
                                                                                    <InputNumber />
                                                                                </Form.Item>
                                                                            </Col>
                                                                            <Col span={6}>
                                                                                <Form.Item
                                                                                    {..._restField}
                                                                                    label={t('Max')}
                                                                                    name={[_name, 'max']}

                                                                                >
                                                                                    <InputNumber />
                                                                                </Form.Item>
                                                                            </Col>
                                                                        </Row>
                                                                    )
                                                                })}</>)
                                                            }
                                                        </Form.List>
                                                    </Col>
                                                    <Col span={1}>
                                                        <Form.Item label={' '}>
                                                            <Button type="primary" onClick={()=>remove(name)} danger icon={<DeleteOutlined />} shape={'circle'} />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Col>)}
                                        </>)
                                    }
                                </Form.List>

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

export default AgentsPage;
