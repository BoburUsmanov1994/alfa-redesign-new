import React, {useEffect} from 'react';
import {
    Col,
    DatePicker,
    Descriptions,
    Divider,
    Form,
    Input,
    notification,
    Radio,
    Row,
    Select,
    Table,
    Typography
} from "antd";
import {useTranslation} from "react-i18next";
import {useGetAllQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {get, isEmpty, isEqual, isNil} from "lodash";
import {URLS} from "../../../constants/url";
import dayjs from "dayjs";
import numeral from "numeral";

const PoliceForm = ({
                        form,
                        polisSeria,
                        polisNumber,
                    }) => {
    const [notFound, setNotFound] = React.useState(false);
    const insurantType = Form.useWatch(['policyDetails','insurant','type'], form)
    const beneficiaryType = Form.useWatch(['policyDetails','beneficiary','type'], form)
    let {data,error,isError} = useGetAllQuery({
        key: [KEYS.claimPolicyDetails, polisSeria, polisNumber],
        url: URLS.claimPolicyDetails,
        params: {
            params: {
                seria: polisSeria,
                number: polisNumber
            }
        },
        enabled: !!(polisSeria && polisNumber)
    })
    const {t} = useTranslation();


    useEffect(() => {
        if (get(data, 'data.policy.uuid')) {
            setNotFound(false)
            form.setFieldValue('polisUuid', get(data, 'data.policy.uuid'))
        }
        if(isError){
            if(!isNil(get(error,'response.data.message'))){
                notification['error']({
                    message:get(error,'response.data.message')
                })
                setNotFound(true)
            }
        }
    }, [data,error,isError]);
    console.log('insurantType',insurantType)
    return (
        <>
            <Row gutter={16}>
                <Col span={24} className={'mb-4'}>
                    <Divider orientation={'left'}>
                        <Typography.Title level={5}>{t('Данные о страховом полисе:')}</Typography.Title>
                    </Divider>
                    <Row gutter={16}>
                        <Col xs={6}>
                            <Form.Item name={'polisSeria'} label={t('Серия полиса')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={'polisNumber'} label={t('Номер полиса')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={'applicantStatus'} label={t('Статус заявителя')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Radio.Group options={[{
                                    value: 'страхователь',
                                    label: 'страхователь'
                                },
                                    {
                                        value: 'пострадавший',
                                        label: 'пострадавший'
                                    }
                                ]}/>
                            </Form.Item>
                        </Col>

                        <Col xs={6}>
                            <Form.Item name={'polisUuid'} label={t('UUID полиса')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>

                    </Row>
                    <Row gutter={16}>
                        {!notFound ?<Col xs={24}>
                            {data &&  <Descriptions className={'mb-4'} title={''} bordered>
                                <Descriptions.Item
                                    label={t('Группа продуктов')}>{get(data, 'data.product.group.name')}</Descriptions.Item>
                                <Descriptions.Item
                                    label={t('Подгруппа продуктов')}>{get(data, 'data.product.subgroup.name')}</Descriptions.Item>
                                <Descriptions.Item
                                    label={t('Страховой продукт')}>{get(data, 'data.product.name')}</Descriptions.Item>
                                <Descriptions.Item
                                    label={t('Филиал')}>{get(data, 'data.branch.branchName')}</Descriptions.Item>
                                <Descriptions.Item
                                    label={t('Классы страхования')}>{get(data, 'data.product.risk[0].insuranceClass.name')}</Descriptions.Item>
                                <Descriptions.Item
                                    label={t('Дата выдачи полиса')}>{dayjs(get(data, 'data.policy.issueDate')).format("DD-MM-YYYY")}</Descriptions.Item>
                                <Descriptions.Item
                                    label={t('Дата начала покрытия')}>{dayjs(get(data, 'data.policy.startDate')).format("DD-MM-YYYY")}</Descriptions.Item>
                                <Descriptions.Item
                                    label={t('Дата окончания покрытия')}>{dayjs(get(data, 'data.policy.endDate')).format("DD-MM-YYYY")}</Descriptions.Item>
                            </Descriptions>}
                            {get(data, 'data.insurant') && <><Descriptions className={'mb-4'} title={''} bordered>
                                <Descriptions.Item
                                    label={t('Страхователь')}>{get(data, 'data.insurant.type')}</Descriptions.Item>
                                {get(data, 'data.insurant.organization') && <Descriptions.Item
                                    label={t('Наименование')}>{get(data, 'data.insurant.organization.name')}</Descriptions.Item>}
                                {get(data, 'data.insurant.person') && <Descriptions.Item
                                    label={t('Фамилия')}>{get(data, 'data.insurant.person.fullName.lastname')}</Descriptions.Item>}
                                {get(data, 'data.insurant.person') && <Descriptions.Item
                                    label={t('Имя')}>{get(data, 'data.insurant.person.fullName.firstname')}</Descriptions.Item>}
                                {get(data, 'data.insurant.person') && <Descriptions.Item
                                    label={t('Отчество')}>{get(data, 'data.insurant.person.fullName.middlename')}</Descriptions.Item>}
                            </Descriptions> </>}

                            {get(data, 'data.beneficiary') && <Descriptions className={'mb-4'} title={''} bordered>
                                <Descriptions.Item
                                    label={t('Выгодоприобретатель')}>{get(data, 'data.beneficiary.type')}</Descriptions.Item>
                                {get(data, 'data.beneficiary.organization') && <Descriptions.Item
                                    label={t('Наименование')}>{get(data, 'data.beneficiary.organization.name')}</Descriptions.Item>}
                                {get(data, 'data.beneficiary.person') && <Descriptions.Item
                                    label={t('Фамилия')}>{get(data, 'data.beneficiary.person.fullName.lastname')}</Descriptions.Item>}
                                {get(data, 'data.beneficiary.person') && <Descriptions.Item
                                    label={t('Имя')}>{get(data, 'data.beneficiary.person.fullName.firstname')}</Descriptions.Item>}
                                {get(data, 'data.beneficiary.person') && <Descriptions.Item
                                    label={t('Отчество')}>{get(data, 'data.beneficiary.person.fullName.middlename')}</Descriptions.Item>}
                            </Descriptions>}
                            {!isEmpty(get(data, 'data.objectOfInsurance', [])) &&
                                <Descriptions className={'mb-4'} title={''} bordered>
                                    <Descriptions.Item label={'Объекты страхования'}>
                                        <Table
                                            columns={[
                                                {
                                                    title: 'Тип',
                                                    dataIndex: 'type',
                                                },
                                                {
                                                    title: 'Описание',
                                                    dataIndex: 'details',
                                                    render: (text) => get(text, 'propertyDescription', get(text, 'registrationNumber'))
                                                },
                                                {
                                                    title: 'Страховая стоимость',
                                                    dataIndex: 'details',
                                                    render: (text) => numeral(get(text, 'insuredValue')).format('0,0.00'),
                                                },
                                                {
                                                    title: 'Страховая сумма',
                                                    dataIndex: 'insuranceSum',
                                                    render: (text) => numeral(text).format('0,0.00'),
                                                }
                                            ]}
                                            dataSource={get(data, 'data.objectOfInsurance', [])}
                                        />
                                    </Descriptions.Item>

                                </Descriptions>}
                            {get(data, 'data') && <Descriptions className={'mb-4'} title={''} bordered>
                                <Descriptions.Item
                                    label={t('Страховая премия по полису')}>{numeral(get(data, 'data.policy.insurancePremium')).format('0,0.00')}</Descriptions.Item>
                                <Descriptions.Item
                                    label={t('Оплаченная страховая премия')}>{numeral(get(data, 'data.policy.insurancePremiumPaid')).format('0,0.00')}</Descriptions.Item>
                                <Descriptions.Item
                                    label={t('Дата оплаты премии')}>{dayjs(get(data, 'data.policy.issueDate')).format("YYYY-MM-DD")}</Descriptions.Item>
                            </Descriptions>}

                            {!isEmpty(get(data, 'data.franchise')) && <Descriptions title={''} bordered>
                                <Descriptions.Item label={'Франшиза'}>
                                    <Table
                                        columns={[
                                            {
                                                title: 'Класс',
                                                dataIndex: 'risk',
                                                render: (text) => get(text, 'insuranceClass.name'),
                                            },
                                            {
                                                title: 'Тип',
                                                dataIndex: 'franchiseType',
                                                align: 'center',
                                            },
                                            {
                                                title: 'Размер',
                                                dataIndex: 'fixedValue',
                                                align: 'center',
                                            },
                                            {
                                                title: 'База',
                                                dataIndex: 'franchiseBase',
                                            },
                                        ]}
                                        dataSource={get(data, 'data.franchise', [])}
                                    />
                                </Descriptions.Item>
                            </Descriptions>}
                        </Col>:<>
                            <Col xs={24}>
                                <Form.Item name={['policyDetails','product','name']} label={t('Название продукта')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                    labelAlign={'left'}
                                    label={t("Тип страхователя")}
                                    name={['policyDetails','insurant','type']}
                                >
                                    <Radio.Group options={[{value: 'PERSON', label: t('физ.лицо')}, {
                                        value: 'ORGANIZATION',
                                        label: t('юр.лицо')
                                    }]}/>
                                </Form.Item>
                            </Col>
                            {
                                isEqual(insurantType,'PERSON') && <>
                                    <Col xs={6}>
                                        <Form.Item name={['policyDetails','insurant','person','fullName','firstname']} label={t('Имя')}
                                                   rules={[{required: true, message: t('Обязательное поле')}]}>
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Item name={['policyDetails','insurant','person','fullName','lastname']} label={t('Фамилия')}
                                                   rules={[{required: true, message: t('Обязательное поле')}]}>
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Item name={['policyDetails','insurant','person','fullName','middlename']} label={t('Отчество')}
                                                   rules={[{required: true, message: t('Обязательное поле')}]}>
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                </>
                            }
                            {
                                isEqual(insurantType,'ORGANIZATION') && <>
                                    <Col xs={18}>
                                        <Form.Item name={['policyDetails','insurant','organization','name']} label={t('Наименование')}
                                                   rules={[{required: true, message: t('Обязательное поле')}]}>
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                </>
                            }
                            <Col xs={6}>
                                <Form.Item
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                    labelAlign={'left'}
                                    label={t("Тип выгодоприобретатель")}
                                    name={['policyDetails','beneficiary','type']}
                                >
                                    <Radio.Group options={[{value: 'PERSON', label: t('физ.лицо')}, {
                                        value: 'ORGANIZATION',
                                        label: t('юр.лицо')
                                    }]}/>
                                </Form.Item>
                            </Col>
                            {
                                isEqual(beneficiaryType,'PERSON') && <>
                                    <Col xs={6}>
                                        <Form.Item name={['policyDetails','beneficiary','person','fullName','firstname']} label={t('Имя')}
                                                   rules={[{required: true, message: t('Обязательное поле')}]}>
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Item name={['policyDetails','beneficiary','person','fullName','lastname']} label={t('Фамилия')}
                                                   rules={[{required: true, message: t('Обязательное поле')}]}>
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                    <Col xs={6}>
                                        <Form.Item name={['policyDetails','beneficiary','person','fullName','middlename']} label={t('Отчество')}
                                                   rules={[{required: true, message: t('Обязательное поле')}]}>
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                </>
                            }
                            {
                                isEqual(beneficiaryType,'ORGANIZATION') && <>
                                    <Col xs={18}>
                                        <Form.Item name={['policyDetails','beneficiary','organization','name']} label={t('Наименование')}
                                                   rules={[{required: true, message: t('Обязательное поле')}]}>
                                            <Input/>
                                        </Form.Item>
                                    </Col>
                                </>
                            }
                            <Col xs={6}>
                                <Form.Item name={['policyDetails','policy','seria']} label={t('Серия  полиса')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['policyDetails','policy','number']} label={t('Номер полиса')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input/>
                                </Form.Item>
                            </Col>

                            <Col xs={6}>
                                <Form.Item name={['policyDetails','policy','startDate']} label={t('Дата начала')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['policyDetails','policy','endDate']} label={t('Дата окончания')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['policyDetails','policy','issueDate']} label={t('Дата выдачи полиса')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['policyDetails','policy','insurancePremium']} label={t('Страховая премия')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                  <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['policyDetails','policy','insurancePremiumPaid']} label={t('Оплаченная страховая премия')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['policyDetails','policy','paymentDate']} label={t('Дата выплаты')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col xs={6}>
                                <Form.Item name={['policyDetails','policy','uuid']} label={t('UUID')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}>
                                    <Input />
                                </Form.Item>
                            </Col>
                        </>}
                    </Row>
                </Col>

            </Row>
        </>
    );
};

export default PoliceForm;
