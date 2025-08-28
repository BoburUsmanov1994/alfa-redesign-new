import React, {useState} from 'react';
import {Button, Card, Col, DatePicker, Divider, Drawer, Flex, Form, Input, Row, Select, Space, Spin, Table} from "antd";
import {DeleteOutlined, PlusOutlined, ReloadOutlined} from "@ant-design/icons";
import {get, isEqual} from "lodash";
import {filter} from "lodash/collection";
import {useTranslation} from "react-i18next";
import MaskedInput from "../../../../components/masked-input";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../../utils";
import {useGetAllQuery} from "../../../../hooks/api";
import {URLS} from "../../../../constants/url";
import {KEYS} from "../../../../constants/key";

const Index = ({
                   isPending = false,
                   getPersonInfo = () => {
                   },
                   residentTypes = [],
                   countryList = [],
                   regions = [],
                   healthDamage = [],
                   setHealthDamage,
                   title = 'Добавление информации о вреде здоровью:'
               }) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const [form] = Form.useForm();
    const {person} = Form.useWatch([], form) || {}

    let {data: districts} = useGetAllQuery({
        key: [KEYS.districts, get(person, 'regionId')],
        url: `${URLS.districts}/list`,
        params: {
            params: {
                region: get(person, 'regionId')
            }
        },
        enabled: !!(get(person, 'regionId'))
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
                            className={'mb-4'}
                            dataSource={healthDamage}
                            columns={[
                                {
                                    title: t('ПИНФЛ'),
                                    dataIndex: 'person',
                                    render: (text) => get(text, 'passportData.pinfl')
                                },
                                {
                                    title: t('Фамилия'),
                                    dataIndex: 'person',
                                    render: (text) => get(text, 'fullName.lastname')
                                },
                                {
                                    title: t('Имя'),
                                    dataIndex: 'person',
                                    render: (text) => get(text, 'fullName.firstname')
                                },
                                {
                                    title: t('Отчество'),
                                    dataIndex: 'person',
                                    render: (text) => get(text, 'fullName.middlename')
                                },
                                {
                                    title: t(' Заявленный размер вреда'),
                                    dataIndex: 'claimedDamage',
                                },
                                {
                                    title: t('Действия'),
                                    dataIndex: '_id',
                                    render: (text, record, index) => <Space>
                                        <Button
                                            onClick={() => setHealthDamage(prev => filter(prev, (_, _index) => !isEqual(_index, index)))}
                                            danger
                                            shape="circle" icon={<DeleteOutlined/>}/>
                                    </Space>
                                }
                            ]}
                        />
                    </Col>
                </Row>
            </Card>
            <Drawer width={1200} title={t('Добавление информации о вреде здоровью')} open={open}
                    onClose={() => setOpen(false)}>
                <Spin spinning={isPending}>
                    <Form
                        name="health-damage"
                        layout="vertical"
                        onFinish={(_attrs) => {
                            setHealthDamage(prev => [...prev, _attrs]);
                            form.resetFields();
                            setOpen(false)
                        }}
                        form={form}
                    >
                        <Row gutter={16}>
                            <Col xs={4}>
                                <Form.Item
                                    label={t("Серия паспорта")}
                                    name={['person', 'passportData', 'seria']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input  className={'uppercase'} />
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item
                                    label={t("Номер паспорта")}
                                    name={['person', 'passportData', 'number']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={8}>
                                <Form.Item
                                    label={t("ПИНФЛ")}
                                    name={['person', 'passportData', 'pinfl']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item label={' '}>
                                    <Button loading={isPending} icon={<ReloadOutlined/>}
                                            onClick={() => getPersonInfo(['person'], form)}
                                            type="primary">
                                        {t('Найти')}
                                    </Button>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'birthDate']} label={t('Дата рождения')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <DatePicker className={'w-full'} format="DD.MM.YYYY" />
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'fullName', 'lastname']} label={t('Фамилия')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'fullName', 'firstname']} label={t('Имя')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'fullName', 'middlename']} label={t('Отчество')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'residentType']} label={t('Резидент')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={residentTypes}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item initialValue={210} name={['person', 'countryId']}
                                           label={t('Страна')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={countryList}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'gender']} label={t('Пол')}
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
                                <Form.Item name={['person', 'regionId']} label={t('Область')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Select options={regions}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'districtId']} label={t('Район')}
                                >
                                    <Select options={districts}/>
                                </Form.Item>
                            </Col>
                            <Col xs={12}>
                                <Form.Item name={['person', 'address']} label={t('Адрес')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'driverLicenseSeria']}
                                           label={t(' Серия вод. удостоверения')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['person', 'driverLicenseNumber']}
                                           label={t('Номер вод. удостоверения')}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Телефон")}
                                    name={['person', 'phone']}
                                    getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Электронная почта")}
                                    name={['person', 'email']}
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
                            <Col span={6}>
                                <Form.Item
                                    label={t("Мед. учреждение")}
                                    name={['medicalConclusion', 'medicalInstitution']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Наименование документа")}
                                    name={['medicalConclusion', 'documentName']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Номер документа")}
                                    name={['medicalConclusion', 'documentNumber']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Дата заключения")}
                                    name={['medicalConclusion', 'documentDate']}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    label={t("Заявленный размер вреда")}
                                    name={'claimedDamage'}
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                >
                                    <Input/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Flex className={'mt-6'}>
                            <Button className={'mr-2'} type="primary" htmlType={'submit'} name={'save'}>
                                {t('Добавить')}
                            </Button>
                            <Button danger type={'primary'} onClick={() => setOpen(false)}>
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
