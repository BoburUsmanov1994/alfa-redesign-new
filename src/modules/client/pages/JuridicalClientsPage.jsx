import React, {useEffect, useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {
    Button,
    Col,
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
import {KEYS} from "../../../constants/key";
import {isNil} from "lodash/lang";
import {useStore} from "../../../store";

const JuridicalClientsPage = () => {
    const {t} = useTranslation()
    const ref = useRef();
    const {user} = useStore()
    const [form] = Form.useForm();
    const [open, setOpen] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const formRef = useRef();

    const regionId =  Form.useWatch(['organization','region'], form)

    const {mutate, isPending} = usePostQuery({})
    const {mutate: updateRequest, isPending: isPendingUpdate} = usePutQuery({})
    const {mutate: removeRequest, isPending: isPendingRemove} = useDeleteQuery({})

    const {
        mutate: getOrganizationInfoRequest, isLoading: isLoadingOrganizationInfo
    } = usePostQuery({listKeyId: KEYS.organizationInfoProvider})


    const {data: branches,isLoading:isLoadingBranch} = useGetAllQuery({
        key: KEYS.branches, url: `${URLS.branches}/list`
    })
    const branchesList = getSelectOptionsListFromData(get(branches, `data.data`, []), '_id', 'branchName')


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

    const {data: ownershipForms} = useGetAllQuery({
        key: KEYS.ownershipForms, url: `${URLS.ownershipForms}/list`
    })
    const ownershipFormList = getSelectOptionsListFromData(get(ownershipForms, `data.data`, []), '_id', 'name')
    const getInfo = () => {

        getOrganizationInfoRequest({
                url: URLS.organizationInfoProvider, attributes: {
                    inn:form.getFieldValue(['organization','inn'])
                }
            },
            {
                onSuccess: ({data:response}) => {
                   form.setFieldValue(['organization','name'],get(response,'name'))
                   form.setFieldValue(['organization','representativeName'],get(response,'gdFullName'))
                   form.setFieldValue(['organization','email'],get(response,'email'))
                   form.setFieldValue(['organization','phone'],get(response,'phone')?.length < 10 ?`998${get(response,'phone')}` : get(response,'phone'))
                   form.setFieldValue(['organization','oked'],get(response,'oked'))
                   form.setFieldValue(['organization','checkingAccount'],get(response,'account'))
                   form.setFieldValue(['organization','address'],get(response,'address'))
                   form.setFieldValue(['organization','bankMfo'],get(response,'bankMfo'))
                   form.setFieldValue(['organization','bankName'],get(response,'bankName'))
                   form.setFieldValue(['organization','bankInn'],get(response,'bankInn'))
                }
            }
        )
    }

    const create = (attrs) => {
        mutate({url: URLS.clients, attributes: {...attrs,type:PERSON_TYPE.organization}}, {
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
                    type: PERSON_TYPE.organization
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
                        title: t('Наименование'),
                        dataIndex: 'organization',
                        render: (_, record) => get(record, 'organization.name'),
                    },
                    {
                        title: t('ИНН'),
                        dataIndex: 'inn',
                        render: (_, record) => get(record, 'organization.inn'),
                        align: 'center',
                        copyable:true
                    },
                    {
                        title: t('Номер телефона'),
                        dataIndex: 'phone',
                        render: (_, record) => get(record, 'organization.phone'),
                        align: 'center'
                    },
                    {
                        title: t('Адрес'),
                        dataIndex: 'address',
                        render: (_, record) => get(record, 'organization.address'),
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
                            <Col span={6}>
                                <Form.Item
                                    label={t("ИНН")}
                                    name={['organization','inn']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                   <MaskedInput  mask={'99999999'} maskChar={null}  />
                                </Form.Item>
                            </Col>

                            <Col span={6}>
                                <Space align={'end'}>
                                    <Form.Item label={null}>
                                        <Button  shape={'circle'} icon={<ReloadOutlined />} onClick={getInfo} loading={isLoadingOrganizationInfo} />
                                    </Form.Item>
                                </Space>
                            </Col>

                        </Row>
                        <Row gutter={16} align={'bottom'}>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Наименование")}
                                    name={['organization','name']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Руководитель")}
                                    name={['organization','representativeName']}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Должность")}
                                    name={['organization','position']}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={['organization','email']}
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

                            <Col span={6}>
                                <Form.Item
                                    label={t("Телефон")}
                                    name={['organization','phone']}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={"+\\9\\98 (99) 999-99-99"}  />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("ОКЭД")}
                                    name={['organization','oked']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Расчетный счет")}
                                    name={['organization','checkingAccount']}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Форма собственности")}
                                    name={['organization','ownershipForm']}
                                >
                                    <Select options={ownershipFormList}
                                            placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Страна")}
                                    name={['organization','country']}
                                >
                                    <Select disabled defaultValue={210} options={countryList}
                                            placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Регион")}
                                    name={['organization','region']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select  options={regionList}
                                            placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Район")}
                                    name={['organization','district']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Select  options={districtList}
                                             placeholder={t('Выбирать')}/>
                                </Form.Item>
                            </Col>
                            <Col span={12}>
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
                                    label={t("Представительный документ")}
                                    name={['organization','representativeDoc']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Номер репрезентативного документа")}
                                    name={['organization','representativeDocNumber']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Представитель ПИНФЛ")}
                                    name={['organization','representativePinfl']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={'99999999999999'} maskChar={null} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Представительский паспорт Серия")}
                                    name={['organization','representativePassportSeria']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={'aa'} maskChar={null} className={'uppercase'} />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Номер паспорта представителя")}
                                    name={['organization','representativePassportNumber']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={'9999999'}  />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Банк МФО")}
                                    name={['organization','bankMfo']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    label={t("Название банка")}
                                    name={['organization','bankName']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Банк Инн")}
                                    name={['organization','bankInn']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput  mask={'99999999'} maskChar={null}  />
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

export default JuridicalClientsPage;
