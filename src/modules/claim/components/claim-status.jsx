import React from 'react';
import {Button, Card, Col, Form, Input, Row, Space} from "antd";
import {useTranslation} from "react-i18next";
import {get} from "lodash"
import {URLS} from "../../../constants/url";
import {usePutQuery} from "../../../hooks/api";

const ClaimStatus = ({data,claimNumber,refresh}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const {mutate,isPending} = usePutQuery({})
    const onFinish = () => {
    }
    return (
        <Card className={'mb-4'} bordered title={t('Статус заявления')}>
            <Form
                name="status"
                form={form}
                layout="vertical"
                initialValues={{}}
                onFinish={onFinish}
            >
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Form.Item  label={t('Статус')}>
                            <Input value={get(data,'status')} disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Запрос на редактирование')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Space>
                            <Button loading={isPending} onClick={()=>{
                                mutate({
                                    url: URLS.claimAction,
                                    attributes: {
                                        claimNumber: parseInt(claimNumber),
                                        action: 'accept'
                                    },
                                    method: 'put',
                                }, {
                                    onSuccess: () => {
                                        refresh()
                                    }
                                })
                            }} className={'mx-3'} type="dashed"
                                    name={'save'}>
                                {t('Зарегистрировать')}
                            </Button>
                            <Button danger type={'dashed'}>
                                {t('Отклонить')}
                            </Button>
                        </Space>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Комментарий')}>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Регистрационный номер')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Дата и время регистрации')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Должность сотрудника')}>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Ф.И.О. сотрудника')}>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Контактный номер')}>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Статус отправки в НАПП')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('Дата отправки в НАПП')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item label={t('UUID претензии в НАПП')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button type="primary"
                                htmlType={'submit'} name={'save'}>
                            {t('Отправить претензию в НАПП')}
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default ClaimStatus;
