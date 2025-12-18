import React from 'react';
import {Button, Card, Col, DatePicker, Form, Input, Popconfirm, Row, Select, Space} from "antd";
import {useTranslation} from "react-i18next";
import {get, isEqual} from "lodash"
import {URLS} from "../../../constants/url";
import {useGetAllQuery, usePostQuery, usePutQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData} from "../../../utils";
import dayjs from "dayjs";

const ClaimStatus = ({data, claimNumber, refresh, form, disabled = false}) => {
    const {t} = useTranslation();
    const {mutate, isPending} = usePutQuery({})
    const {mutate: postRequest, isPending: isPendingPost} = usePostQuery({})
    let {data: employees, isLoading} = useGetAllQuery({key: KEYS.claimUsers, url: URLS.claimUsers})
    employees = getSelectOptionsListFromData(get(employees, 'data.data', []), '_id', 'name')

    return (
        <Card className={'mb-4'} bordered title={t('Статус заявления')}>
            <Row gutter={16} align="middle">
                <Col span={6}>
                    <Form.Item label={t('Статус')}>
                        <Input value={t(get(data, 'status'))} disabled/>
                    </Form.Item>
                </Col>
                <Col span={18}></Col>
                <Col span={6}>
                    <Form.Item label={t('Запрос на редактирование')}>
                        <Input value={get(data, 'editRequest.text')} disabled/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={'comment'} label={t('Комментарий')}>
                        <Input/>
                    </Form.Item>
                </Col>
                {!disabled && <Col span={12}>
                    <Space>
                        <Popconfirm
                            title="Принять?"
                            onConfirm={() => {
                                mutate({
                                    url: URLS.claimAction,
                                    attributes: {
                                        claimNumber: parseInt(claimNumber),
                                        action: 'accept',
                                        comment: form.getFieldValue('comment'),
                                    },
                                    method: 'put',
                                }, {
                                    onSuccess: () => {
                                        refresh()
                                    }
                                })
                            }}
                            okText="Подтвердить"
                            cancelText="Отменить"
                        >
                        <Button loading={isPending}  className={'mr-3'} type="dashed"
                                name={'save'}>
                            {t('Принять')}
                        </Button>
                        </Popconfirm>
                        <Popconfirm
                            title="Отклонить?"
                            onConfirm={() => {
                                mutate({
                                    url: URLS.claimAction,
                                    attributes: {
                                        claimNumber: parseInt(claimNumber),
                                        action: 'deny'
                                    },
                                    method: 'put',
                                }, {
                                    onSuccess: () => {
                                        refresh()
                                    }
                                })
                            }}
                            okText="Подтвердить"
                            cancelText="Отменить"
                        >
                        <Button loading={isPending}  danger type={'dashed'}>
                            {t('Отклонить')}
                        </Button>
                        </Popconfirm>
                    </Space>
                </Col>}
                {!disabled && isEqual(get(data, 'status'), 'submitted') && <Col span={24} className={'mb-6'}>
                    <Space>
                        <Popconfirm
                            title="Зарегистрировать?"
                            onConfirm={() => {
                                mutate({
                                    url: URLS.claimAction,
                                    attributes: {
                                        claimNumber: parseInt(claimNumber),
                                        action: 'register'
                                    },
                                    method: 'put',
                                }, {
                                    onSuccess: () => {
                                        refresh()
                                    }
                                })
                            }}
                            okText="Подтвердить"
                            cancelText="Отменить"
                        >
                        <Button loading={isPending}  className={'mr-3'} type="dashed"
                                name={'save'}>
                            {t('Зарегистрировать')}
                        </Button>
                        </Popconfirm>
                    </Space>
                </Col>}

                <Col span={6}>
                    <Form.Item label={t('Регистрационный номер')}>
                        <Input value={get(data, 'claimNumber')} disabled/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={t('Дата и время регистрации')}>
                        <DatePicker format={'DD.MM.YYYY'}
                                    value={get(data, 'regDate') ? dayjs(get(data, 'regDate')) : null}
                                    className={'w-full'}
                                    disabled/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={'employee'} label={t('Сотрудник')}>
                        <Select onChange={(val, rest) => {
                            form.setFieldValue('employeeRole', get(rest, 'option.employee.position.name'))
                            form.setFieldValue('employeeContactNumber', get(rest, 'option.employee.telephonenumber'))
                        }} options={employees}/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={'employeeRole'} label={t('Должность сотрудника')}>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item name={'employeeContactNumber'} label={t('Контактный номер')}>
                        <Input/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={t('Статус отправки в НАПП')}>
                        <Input value={t(get(data, 'nappStatus'))} disabled/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={t('Дата отправки в НАПП')}>
                        <Input value={dayjs(get(data, 'sentDate')).format("YYYY-MM-DD")} disabled/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={t('UUID претензии в НАПП')}>
                        <Input value={t(get(data, 'claimUuid'))} disabled/>
                    </Form.Item>
                </Col>
                {!disabled && isEqual(get(data, 'nappStatus'), 'new') && <Col span={24} className={'text-right'}>
                    <Popconfirm
                        title="Отправить претензию в НАПП?"
                        onConfirm={() => {
                            postRequest({
                                url: `${URLS.claimSend}?claimNumber=${claimNumber}`,
                            }, {
                                onSuccess: () => {
                                    refresh()
                                }
                            })
                        }}
                        okText="Подтвердить"
                        cancelText="Отменить"
                    >
                    <Button loading={isPendingPost}  type="dashed"
                            name={'save'}>
                        {t('Отправить претензию в НАПП')}
                    </Button>
                    </Popconfirm>
                </Col>}
            </Row>
        </Card>
    );
};

export default ClaimStatus;
