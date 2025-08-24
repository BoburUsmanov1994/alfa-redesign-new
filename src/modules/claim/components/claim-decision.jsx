import React from 'react';
import {Button, Card, Col, DatePicker, Form, Input, Row, Select, Space} from "antd";
import {useTranslation} from "react-i18next";
import {get} from "lodash"
import {URLS} from "../../../constants/url";
import {useGetAllQuery, usePutQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData} from "../../../utils";
import dayjs from "dayjs";

const ClaimDecision = ({data, claimNumber, refresh}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const {mutate, isPending} = usePutQuery({})
    let {data: decisions} = useGetAllQuery({key: KEYS.decisions, url: `${URLS.decisions}`})
    decisions = getSelectOptionsListFromData(get(decisions, `data`, []), 'id', 'name')
    const onFinish = () => {
    }
    console.log('decisions', decisions)
    return (
        <Card className={'mb-4'} bordered title={t('Решение по претензионному делу')}>
            <Form
                name="decision"
                form={form}
                layout="vertical"
                initialValues={{}}
                onFinish={onFinish}
            >
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                   name={['decision', 'decisionId']} label={t('Решение')}>
                            <Select options={decisions}/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item initialValue={dayjs()} rules={[{required: true, message: t('Обязательное поле')}]}
                                   name={['decision', 'decisionDate']} label={t('Дата решения')}>
                            <DatePicker className={'w-full'} disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name={['decision', 'rejectionReason']}
                                   label={t('Причина отказа')}>
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Button type="primary"
                                htmlType={'submit'} name={'save'}>
                            {t('Отправить решение в НАПП')}
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default ClaimDecision;
