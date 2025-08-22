import React, {useEffect, useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {
    Button,
    Col,
    DatePicker,
    Drawer,
    Flex,
    Form,
    Input,
    Popconfirm,
    Row,
    Select,
    Space,
    Spin,
    Switch,
    Tooltip
} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined,ReloadOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import {get, head} from "lodash";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../utils";
import {URLS} from "../../../constants/url";
import Datagrid from "../../../containers/datagrid";
import {useDeleteQuery, useGetAllQuery, usePostQuery, usePutQuery} from "../../../hooks/api";
import {PERSON_TYPE} from "../../../constants";
import MaskedInput from "../../../components/masked-input";
import dayjs from "dayjs";
import {KEYS} from "../../../constants/key";
import {upperCase} from "lodash/string";
import {isNil} from "lodash/lang";
import {useStore} from "../../../store";

const PhysicalClientsPage = () => {
    const {t} = useTranslation()
    const ref = useRef();
    const {user} = useStore()
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const formRef = useRef();

    const regionId =  Form.useWatch(['person','region'], form)

    const {mutate, isPending} = usePostQuery({})
    const {mutate: updateRequest, isPending: isPendingUpdate} = usePutQuery({})
    const {mutate: removeRequest, isPending: isPendingRemove} = useDeleteQuery({})
    const {
        mutate: getPersonalInfoRequest, isPending: isLoadingPersonalInfo
    } = usePostQuery({listKeyId: KEYS.personalInfoProvider})


    const {data: branches,isLoading:isLoadingBranch} = useGetAllQuery({
        key: KEYS.branches, url: `${URLS.branches}/list`
    })
    const branchesList = getSelectOptionsListFromData(get(branches, `data.data`, []), '_id', 'branchName')

    const {data: genders} = useGetAllQuery({
        key: KEYS.genders, url: `${URLS.genders}/list`
    })
    const genderList = getSelectOptionsListFromData(get(genders, `data.data`, []), '_id', 'name')

    const {data: residentTypes} = useGetAllQuery({
        key: KEYS.residentTypes, url: `${URLS.residentTypes}/list`
    })

    const residentTypeList = getSelectOptionsListFromData(get(residentTypes, `data.data`, []), '_id', 'name')

    const {data: country} = useGetAllQuery({
        key: KEYS.countries, url: `${URLS.countries}/list`
    })
    const countryList = getSelectOptionsListFromData(get(country, `data.data`, []), '_id', 'name')

    const {data: region} = useGetAllQuery({
        key: KEYS.regions, url: `${URLS.regions}/list`
    })
    const regionList = getSelectOptionsListFromData(get(region, `data.data`, []), '_id', 'name')

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
    const getInfo = () => {

        getPersonalInfoRequest({
                url: URLS.personalInfoProvider, attributes: {
                    birthDate: dayjs(form.getFieldValue(['person','birthDate'])).format('YYYY-MM-DD'),
                    passportSeries:upperCase(form.getFieldValue(['person','passportData','seria'])),
                    passportNumber:form.getFieldValue(['person','passportData','number'])
                }
            },
            {
                onSuccess: ({data:response}) => {
                   form.setFieldValue(['person','fullName','firstname'],get(response,'firstNameLatin'))
                   form.setFieldValue(['person','fullName','lastname'],get(response,'lastNameLatin'))
                   form.setFieldValue(['person','fullName','middlename'],get(response,'middleNameLatin'))
                   form.setFieldValue(['person','passportData','startDate'],dayjs(get(head(get(response, 'documents', [])), 'datebegin')))
                   form.setFieldValue(['person','passportData','issuedBy'],get(head(get(response, 'documents', [])), 'docgiveplace'))
                   form.setFieldValue(['person','gender'],get(response,'gender'))
                   form.setFieldValue(['person','passportData','pinfl'],get(response,'pinfl'))
                   form.setFieldValue(['person','email'],get(response,'email'))
                   form.setFieldValue(['person','residentType'],get(response,'residentType'))
                   form.setFieldValue(['person','region'],get(response,'regionId'))
                   form.setFieldValue(['person','district'],get(response,'districtId'))
                   form.setFieldValue(['person','address'],get(response,'address'))
                }
            }
        )
    }

    const create = (attrs) => {
        mutate({url: URLS.clients, attributes: {...attrs,type:PERSON_TYPE.person}}, {
            onSuccess: () => {
                setOpen(false)
                form.resetFields()
                ref.current?.reload()
            }
        })
    }

    const update = (attrs) => {
        updateRequest({
            url: `${URLS.clients}/${get(currentRecord, '_id')}`, attributes: {...attrs}
        }, {
            onSuccess: () => {
                setCurrentRecord(null)
                ref.current?.reload()
            }
        })
    }
    const remove = (_id) => {
        removeRequest({url: `${URLS.clients}/${_id}`}, {
            onSuccess: () => {
                ref.current?.reload()
            }
        })
    }

    useEffect(() => {
        if (currentRecord) {
            form.setFieldsValue(currentRecord);
            form.setFieldValue(['person','passportData','startDate'],dayjs(get(currentRecord, 'person.passportData.startDate')))
            form.setFieldValue(['person','birthDate'],dayjs(get(currentRecord, 'person.birthDate')))
        }
    }, [currentRecord]);
    if(isLoadingBranch){
        return <Spin spinning fullscreen />
    }
    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Клиенты')}
                extra={[
                    <Button type="primary" icon={<PlusOutlined/>} onClick={() => setOpen(true)}>
                        {t('Добавить')}
                    </Button>,
                ]}
            />
            <Datagrid
                formRef={formRef}
                defaultCollapsed
                actionRef={ref}
                params={{
                    type: PERSON_TYPE.person
                }}
                columns={[
                    {
                        title: t('Филиал'),
                        dataIndex: 'branch',
                        render: (_, record) => get(record, 'branch.branchName'),
                        valueType: 'select',
                        initialValue:get(user,'branch._id'),
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options:branchesList
                        },
                    },
                    {
                        title: t('Имя'),
                        dataIndex: 'firstname',
                        render: (_, record) => get(record, 'person.fullName.firstname'),
                        align: 'center'
                    },
                    {
                        title: t('Фамилия'),
                        dataIndex: 'lastname',
                        render: (_, record) => get(record, 'person.fullName.lastname'),
                        align: 'center'
                    },
                    {
                        title: t('Отчество'),
                        dataIndex: 'middlename',
                        render: (_, record) => get(record, 'person.fullName.middlename'),
                        align: 'center'
                    },
                    {
                        title: t('ПИНФЛ'),
                        dataIndex: 'pinfl',
                        render: (_, record) => get(record, 'person.passportData.pinfl'),
                        align: 'center'
                    },
                    {
                        title: t('Серия паспорта'),
                        dataIndex: 'seria',
                        render: (_, record) => get(record, 'person.passportData.seria'),
                        align: 'right'
                    },
                    {
                        title: t('Номер паспорта'),
                        dataIndex: 'number',
                        render: (_, record) => get(record, 'person.passportData.number'),
                    },
                    {
                        title: t('Номер телефона'),
                        dataIndex: 'phone',
                        render: (_, record) => get(record, 'person.phone'),
                        align: 'center'
                    },

                    {
                        title: t('Действия'),
                        valueType: 'option',
                        align: 'right',
                        render: (text, record) => [
                            <Flex justify={'flex-end'} gap={"middle"} flex={1}>
                                <Tooltip title={t('Редактировать')}>
                                    <Button onClick={()=>setCurrentRecord(record)} shape="circle"
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
                url={`${URLS.clients}/list`}
            />
            <Drawer open={open || !isNil(currentRecord)} title={currentRecord ? t('Редактировать') : t('Добавить')} onClose={() => {
                setOpen(false)
                setCurrentRecord(null)
            }} width={1000}>
                <Spin spinning={isPending || isPendingUpdate}>
                    <Form
                        form={form}
                        name="client"
                        layout={'vertical'}
                        onFinish={currentRecord ? update : create}
                        autoComplete="off"
                    >
                        <Row gutter={16} align={'bottom'}>
                            <Col span={3}>
                                <Form.Item
                                    label={t("Серия")}
                                    name={['person','passportData','seria']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                   <MaskedInput  mask={'aa'} maskChar={null} className={'uppercase'} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Номер паспорта")}
                                    name={['person','passportData','number']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={'9999999'}  />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Space align={'end'}>
                                    <Form.Item
                                        label={t("Дата рождения")}
                                        name={['person','birthDate']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <DatePicker  format="DD-MM-YYYY"  />
                                    </Form.Item>
                                    <Form.Item label={null}>
                                        <Button className={'ml-3'} shape={'circle'} icon={<ReloadOutlined />} onClick={getInfo} loading={isLoadingPersonalInfo} />
                                    </Form.Item>
                                </Space>
                            </Col>

                        </Row>
                        <Row gutter={16} align={'bottom'}>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Имя")}
                                    name={['person','fullName','firstname']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Фамилия")}
                                    name={['person','fullName','lastname']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Отчество")}
                                    name={['person','fullName','middlename']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Дата выдачи паспорта")}
                                    name={['person','passportData','startDate']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <DatePicker format="DD-MM-YYYY"   />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Кем выдан")}
                                    name={['person','passportData','issuedBy']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Пол")}
                                    name={['person','gender']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select options={genderList}
                                            placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("ПИНФЛ")}
                                    name={['person','passportData','pinfl']}
                                >
                                    <MaskedInput  mask={'99999999999999'} maskChar={null} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Телефон")}
                                    name={['person','phone']}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={"+\\9\\98 (99) 999-99-99"}  />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={['person','email']}
                                >
                                    <Input  />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Тип резидента")}
                                    name={['person','residentType']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select options={residentTypeList}
                                            placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Страна")}
                                    name={['person','country']}
                                >
                                    <Select disabled defaultValue={210} options={countryList}
                                            placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Регион")}
                                    name={['person','region']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select  options={regionList}
                                            placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Район")}
                                    name={['person','district']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select  options={districtList}
                                             placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
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
                                    name="isUseOurPanel"
                                    label={t('Используется наша панель?')}
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    name="isUseRestAPI"
                                    label={t('Используется RestAPI?')}
                                    valuePropName="checked"
                                    initialValue={false}
                                >
                                    <Switch />
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                            <Form.Item label={null}>
                                <Button  type="primary" htmlType="submit" className={'font-medium min-w-60 mt-6'}>
                                    {currentRecord ? t('Сохранить') : t('Отправить')}
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

export default PhysicalClientsPage;
