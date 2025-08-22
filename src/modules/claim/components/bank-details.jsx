import React from 'react';
import {Button, Card, Col, Form, Input, Row, Space} from "antd";
import {useTranslation} from "react-i18next";

const BankDetails = () => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const onFinish = () => {
    }
    return (
        <Card className={'mb-4'} bordered title={t('Банковские реквизиты')}>
            <Form
                name="status"
                form={form}
                layout="vertical"
                initialValues={{}}
                onFinish={onFinish}
            >
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Form.Item label={t('МФО банка')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Наименование банка')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('ИНН банка')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Расчетный счет')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Получатель')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>

                    <Col span={6}>
                        <Form.Item label={t('Комментарий')}>
                            <Input/>
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Space>
                            <Button className={'mr-3'} type="primary"
                                    htmlType={'submit'} name={'save'}>
                                {t('Принять реквизиты')}
                            </Button>
                            <Button danger type={'primary'}>
                                {t('Отклонить реквизиты')}
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default BankDetails;
