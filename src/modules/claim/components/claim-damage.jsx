import React from 'react';
import {Card, Col, Form, Input, Row, Space} from "antd";
import {useTranslation} from "react-i18next";
import {get} from "lodash"
import numeral from "numeral";

const ClaimDamage = ({data}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const onFinish = () => {
    }
    return (
        <Card className={'mb-4'} bordered title={t('Заявленный ущерб и выплаты')}>
            <Form
                name="status"
                form={form}
                layout="vertical"
                initialValues={{}}
                onFinish={onFinish}
            >
                <Row gutter={16} align="top">
                    <Col span={12}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label={t('Общая сумма ущерба')}>
                                    <Input value={numeral(get(data, 'totalDamageSum')).format('0,0.00')} disabled/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t('Заявленный ущерб по жизни')}>
                                    <Input value={numeral(get(data, 'lifeDamageSum')).format('0,0.00')} disabled/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t('Заявленный ущерб по здоровью')}>
                                    <Input value={numeral(get(data, 'healthDamageSum')).format('0,0.00')} disabled/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t('Заявленный ущерб авто')}>
                                    <Input value={numeral(get(data, 'vehicleDamageSum')).format('0,0.00')} disabled/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t('Заявленный ущерб имуществу')}>
                                    <Input value={numeral(get(data, 'otherPropertyDamageSum')).format('0,0.00')}
                                           disabled/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12}>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item label={t('Выплаченное страховое возмещение')}>
                                    <Input value={numeral(get(data, 'totalPaymentSum')).format('0,0.00')} disabled/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t('Выплата по жизни')}>
                                    <Input value={numeral(get(data, 'lifePaymentSum')).format('0,0.00')} disabled/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t('Выплата по здоровью')}>
                                    <Input value={numeral(get(data, 'healthPaymentSum')).format('0,0.00')} disabled/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t('Выплата по имуществу')}>
                                    <Input value={numeral(get(data, 'otherPropertyPaymentSum')).format('0,0.00')}
                                           disabled/>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default ClaimDamage;
