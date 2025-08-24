import React, {useState} from 'react';
import {Button, Card, Col, DatePicker, Form, Input, Row, Space, Switch, Table, Typography} from "antd";
import {useTranslation} from "react-i18next";
import {get} from "lodash"
import {useGetAllQuery, usePutQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {URLS} from "../../../constants/url";
import dayjs from "dayjs";
import {useStore} from "../../../store";

const ClaimVoice = ({data, claimNumber}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const {user} = useStore()
    const [open, setOpen] = useState(false);
    const {mutate, isPending} = usePutQuery({})

    let {data: members,refetch} = useGetAllQuery({key: KEYS.claimSekMembers, url: URLS.claimSekMembers})
    const onFinish = () => {
    }
    console.log('members', members)
    console.log('user', user)
    return (
        <Card className={'mb-4'} bordered title={t('Статус дела в СЭК')}>
            <Form
                name="status"
                form={form}
                layout="vertical"
                initialValues={{}}
                onFinish={onFinish}
            >
                <Row gutter={16} align="middle">
                    <Col span={6}>
                        <Form.Item rules={[{required: true, message: t('Обязательное поле')}]} valuePropName="checked"
                                   initialValue={false} name={'isSentToSek'} label={t('Дело передано в СЭК')}>
                            <Switch/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item initialValue={get(user, 'name')}
                                   rules={[{required: true, message: t('Обязательное поле')}]} name={'whoSent'}
                                   label={t('Кем передано')}>
                            <Input disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item initialValue={dayjs()} rules={[{required: true, message: t('Обязательное поле')}]}
                                   name={'sentDate'} label={t('Дата передачи')}>
                            <DatePicker className={'w-full'} disabled/>
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Space className={'mt-4 mb-8'}>
                            <Button className={'mr-3'} type="primary"
                                    name={'save'}>
                                {t('Передать дело в СЭК')}
                            </Button>
                            <Button loading={isPending} onClick={() => {
                                mutate({
                                    url: URLS.claimSekAction,
                                    attributes: {
                                        claimNumber: parseInt(claimNumber),
                                        action: 'deny'
                                    },
                                    method: 'put',
                                })
                            }} danger type={'primary'}>
                                {t('Отозвать дело')}
                            </Button>
                        </Space>
                    </Col>
                    <Col span={24}>
                        <Form.Item>
                            <Table
                                title={() => <Space className={'flex justify-between'} block
                                                    align={'center'}><Typography.Title
                                    level={5}>{t('Голосование')}</Typography.Title> <Button
                                    onClick={() => {
                                        mutate({
                                            url: URLS.claimSekAction,
                                            attributes: {
                                                claimNumber: parseInt(claimNumber),
                                                action: 'accept'
                                            },
                                            method: 'put',
                                        },{
                                            onSuccess: () => {
                                                refetch()
                                            }
                                        })
                                    }}
                                    type="dashed">
                                    {t('Зафиксировать голосование')}
                                </Button></Space>}
                                columns={
                                    [
                                        {
                                            title: t('Должность')
                                        },
                                        {
                                            title: t('Ф.И.О')
                                        },
                                        {
                                            title: t('Решение')
                                        },
                                        {
                                            title: t('Дата')
                                        },
                                        {
                                            title: t('Примечание')
                                        }
                                    ]
                                }
                            />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Card>
    );
};

export default ClaimVoice;
