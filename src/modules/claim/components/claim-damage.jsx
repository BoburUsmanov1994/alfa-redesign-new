import React from 'react';
import {Button, Card, Col, Form, Input, Row, Space} from "antd";
import {useTranslation} from "react-i18next";

const ClaimDamage = () => {
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
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Form.Item label={t('Общая сумма ущерба')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Выплаченное страховое возмещение')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Заявленный ущерб по жизни')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Выплата по жизни')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Заявленный ущерб по здоровью')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Выплата по здоровью')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Заявленный ущерб авто')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Выплата по имуществу')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Заявленный ущерб имуществу')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default ClaimDamage;
