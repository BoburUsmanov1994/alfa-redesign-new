import React from 'react';
import {Button, Card, Col, Form, Input, Row, Select, Space} from "antd";
import {useTranslation} from "react-i18next";
import {get} from "lodash"
import {URLS} from "../../../constants/url";
import {useGetAllQuery, usePostQuery, usePutQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData} from "../../../utils";

const ClaimStatus = ({data, claimNumber, refresh}) => {
    const {t} = useTranslation();
    const {mutate, isPending} = usePutQuery({})
    const {mutate: postRequest, isPending: isPendingPost} = usePostQuery({})
    let {data: employees} = useGetAllQuery({key: KEYS.claimUsers, url: URLS.claimUsers})
    employees=getSelectOptionsListFromData(get(employees,'data.data',[]),'_id','name')
    return (
        <Card className={'mb-4'} bordered title={t('Статус заявления')}>
            <Row gutter={16} align="middle">
                <Col span={6}>
                    <Form.Item label={t('Статус')}>
                        <Input value={get(data, 'status')} disabled/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item label={t('Запрос на редактирование')}>
                        <Input disabled/>
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Space>
                        <Button loading={isPending} onClick={() => {
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
                        <Button loading={isPending} onClick={() => {
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
                        }} danger type={'dashed'}>
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
                    <Form.Item name={'employee'} label={t('Сотрудник')}>
                        <Select options={employees}/>
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
                    <Button loading={isPendingPost} onClick={() => {
                        postRequest({
                            url: `${URLS.claimSend}?claimNumber=${claimNumber}`,
                        }, {
                            onSuccess: () => {
                                refresh()
                            }
                        })
                    }} type="dashed"
                            name={'save'}>
                        {t('Отправить претензию в НАПП')}
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default ClaimStatus;
