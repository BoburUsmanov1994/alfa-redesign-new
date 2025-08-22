import React from 'react';
import {Col, DatePicker, Divider, Form, Input, InputNumber, Row, Select, Switch, Typography} from "antd";
import {useTranslation} from "react-i18next";
import {useGetAllQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {get} from "lodash";
import {URLS} from "../../../constants/url";
import {getSelectOptionsListFromData} from "../../../utils";

const EventForm = ({
                       regions = [],
                       areaTypes=[],
                       eventCircumstances,
                       claimType
                   }) => {
    let {data: districts} = useGetAllQuery({
        key: [KEYS.districts, get(eventCircumstances, 'regionId')],
        url: `${URLS.districts}/list`,
        params: {
            params: {
                region: get(eventCircumstances, 'regionId')
            }
        },
        enabled: !!(get(eventCircumstances, 'regionId'))
    })
    districts = getSelectOptionsListFromData(get(districts, `data.data`, []), '_id', 'name')
    const {t} = useTranslation();
    return (
        <>
            <Row gutter={16}>
                <Col span={24} className={'mb-4'}>
                    <Divider orientation={'left'}>
                        <Typography.Title level={5}>{t('Обстоятельства события:')}</Typography.Title>
                    </Divider>
                    <Row gutter={16}>
                        <Col xs={6}>
                            <Form.Item name={'insuranceRisk'} label={t('Страховой риск')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={'settlementAmount'} label={t('Сумма расходов на урегулирование')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={'inheritanceDocsInformation'} label={t('Документ о наследстве')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['eventCircumstances', 'eventDateTime']}
                                       label={t('Дата и время события')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <DatePicker className={'w-full'} showTime format="YYYY-MM-DD HH:mm:ss"/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['eventCircumstances', 'place']} label={t('Место события')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>

                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['eventCircumstances','areaTypeId']} label={t('Тип местности')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>

                                <Select options={areaTypes} allowClear/>
                            </Form.Item>
                        </Col>

                        <Col xs={6}>
                            <Form.Item name={['eventCircumstances', 'regionId']} label={t('Область')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={regions}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['eventCircumstances', 'districtId']} label={t('Район')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <Select options={districts}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name={['eventCircumstances', 'eventInfo']}
                                       label={t('Сведения о событии')}

                            >
                                <Input.TextArea/>
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item name={'contractExceptions'}
                                       label={t('Исключения по договору')}

                            >
                                <Input.TextArea/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['claimType', 'type']}
                                       label={t('Тип претензии')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <Select options={[
                                    {
                                        value: 'GENERAL',
                                        label: 'Обычное'
                                    },
                                    {
                                        value: 'OSAGO',
                                        label: 'ОСГОВТС'
                                    },
                                    {
                                        value: 'OSGOR',
                                        label: 'ОСГОР'
                                    },
                                    {
                                        value: 'OSGOP',
                                        label: 'ОСГОП'
                                    },
                                    {
                                        value: 'REINSURANCE',
                                        label: 'Перестрахование'
                                    }
                                ]}/>
                            </Form.Item>
                        </Col>
                        {
                            (function () {
                                switch (get(claimType, 'type')) {
                                    case 'OSAGO':
                                        return <>
                                            <Col xs={6} className={'flex justify-center'}>
                                                <Form.Item name={['claimType', 'details', 'isEuroProtocol']}
                                                           label={t('Европротокол')}
                                                           valuePropName="checked"
                                                           initialValue={false}
                                                >
                                                    <Switch/>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={6} className={'flex justify-center'}>
                                                <Form.Item name={['claimType', 'details', 'isDirectSettlement']}
                                                           label={t('Прямое урегулирование')}
                                                           valuePropName="checked"
                                                           initialValue={false}
                                                >
                                                    <Switch/>
                                                </Form.Item>
                                            </Col>
                                        </>;
                                    case 'OSGOR':
                                        return <>
                                            <Col xs={6}>
                                                <Form.Item name={['claimType', 'details', 'damageType']}
                                                           label={t('Тип ущерба')}
                                                >
                                                    <Input/>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Item name={['claimType', 'details', 'onetimeBenefit']}
                                                           label={t('Единовременное пособие')}
                                                >
                                                    <Input/>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Item name={['claimType', 'details', 'monthlyPaymentsAmount']}
                                                           label={t('Сумма по ежемесячным выплатам')}
                                                >
                                                    <InputNumber className={'w-full'}/>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Item name={['claimType', 'details', 'annuityAmount']}
                                                           label={t('Сумма по аннуитетам')}
                                                >
                                                    <InputNumber className={'w-full'}/>
                                                </Form.Item>
                                            </Col>
                                        </>;
                                    case 'OSGOP':
                                        return <>
                                            <Col xs={6}>
                                                <Form.Item name={['claimType', 'details', 'shareInPool']}
                                                           label={t('Доля в Пуле')}
                                                >
                                                    <Input/>
                                                </Form.Item>
                                            </Col>

                                            <Col xs={6}>
                                                <Form.Item name={['claimType', 'details', 'propertyDamageAmount']}
                                                           label={t('Сумма ущерба по порче имущества')}
                                                >
                                                    <InputNumber className={'w-full'}/>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Item name={['claimType', 'details', 'lossOrShortageDamageAmount']}
                                                           label={t('Сумма ущерба по утрате и недостаче')}
                                                >
                                                    <InputNumber className={'w-full'}/>
                                                </Form.Item>
                                            </Col>
                                        </>;
                                    case 'REINSURANCE':
                                        return <>
                                            <Col xs={6}>
                                                <Form.Item name={['claimType', 'details', 'reinsuranceType']}
                                                           label={t('Тип перестрахования')}
                                                >
                                                    <Input/>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Item name={['claimType', 'details', 'reinsurerQuota']}
                                                           label={t('Квота перестраховщика')}
                                                >
                                                    <Input/>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Item name={['claimType', 'details', 'startDate']}
                                                           label={t('Дата начала страхования')}
                                                >
                                                    <DatePicker className={'w-full'}/>
                                                </Form.Item>
                                            </Col>
                                            <Col xs={6}>
                                                <Form.Item name={['claimType', 'details', 'endDate']}
                                                           label={t('Дата окончания страхования')}
                                                >
                                                    <DatePicker className={'w-full'}/>
                                                </Form.Item>
                                            </Col>
                                        </>;
                                }
                            })()
                        }
                        <Col xs={6}>
                            <Form.Item name={['eventCircumstances', 'courtDecision', 'court']}
                                       label={t('Наименование суда')}

                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['eventCircumstances', 'courtDecision', 'courtDecisionDate']}
                                       label={t('Дата решения суда')}

                            >
                                <DatePicker className={'w-full'}/>
                            </Form.Item>
                        </Col>

                    </Row>
                </Col>
            </Row>
        </>
    );
};

export default EventForm;
