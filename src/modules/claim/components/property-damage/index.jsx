import React, {useState} from 'react';
import {
    Button, Card,
    Col,
    DatePicker,
    Divider,
    Drawer,
    Flex,
    Form,
    Input, InputNumber,
    Radio,
    Row,
    Select,
    Space,
    Spin, Switch,
    Table
} from "antd";
import {DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {get, isEqual, isNil} from "lodash";
import {filter} from "lodash/collection";
import {useTranslation} from "react-i18next";
import MaskedInput from "../../../../components/masked-input";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../../utils";
import {useGetAllQuery, usePutQuery} from "../../../../hooks/api";
import {URLS} from "../../../../constants/url";
import {KEYS} from "../../../../constants/key";
import numeral from "numeral";

const Index = ({
                   isPending = false,
                   residentTypes = [],
                   countryList = [],
                   otherPropertyDamage = [],
                   regions = [],
                   ownershipForms = [],
                   getPersonInfo = () => {
                   },
                   getOrgInfo = () => {
                   },
                   setOtherPropertyDamage,
                   title = 'Добавление информации о вреде имуществу:',
                   _form,
                   claimNumber,
                   refresh = ()=>{},
                   insurantIsOwnerDisabled = false
               }) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const [editRow, setEditRow] = useState(null);
    const [form] = Form.useForm();
    const [updateForm] = Form.useForm();
    const {owner, ownerPerson, ownerOrganization} = Form.useWatch([], form) || {}
    const {mutate, isPending: isPendingUpdate} = usePutQuery({listKeyId: KEYS.claimShow})


    let {data: districts} = useGetAllQuery({
        key: [KEYS.districts, get(ownerPerson, 'regionId'), get(ownerOrganization, 'regionId')],
        url: `${URLS.districts}/list`,
        params: {
            params: {
                region: get(ownerPerson, 'regionId') || get(ownerOrganization, 'regionId')
            }
        },
        enabled: !!(get(ownerPerson, 'regionId') || get(ownerOrganization, 'regionId'))
    })
    districts = getSelectOptionsListFromData(get(districts, `data.data`, []), '_id', 'name')
    return (
        <>
            <Card className={'mb-4'} title={t(title)} extra={[<Form.Item label={' '}
            >
                <Button icon={<PlusOutlined/>} onClick={() => setOpen(true)}>
                    {t('Добавить')}
                </Button>
            </Form.Item>]}>
                <Row gutter={16} align="middle">
                    <Col span={24}>
                        <Table
                            dataSource={otherPropertyDamage}
                            columns={[
                                {
                                    title: t('Описание имущества'),
                                    dataIndex: 'property',
                                },
                                {
                                    title: t(' Заявленный размер вреда'),
                                    dataIndex: 'claimedDamage',
                                    align: 'center',
                                    render: (text) => numeral(text).format(''),
                                },
                                {
                                    title: t('Действия'),
                                    dataIndex: '_id',
                                    align: 'right',
                                    render: (text, record, index) => <Space>
                                        <Button onClick={() => setEditRow(record)}
                                                shape="circle" icon={<EditOutlined/>}/>
                                        <Button
                                            onClick={() => setOtherPropertyDamage(prev => filter(prev, (_, _index) => !isEqual(_index, index)))}
                                            danger
                                            shape="circle" icon={<DeleteOutlined/>}/>
                                    </Space>
                                }
                            ]}
                        />
                    </Col>
                </Row>
            </Card>
            <Drawer width={1200} title={t('Добавление информации о вреде имуществу')} open={open}
                    onClose={() => setOpen(false)}>
                <Spin spinning={isPending}>
                    <Form
                        name="health-damage"
                        layout="vertical"
                        onFinish={(_attrs) => {
                            setOtherPropertyDamage(prev => [...prev, _attrs]);
                            form.resetFields()
                            setOpen(false)
                        }}
                        form={form}
                        initialValues={{
                            owner: 'person'
                        }}
                    >
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item rules={[{required: true, message: t('Обязательное поле')}]} name={'property'}
                                           label={t("Информация об имуществе")}
                                >
                                    <Input.TextArea/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={'owner'} label={t('Владелец имущества')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Radio.Group options={[{value: 'person', label: t('физ.лицо')}, {
                                        value: 'organization',
                                        label: t('юр.лицо')
                                    }]}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item valuePropName="checked"
                                           initialValue={false} name={'insurantIsOwner'} label={t("Владеет Заявитель")}
                                >
                                    <Switch
                                        onChange={(val) => {
                                            if (val) {
                                                if (isEqual(owner, 'person')) {
                                                    form.setFieldValue(['ownerPerson'], _form.getFieldValue(['applicant', 'person']));
                                                } else {
                                                    form.setFieldValue(['ownerOrganization'], _form.getFieldValue(['applicant', 'organization']));
                                                }
                                            }
                                        }}
                                    />
                                </Form.Item>
                            </Col>
                            <Col xs={24}>
                                {isEqual(owner, 'person') && <Row gutter={16}>
                                    <Col xs={6}>
                                        <Form.Item
                                            label={t("Серия паспорта")}
                                            name={['ownerPerson', 'passportData', 'seria']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input className={'uppercase'}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Item
                                            label={t("Номер паспорта")}
                                            name={['ownerPerson', 'passportData', 'number']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Item name={['ownerPerson', 'birthDate']} label={t('Дата рождения')}
                                                   rules={[{required: true, message: t('Обязательное поле')}]}>
                                            <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={4}>
                                        <Form.Item label={' '}>
                                            <Button loading={isPending} icon={<ReloadOutlined/>}
                                                    onClick={() => getPersonInfo(['ownerPerson'], form)}
                                                    type="primary">
                                                {t('Найти')}
                                            </Button>
                                        </Form.Item>
                                    </Col>
                                </Row>}
                                {isEqual(owner, 'organization') && <Row gutter={16}>
                                    <Col xs={4}>
                                        <Form.Item
                                            label={t("ИНН")}
                                            name={['ownerOrganization', 'inn']}
                                            rules={[{required: true, message: t('Обязательное поле')}]}
                                        >
                                            <MaskedInput mask={'999999999'} placeholder={'_________'}/>
                                        </Form.Item>
                                    </Col>

                                    <Col xs={6}>
                                        <Form.Item label={' '}>
                                            <Button loading={isPending} icon={<ReloadOutlined/>}
                                                    onClick={() => getOrgInfo(['ownerOrganization'], form)}
                                                    type="primary">
                                                {t('Найти')}
                                            </Button>
                                        </Form.Item>
                                    </Col>
                                </Row>}
                            </Col>
                        </Row>
                        {isEqual(owner, 'person') ? <Row gutter={16}>
                            <Col xs={6}>
                                <Form.Item
                                    label={t("ПИНФЛ")}
                                    name={['ownerPerson', 'passportData', 'pinfl']}
                                >
                                    <Input/>
                                </Form.Item>

                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'fullName', 'lastname']}
                                           label={t('Фамилия')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'fullName', 'firstname']} label={t('Имя')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'fullName', 'middlename']}
                                           label={t('Отчество')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'residentType']} label={t('Резидент')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={residentTypes}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item initialValue={210} name={['ownerPerson', 'countryId']}
                                           label={t('Страна')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={countryList}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'gender']} label={t('Пол')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={[
                                        {
                                            value: 'm',
                                            label: t('мужчина')
                                        },
                                        {
                                            value: 'f',
                                            label: t('женщина')
                                        }
                                    ]}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'regionId']} label={t('Область')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={regions}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'districtId']} label={t('Район')}
                                >
                                    <Select options={districts}/>
                                </Form.Item>
                            </Col>
                            <Col xs={12}>
                                <Form.Item name={['ownerPerson', 'address']} label={t('Адрес')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'driverLicenseSeria']}
                                           label={t(' Серия вод. удостоверения')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerPerson', 'driverLicenseNumber']}
                                           label={t('Номер вод. удостоверения')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Телефон")}
                                    name={['ownerPerson', 'phone']}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}, {
                                        pattern: /^998\d{9}$/,
                                        message: t('Номер телефона указан неверно.')
                                    }]}
                                >
                                    <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={['ownerPerson', 'email']}
                                    rules={[
                                        {
                                            type: 'email',
                                            message: t('Введите действительный адрес электронной почты'),
                                        },
                                    ]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>

                        </Row> : <Row gutter={16}>
                            <Col xs={12}>
                                <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                           name={['ownerOrganization', 'name']}
                                           label={t('Наименование')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'ownershipFormId']}
                                           label={t('Форма собственности')}
                                >
                                    <Select options={ownershipForms}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                           name={['ownerOrganization', 'oked']}
                                           label={t('ОКЭД')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item initialValue={210} name={['ownerOrganization', 'countryId']}
                                           label={t('Страна')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={countryList}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'regionId']} label={t('Область')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={regions}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'districtId']} label={t('Район')}
                                >
                                    <Select options={districts}/>
                                </Form.Item>
                            </Col>
                            <Col xs={12}>
                                <Form.Item name={['ownerOrganization', 'address']} label={t('Адрес')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'checkingAccount']}
                                           label={t('Расчетный счет')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'representativeName']}
                                           label={t('Фамилия представителя')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['ownerOrganization', 'position']}
                                           label={t('Должность представителя')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Контактный номер")}
                                    name={['ownerOrganization', 'phone']}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}, {
                                        pattern: /^998\d{9}$/,
                                        message: t('Номер телефона указан неверно.')
                                    }]}
                                >
                                    <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={['ownerOrganization', 'email']}
                                    rules={[
                                        {
                                            type: 'email',
                                            message: t('Введите действительный адрес электронной почты'),
                                        },
                                    ]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                        </Row>}
                        <Row gutter={16}>
                            <Col xs={24}>
                                <Divider className={'mt-0'}/>
                            </Col>
                            <Col xs={6}>
                                <Form.Item
                                    label={t("ИНН оценщика")}
                                    name={'appraiserInn'}
                                >
                                    <MaskedInput mask={'999999999'} maskChar={null}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item
                                    label={t("Номер отчета об оценке")}
                                    name={'appraiserReportNumber'}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item
                                    label={t("Дата отчета об оценке")}
                                    name={'appraiserReportDate'}
                                >
                                    <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item
                                    label={t("Заявленный размер вреда")}
                                    name={'claimedDamage'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <InputNumber style={{width: '100%'}}
                                                 min={0}
                                                 formatter={(value) =>
                                                     `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                                 }
                                                 parser={(value) => value.replace(/\$\s?|(,*)/g, '')}/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Flex className={'mt-6'}>
                            <Button className={'mr-2'} type="primary" htmlType={'submit'} name={'save'}>
                                {t('Добавить')}
                            </Button>
                            <Button danger type={'primary'} onClick={() => {
                                setOpen(false)
                            }}>
                                {t('Отмена')}
                            </Button>
                        </Flex>
                    </Form>
                </Spin>
            </Drawer>
            <Drawer title={t('Обновите заявленную сумму ущерба.')} open={!isNil(editRow)}
                    onClose={() => setEditRow(null)}>
                <Spin spinning={isPendingUpdate}>
                    <Form
                        name="health-damage-update"
                        layout="vertical"
                        onFinish={({claimedDamage}) => {
                            mutate({
                                url:URLS.claimEditDamage,
                                attributes:{
                                    uuid:get(editRow,'uuid'),
                                    claimNumber:parseInt(claimNumber),
                                    claimedDamage,
                                }
                            },{
                                onSuccess: () => {
                                    updateForm.resetFields()
                                    setEditRow(null)
                                    refresh()
                                }
                            })
                        }}
                        form={updateForm}
                        initialValues={{
                            claimedDamage: get(editRow, 'claimedDamage', 0)
                        }}
                    >
                        <Form.Item
                            label={t("Заявленный размер вреда")}
                            name={'claimedDamage'}
                            rules={[{required: true, message: t('Обязательное поле')}]}
                        >
                            <InputNumber style={{width: '100%'}}
                                         min={0}
                                         formatter={(value) =>
                                             `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                         }
                                         parser={(value) => value.replace(/\$\s?|(,*)/g, '')}/>
                        </Form.Item>
                        <Flex className={'mt-6'}>
                            <Button className={'mr-2'} type="primary" htmlType={'submit'} name={'save'}>
                                {t('Сохранять')}
                            </Button>
                            <Button danger type={'primary'} onClick={() => {
                                setEditRow(null)
                            }}>
                                {t('Отмена')}
                            </Button>
                        </Flex>
                    </Form>
                </Spin>
            </Drawer>
        </>
    );
};

export default Index;
