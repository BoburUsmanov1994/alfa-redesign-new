import React, {useRef} from 'react';
import {Button, Card, Col, DatePicker, Form, Input, Row, Select, Spin, Table} from "antd";
import {useTranslation} from "react-i18next";
import {get, head, isEqual, last} from "lodash"
import {URLS} from "../../../constants/url";
import {useGetAllQuery, usePostQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import dayjs from "dayjs";
import {entries} from "lodash/object";
import {getSelectOptionsListFromData} from "../../../utils";

const ClaimDecision = ({data, claimNumber, refresh}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const {decision} = Form.useWatch([], form) || {}
    const {mutate, isPending} = usePostQuery({})
    let {data: decisions} = useGetAllQuery({key: KEYS.decisions, url: `${URLS.decisions}`})
    let {data: payments} = useGetAllQuery({
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
                ..._attrs
            }
        }, {
            onSuccess: () => {
                refresh()
            }
        })
    }
    console.log('decision', decision)
    console.log('payments', payments)
    console.log('currency', currency)
    return (
        <Spin spinning={isPending}>
            <Form
                name="decision"
                form={form}
                layout="vertical"
                initialValues={{}}
                onFinish={onFinish}
            >
                <Card className={'mb-4'} bordered title={t('Решение по претензионному делу')}>
                    <Row gutter={16} align="bottom">
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['decision', 'decisionId']} label={t('Решение')}>
                                <Select options={entries(get(decisions, 'data'))?.map(item => ({
                                    value: parseInt(head(item)),
                                    label: last(item)
                                }))}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item initialValue={dayjs()}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['decision', 'decisionDate']} label={t('Дата решения')}>
                                <DatePicker className={'w-full'} disabled/>
                            </Form.Item>
                        </Col>
                        {
                            isEqual(get(decision, 'decisionId'), 2) && <Col span={6}>
                                <Form.Item name={['decision', 'rejectionReason']}
                                           label={t('Причина отказа')}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                        }
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['decision', 'regressDate']} label={t('Дата передачи в регресс')}>
                                <DatePicker className={'w-full'}/>
                            </Form.Item>
                        </Col>

                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['decision', 'reinsurerShare']} label={t('Доля перестраховщиков')}>
                                <Input className={'w-full'}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['decision', 'reasonForPayment']}
                                       label={t('Номер протокола комитета/суда, которое является основанием для выплаты')}>
                                <Input className={'w-full'}/>
                            </Form.Item>
                        </Col>
                        {
                            isEqual(get(decision, 'decisionId'), 1) && <>
                                <Col span={6}>
                                    <Form.Item label={t('Статус отправки в НАПП')}>
                                        <Input disabled value={get(data, 'nappStatus')} className={'w-full'}/>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item label={t('Дата отправки в НАПП')}>
                                        <DatePicker disabled value={dayjs()} className={'w-full'}/>
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
                    {isEqual(get(decision, 'decisionId'), 1) && <Table
                        dataSource={get(payments, 'data.data', [])}
                        title={() => 'Перечень ущерба по претензионному делу:'}
                        columns={[
                            {
                                title: 'Тип ущерба',
                                dataIndex: 'type',
                                render: (value, record, index) => <Form.Item
                                    rules={[{required: true, message: t('Обязательное поле')}]} initialValue={value}
                                    name={['payment', index, 'type']}>
                                    <Input disabled/>
                                </Form.Item>
                            },
                            {
                                title: 'Описание',
                                dataIndex: 'description',
                                render: (value, record, index) => <Form.Item initialValue={value}
                                                                             name={['payment', index, 'description']}>
                                    <Input disabled/>
                                </Form.Item>
                            },
                            {
                                title: 'Размер ущерба',
                                dataIndex: 'claimedDamage',
                                render: (value, record, index) => <Form.Item
                                    rules={[{required: true, message: t('Обязательное поле')}]} initialValue={value}
                                    name={['payment', index, 'claimedDamage']}>
                                    <Input disabled/>
                                </Form.Item>
                            },
                            {
                                title: 'Сумма выплаты',
                                dataIndex: 'payoutSum',
                                render: (value, record, index) => <Form.Item
                                    rules={[{required: true, message: t('Обязательное поле')}]} initialValue={value}
                                    name={['payment', index, 'payoutSum']}>
                                    <Input/>
                                </Form.Item>
                            },
                            {
                                title: 'Валюта',
                                dataIndex: 'currencyId',
                                render: (value, record, index) => <Form.Item initialValue={value}
                                                                             name={['payment', index, 'currencyId']}>
                                    <Select allowClear options={currency}/>
                                </Form.Item>,
                                width: 150
                            },
                            {
                                title: 'Дата выплаты',
                                dataIndex: 'payoutDate',
                                render: (value, record, index) => <Form.Item
                                    rules={[{required: true, message: t('Обязательное поле')}]}
                                    initialValue={value ? dayjs(value) : dayjs()}
                                    name={['payment', index, 'payoutDate']}>
                                    <DatePicker/>
                                </Form.Item>,
                                width: 150
                            },
                            {
                                title: 'Номер п/п',
                                dataIndex: 'paymentOrderNumber',
                                render: (value, record, index) => <Form.Item
                                    rules={[{required: true, message: t('Обязательное поле')}]} initialValue={value}
                                    name={['payment', index, 'paymentOrderNumber']}>
                                    <Input/>
                                </Form.Item>,
                                width: 150
                            }
                        ]}
                    />}
                    <Row gutter={16} align="middle" className={'mt-4'}>
                        <Col span={6}>
                            <Form.Item label={t('Статус отправки в НАПП')}>
                                <Input disabled value={get(data, 'nappStatus')} className={'w-full'}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item label={t('Дата отправки в НАПП')}>
                                <DatePicker disabled value={dayjs()} className={'w-full'}/>
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
                    <Button onClick={() => (submitType.current = true)} type="primary" className={'mr-4'}
                            htmlType="submit">
                        {t('Сохранить')}
                    </Button>
                    <Button htmlType={'submit'} onClick={() => (submitType.current = false)} danger type="primary"
                            name={'payment'}>
                        {t('Отмена')}
                    </Button>
                </Col>
            </Form>
        </Spin>
    );
};

export default ClaimDecision;
