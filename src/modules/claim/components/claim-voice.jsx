import React, {useEffect, useState} from 'react';
import {Button, Card, Col, DatePicker, Drawer, Form, Input, Row, Space, Switch, Table, Typography} from "antd";
import {useTranslation} from "react-i18next";
import {get, isEmpty} from "lodash"
import {useGetAllQuery, usePutQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {URLS} from "../../../constants/url";
import dayjs from "dayjs";
import {useStore} from "../../../store";

const ClaimVoice = ({data, claimNumber, refresh}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const {user} = useStore()
    const [open, setOpen] = useState(false);
    const {mutate, isPending} = usePutQuery({})
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [attrs, setAttrs] = useState({});

    let {data: members, refetch} = useGetAllQuery({key: KEYS.claimSekMembers, url: URLS.claimSekMembers})
    const onFinish = (_attrs) => {
        setAttrs(_attrs);
        setOpen(true);
    }

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    useEffect(() => {
        if (!isEmpty(get(data, 'sekVoteDetails.votes', []))) {
            setSelectedRowKeys(get(data, 'sekVoteDetails.votes', [])?.map(({member}) => member));
        }
    }, [data])
    return (
        <>
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
                            <Space className={'mt-4 mb-8'}>
                                <Button htmlType={'submit'} className={'mr-3'} type="primary"
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
                                    dataSource={get(data, 'sekVoteDetails.votes', [])}
                                    title={() => <Space className={'flex justify-between'} block
                                                        align={'center'}><Typography.Title
                                        level={5}>{t('Голосование')}</Typography.Title> <Button disabled
                                                                                                onClick={() => {
                                                                                                    mutate({
                                                                                                        url: URLS.claimSekAction,
                                                                                                        attributes: {
                                                                                                            claimNumber: parseInt(claimNumber),
                                                                                                            action: 'accept'
                                                                                                        },
                                                                                                        method: 'put',
                                                                                                    }, {
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
            <Drawer width={800} title={t('Передача материалов по претензионному делу в СЭК')} open={open}
                    onClose={() => setOpen(false)}>
                <Table
                    rowSelection={rowSelection}
                    rowKey="_id"
                    dataSource={get(members, 'data.data', [])}
                    columns={
                        [
                            {
                                title: t('Должность'),
                                dataIndex: 'role',
                                render: (value) => get(value, 'name'),
                            },
                            {
                                title: t('Ф.И.О'),
                                dataIndex: 'employee',
                                render: (value) => get(value, 'fullname'),
                            },
                        ]
                    }
                />
                <Space className={'mt-4'}>
                    <Button loading={isPending} onClick={() => {
                        mutate({
                            url: URLS.claimSekSend,
                            attributes: {
                                ...attrs,
                                claimNumber: parseInt(claimNumber),
                                votes: selectedRowKeys?.map(item => ({member: item}))
                            }
                        }, {
                            onSuccess: () => {
                                setSelectedRowKeys([])
                                setAttrs({})
                                setOpen(false)
                                refresh()
                            }
                        })
                    }} className={'mr-3'} type="primary"
                            name={'save'}>
                        {t('Передать в СЭК')}
                    </Button>
                    <Button onClick={() => setOpen(false)} danger type="primary"
                    >
                        {t('Отмена')}
                    </Button>
                </Space>
            </Drawer>
        </>
    );
};

export default ClaimVoice;
