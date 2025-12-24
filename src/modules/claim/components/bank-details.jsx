import React from 'react';
import {Button, Card, Col, Form, Input, Radio, Row, Space} from "antd";
import {useTranslation} from "react-i18next";
import {URLS} from "../../../constants/url";
import {usePutQuery} from "../../../hooks/api";
import {get, isEqual} from "lodash";

const BankDetails = ({
                         claimNumber,
                         refresh,
                         data,
                         bankDetails
                     }) => {
    const {t} = useTranslation();
    const {mutate, isPending} = usePutQuery({})
    return (
        <Card className={'mb-4'} bordered title={t('Банковские реквизиты')}>

            <Row gutter={16} align="middle">
                <Col span={6}>
                    <Form.Item name={['bankDetails', 'mfo']} label={t('МФО банка')}>
                        <Input disabled/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={['bankDetails', 'name']} label={t('Наименование банка')}>
                        <Input disabled/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={['bankDetails', 'inn']} label={t('ИНН банка')}>
                        <Input disabled/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={['bankDetails', 'checkingAccount']} label={t('Расчетный счет')}>
                        <Input disabled/>
                    </Form.Item>
                </Col>

                <Col span={6}>
                    <Form.Item initialValue={'PERSON'} name={['bankDetails', 'receiver', 'type']}
                               label={t('Получатель')}
                               // rules={[{required: true, message: t('Обязательное поле')}]}
                    >
                        <Radio.Group disabled options={[{value: 'PERSON', label: t('физ.лицо')}, {
                            value: 'ORGANIZATION',
                            label: t('юр.лицо')
                        }]}/>
                    </Form.Item>
                </Col>

                {isEqual(get(bankDetails, 'receiver.type'), 'PERSON') ? <>
                    <Col span={6}>
                        <Form.Item
                            // rules={[{required: true, message: t('Обязательное поле')}]}
                            name={['bankDetails', 'receiver', 'person', 'fullName', 'lastname']}
                            label={t('Фамилия')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            // rules={[{required: true, message: t('Обязательное поле')}]}
                            name={['bankDetails', 'receiver', 'person', 'fullName', 'firstname']}
                            label={t('Имя')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            // rules={[{required: true, message: t('Обязательное поле')}]}
                            name={['bankDetails', 'receiver', 'person', 'fullName', 'middlename']}
                            label={t('Отчество')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item
                            // rules={[{required: true, message: t('Обязательное поле')}]}
                                   name={['bankDetails', 'receiver', 'person', 'cardNumber']}
                                   label={t('Номер пласт. карты')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                </> : <Col span={6}>
                    <Form.Item
                        // rules={[{required: true, message: t('Обязательное поле')}]}
                               name={['bankDetails', 'receiver', 'organization', 'name']}
                               label={t('Наименование')}>
                        <Input disabled/>
                    </Form.Item>
                </Col>}

                <Col span={24}>
                    <Space>
                        <Button
                            onClick={() => {
                                mutate({
                                    url: URLS.claimAction,
                                    attributes: {
                                        claimNumber: parseInt(claimNumber),
                                        action: 'accept_details'
                                    },
                                    method: 'put',
                                }, {
                                    onSuccess: () => {
                                        refresh()
                                    }
                                })
                            }}
                            className={'mr-3'} type="dashed"
                            name={'save'}>
                            {t('Принять реквизиты')}
                        </Button>
                        <Button
                            onClick={() => {
                                mutate({
                                    url: URLS.claimAction,
                                    attributes: {
                                        claimNumber: parseInt(claimNumber),
                                        action: 'deny_details'
                                    },
                                    method: 'put',
                                }, {
                                    onSuccess: () => {
                                        refresh()
                                    }
                                })
                            }}
                            danger type={'dashed'}>
                            {t('Отклонить реквизиты')}
                        </Button>
                    </Space>
                </Col>
            </Row>
        </Card>
    );
};

export default BankDetails;
