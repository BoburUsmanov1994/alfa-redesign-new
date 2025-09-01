import React from 'react';
import {Button, Card, Col, DatePicker, Form, Input, Radio, Row, Space, Spin, Switch, Table, Typography} from "antd";
import {useTranslation} from "react-i18next";
import {get} from "lodash"
import {usePutQuery} from "../../../hooks/api";
import dayjs from "dayjs";
import {useStore} from "../../../store";
import {URLS} from "../../../constants/url";

const ClaimJurnalVoice = ({data, claimNumber, refresh}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const {user} = useStore()
    const {mutate, isPending} = usePutQuery({})
    const decision = Form.useWatch('decision', form)

    const onFinish = (_attrs) => {
        mutate({
            url: URLS.claimVote,
            attributes: {
                claimNumber: parseInt(claimNumber),
                member: get(user, '_id'),
                ..._attrs
            }
        }, {
            onSuccess: () => {
                refresh()
            }
        })
    }
    return (
        <Spin spinning={isPending}>
            <Card className={'mb-4'} bordered title={t('Статус дела в СЭК')}>
                <Form
                    disabled
                    name="status"
                    layout="vertical"
                    initialValues={{}}
                >
                    <Row gutter={16} align="middle">
                        <Col span={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       valuePropName="checked"
                                       initialValue={get(data, 'sekVoteDetails.isSentToSek', false)}
                                       name={'isSentToSek'} label={t('Дело передано в СЭК')}>
                                <Switch/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                initialValue={get(data, 'sekVoteDetails.whoSent', get(user, 'employee.fullname'))}
                                rules={[{required: true, message: t('Обязательное поле')}]} name={'whoSent'}
                                label={t('Кем передано')}>
                                <Input disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item initialValue={dayjs(get(data, 'sekVoteDetails.sentDate', new Date()))}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={'sentDate'} label={t('Дата передачи')}>
                                <DatePicker format={"DD.MM.YYYY"} className={'w-full'} disabled/>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item>
                                <Table
                                    dataSource={get(data, 'sekVoteDetails.votes', [])}
                                    title={() => <Space className={'flex justify-between'} block
                                                        align={'center'}><Typography.Title
                                        level={5}>{t('Голосование')}</Typography.Title></Space>}
                                    columns={
                                        [
                                            {
                                                title: t('Должность'),
                                                dataIndex: 'member',
                                                render: (value) => get(value, 'name'),
                                            },
                                            {
                                                title: t('Ф.И.О'),
                                                dataIndex: 'member',
                                                render: (value) => get(value, 'employee.fullname'),
                                            },
                                            {
                                                title: t('Решение'),
                                                dataIndex: 'decision'
                                            },
                                            {
                                                title: t('Дата'),
                                                dataIndex: 'date'
                                            },
                                            {
                                                title: t('Примечание'),
                                                dataIndex: 'comment'
                                            }
                                        ]
                                    }
                                />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
            <Card title={t('Принять решение')} className={'w-full'}>
                <Form disabled={get(data, 'sekVoteDetails.isVotesFixed')} layout="vertical" onFinish={onFinish}
                      form={form}>
                    <Row gutter={16} align="middle">
                        <Col span={24}>
                            <Form.Item layout={'horizontal'} rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={'decision'} label={t('Решение')}>
                                <Radio.Group options={[
                                    {value: 'agree', label: t('соглашаюсь')},
                                    {
                                        value: 'disagree',
                                        label: t('против')
                                    },
                                    {
                                        value: 'abstain',
                                        label: t('воздержусь')
                                    }
                                ]}/>
                            </Form.Item>
                        </Col>
                        {decision && <Col span={24}>
                            <Form.Item name={'comment'} layout={'horizontal'} label={t('Примечание')}>
                                <Input.TextArea/>
                            </Form.Item>
                        </Col>}
                        <Col span={24}>
                            <Space className={'mt-4 mb-8'}>
                                <Button htmlType={'submit'} className={'mr-3'} type="primary"
                                        name={'save'}>
                                    {t('Проголосовать')}
                                </Button>
                                <Button danger type={'primary'}>
                                    {t('Отмена')}
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </Spin>
    );
};

export default ClaimJurnalVoice;
