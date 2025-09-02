import React, {useEffect, useRef, useState} from 'react';
import {Button, Card, Col, DatePicker, Drawer, Flex, Form, Input, Radio, Row, Select, Space, Spin, Table} from "antd";
import {useTranslation} from "react-i18next";
import {get, head, isEmpty, isEqual, last} from "lodash"
import {URLS} from "../../../constants/url";
import {useGetAllQuery, usePostQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import dayjs from "dayjs";
import {entries} from "lodash/object";
import {getSelectOptionsListFromData} from "../../../utils";
import numeral from "numeral";
import {filter} from "lodash/collection";
import {DeleteOutlined} from "@ant-design/icons";

const ClaimDecision = ({data, claimNumber, refresh}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const [drawerForm] = Form.useForm();
    const {decision} = Form.useWatch([], form) || {}
    const {details: bankDetails} = Form.useWatch([], drawerForm) || {}
    const [open, setOpen] = useState(false)
    const [paymentList, setPaymentList] = useState([])
    const {mutate, isPending} = usePostQuery({})
    let {data: decisions} = useGetAllQuery({key: KEYS.decisions, url: `${URLS.decisions}`})
    let {data: payments, isLoading} = useGetAllQuery({
        key: KEYS.claimPayment,
        url: `${URLS.claimPayment}?claimNumber=${claimNumber}`
    })
    const submitType = useRef(null);
    let {data: currency} = useGetAllQuery({
        key: KEYS.currencyList,
        url: URLS.currencyList
    })
    currency = getSelectOptionsListFromData(
        get(currency, `data.data`, []),
        "_id",
        "ticker"
    );
    const onFinish = (_attrs) => {
        mutate({
            url: URLS.claimDecisionPayment,
            attributes: {
                claimNumber: parseInt(claimNumber),
                preSave: submitType.current,
                payment: paymentList,
                ..._attrs
            }
        }, {
            onSuccess: () => {
                refresh()
            }
        })
    }

    useEffect(() => {
        if (!isEmpty(get(payments, 'data.payment', []))) {
            setPaymentList(get(payments, 'data.payment', []));
        }
    }, [payments])

    if (isLoading) {
        return <Spin spinning/>
    }

    return (
        <>
            <Spin spinning={isPending}>
                <Form
                    name="decision"
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Card className={'mb-4'} bordered title={t('Решение по претензионному делу')}>
                        <Row gutter={16} align="bottom">
                            <Col span={6}>
                                <Form.Item initialValue={get(data, 'decision.decision.decisionId')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                           name={['decision', 'decisionId']} label={t('Решение')}>
                                    <Select options={entries(get(decisions, 'data'))?.map(item => ({
                                        value: parseInt(head(item)),
                                        label: last(item)
                                    }))}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item initialValue={dayjs(get(data, 'decision.decision.decisionDate'))}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                           name={['decision', 'decisionDate']} label={t('Дата решения')}>
                                    <DatePicker format="DD.MM.YYYY" className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            {
                                isEqual(get(decision, 'decisionId'), 2) && <Col span={6}>
                                    <Form.Item initialValue={get(data, 'decision.decision.rejectionReason')}
                                               name={['decision', 'rejectionReason']}
                                               label={t('Причина отказа')}>
                                        <Input/>
                                    </Form.Item>
                                </Col>
                            }
                            <Col span={6}>
                                <Form.Item
                                    name={['decision', 'regressDate']}
                                    initialValue={dayjs(get(data, 'decision.decision.regressDate'))}
                                    label={t('Дата передачи в регресс')}>
                                    <DatePicker format="DD.MM.YYYY" className={'w-full'}/>
                                </Form.Item>
                            </Col>

                            <Col span={6}>
                                <Form.Item
                                    initialValue={get(data, 'decision.decision.reinsurerShare')}
                                    name={['decision', 'reinsurerShare']} label={t('Доля перестраховщиков')}>
                                    <Input className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item initialValue={get(data, 'decision.decision.reasonForPayment')}
                                           rules={[{required: true, message: t('Обязательное поле')}]}
                                           name={['decision', 'reasonForPayment']}
                                           label={t('Номер протокола комитета/суда, которое является основанием для выплаты')}>
                                    <Input className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            {
                                isEqual(get(decision, 'decisionId'), 1) && <>
                                    <Col span={6}>
                                        <Form.Item label={t('Статус отправки в НАПП')}>
                                            <Input value={t(get(data, 'nappStatus'))} disabled className={'w-full'}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={6}>
                                        <Form.Item label={t('Дата отправки в НАПП')}>
                                            <DatePicker format="DD.MM.YYYY" disabled className={'w-full'}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Button onClick={() => {
                                            mutate({
                                                url: `${URLS.claimSendDecision}?claimNumber=${claimNumber}`,
                                            }, {
                                                onSuccess: () => {
                                                    refresh()
                                                }
                                            })
                                        }} type="dashed"
                                                className={'mr-4'}
                                                name={'send'}>
                                            {t('Отправить решение в НАПП')}
                                        </Button>
                                        <Button onClick={() => {
                                            mutate({
                                                url: `${URLS.claimSendDecision1c}?claimNumber=${claimNumber}`,
                                            }, {
                                                onSuccess: () => {
                                                    refresh()
                                                }
                                            })
                                        }} type="dashed"
                                                name={'payment'}>
                                            {t('Отправить решение в 1С')}
                                        </Button>
                                    </Col>
                                </>
                            }
                        </Row>
                    </Card>
                    <Card className={'mb-4'} title={t('Выплата страхового возмещения:')}>
                        {isEqual(get(decision, 'decisionId'), 1) && <> <Table
                            dataSource={get(payments, 'data.data.damage', get(payments, 'data.damage', []))}
                            title={() => 'Перечень ущерба по претензионному делу:'}
                            columns={[
                                {
                                    title: 'Тип ущерба',
                                    dataIndex: 'type',
                                },
                                {
                                    title: 'Описание',
                                    dataIndex: 'description',
                                },
                                {
                                    title: 'Размер ущерба',
                                    dataIndex: 'claimedDamage',
                                    render: (text) => numeral(text).format('0,0.00')
                                },

                            ]}
                        />
                            <Table
                                className="mb-6"
                                dataSource={paymentList}
                                title={() => <Flex justify={'space-between'}>
                                    <span>{t('Перечень выплат по претензионному делу:')}</span>
                                    <Button onClick={() => setOpen(true)} type="dashed">
                                        {t('Добавить')}
                                    </Button>
                                </Flex>}
                                columns={[
                                    {
                                        title: 'Тип оплаты',
                                        dataIndex: 'type',
                                    },
                                    {
                                        title: 'Получатель',
                                        dataIndex: 'details',
                                        render: (text, record) => get(text, 'receiver.person.fullName.lastname') ? `${get(text, 'receiver.person.fullName.lastname')} ${get(text, 'receiver.person.fullName.firstname')} ${get(text, 'receiver.person.fullName.middlename')}` : get(text, 'receiver.organization.name')
                                    },
                                    {
                                        title: 'Расчетный счет',
                                        dataIndex: 'details',
                                        render: (text) => get(text, 'checkingAccount')
                                    },
                                    {
                                        title: 'Сумма выплаты',
                                        dataIndex: 'payoutSum',
                                        render: (text) => numeral(text).format('0,0.00')
                                    },
                                    {
                                        title: 'Валюта',
                                        dataIndex: 'currencyId',
                                    },
                                    {
                                        title: 'Дата выплаты',
                                        dataIndex: 'payoutDate',
                                        render: (text) => dayjs(text).format("YYYY-MM-DD")
                                    },
                                    {
                                        title: 'Номер п/п',
                                        dataIndex: 'paymentOrderNumber',
                                    },
                                    {
                                        title: t('Действия'),
                                        dataIndex: '_id',
                                        render: (text, record, index) => <Space>
                                            <Button
                                                onClick={() => setPaymentList(prev => filter(prev, (_, _index) => !isEqual(_index, index)))}
                                                danger
                                                shape="circle" icon={<DeleteOutlined/>}/>
                                        </Space>
                                    }

                                ]}
                            />
                        </>}
                        <Row gutter={16} align="middle" className={'mt-4'}>
                            <Col span={6}>
                                <Form.Item label={t('Статус отправки в НАПП')}>
                                    <Input value={t(get(data, 'nappStatus'))} disabled className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={t('Дата отправки в НАПП')}>
                                    <DatePicker format="DD.MM.YYYY" disabled className={'w-full'}/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Button type={'dashed'} onClick={() => {
                                    mutate({
                                        url: `${URLS.claimSendPayment}?claimNumber=${claimNumber}`,
                                    }, {
                                        onSuccess: () => {
                                            refresh()
                                        }
                                    })
                                }}>
                                    {t('Отправить выплату в НАПП')}
                                </Button>
                            </Col>
                        </Row>
                    </Card>
                    <Col span={24} className={'mt-8'}>
                        <Button onClick={() => (submitType.current = true)} type="default" className={'mr-4'}
                                htmlType="submit">
                            {t('Предварительно сохранить')}
                        </Button>
                        <Button onClick={() => (submitType.current = false)} type="primary" className={'mr-4'}
                                htmlType="submit">
                            {t('Сохранить')}
                        </Button>
                        <Button onClick={() => (submitType.current = false)} htmlType={'submit'} danger type="primary"
                                name={'payment'}>
                            {t('Отмена')}
                        </Button>
                    </Col>
                </Form>
            </Spin>
            <Drawer title={t('Добавить выплату')} width={1000} open={open} onClose={() => setOpen(false)}>
                <Form initialValues={{
                    details: {
                        ...get(data, 'bankDetails', {})
                    }
                }} form={drawerForm} layout="vertical" onFinish={(_attrs) => {
                    setPaymentList(prev => [...prev, _attrs])
                    setOpen(false)
                    drawerForm.resetFields()
                }}>
                    <Row gutter={16} align="middle">
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={'type'} label={t('Тип оплаты')}>
                                <Select
                                    options={get(payments, 'data.data.damage', get(payments, 'data.damage', []))?.map(({type}) => ({
                                        value: type,
                                        label: t(type)
                                    }))}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['details', 'mfo']} label={t('МФО банка')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['details', 'name']} label={t('Наименование банка')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['details', 'inn']} label={t('ИНН банка')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['details', 'checkingAccount']} label={t('Расчетный счет')}>
                                <Input/>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item initialValue={'PERSON'} name={['details', 'receiver', 'type']}
                                       label={t('Получатель')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Radio.Group options={[{value: 'PERSON', label: t('физ.лицо')}, {
                                    value: 'ORGANIZATION',
                                    label: t('юр.лицо')
                                }]}/>
                            </Form.Item>
                        </Col>

                        {isEqual(get(bankDetails, 'receiver.type'), 'PERSON') ? <>
                            <Col span={6}>
                                <Form.Item
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                    name={['details', 'receiver', 'person', 'fullName', 'lastname']}
                                    label={t('Фамилия')}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                    name={['details', 'receiver', 'person', 'fullName', 'firstname']}
                                    label={t('Имя')}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                    name={['details', 'receiver', 'person', 'fullName', 'middlename']}
                                    label={t('Отчество')}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                           name={['details', 'receiver', 'person', 'cardNumber']}
                                           label={t('Номер пласт. карты')}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                        </> : <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['details', 'receiver', 'organization', 'name']}
                                       label={t('Наименование')}>
                                <Input/>
                            </Form.Item>
                        </Col>}
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={'payoutSum'}
                                       label={t('Сумма выплаты')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                name={'currencyId'}
                                label={t('Валюта')}>
                                <Select options={currency}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={'payoutDate'}
                                       label={t('Дата выплаты')}>
                                <DatePicker format="DD.MM.YYYY" className={'w-full'}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={'paymentOrderNumber'}
                                       label={t('Номер п/п')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Flex className={'mt-4'}>
                                <Button className={'mr-3'} type="primary" htmlType={'submit'} name={'save'}>
                                    {t('Добавить')}
                                </Button>
                                <Button danger type={'primary'} onClick={() => {
                                    setOpen(false)
                                }}>
                                    {t('Отмена')}
                                </Button>
                            </Flex>
                        </Col>
                    </Row>

                </Form>
            </Drawer>
        </>
    );
};

export default ClaimDecision;
