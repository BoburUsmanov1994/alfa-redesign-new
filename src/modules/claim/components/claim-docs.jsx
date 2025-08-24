import React, {useState} from 'react';
import {Button, Card, Col, DatePicker, Form, Input, Row, Space, Switch, Table, Typography} from "antd";
import {useTranslation} from "react-i18next";
import {get} from "lodash"
import {useGetAllQuery, usePutQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {URLS} from "../../../constants/url";
import dayjs from "dayjs";
import {useStore} from "../../../store";

const ClaimDocs = ({data, claimNumber}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const {user} = useStore()
    const [open, setOpen] = useState(false);
    const {mutate, isPending} = usePutQuery({})

    let {data: members, refetch} = useGetAllQuery({key: KEYS.claimSekMembers, url: URLS.claimSekMembers})
    const onFinish = () => {
    }
    console.log('members', members)
    console.log('user', user)
    return (
        <Form
            name="docs"
            form={form}
            layout="vertical"
            initialValues={{}}
            onFinish={onFinish}
            className={'mt-4'}
        >
            <Row gutter={16} align="middle">
                <Col span={12}>
                    <Form.Item layout={'horizontal'} initialValue={get(user, 'name')}
                               name={'whoSent'}
                               label={t('Заявление о страховом событии')}>
                        <Input disabled/>
                    </Form.Item>
                </Col>
                <Col span={6}>
                    <Form.Item>
                        <Button className={'mr-3'} type="dashed"
                                name={'save'}>
                            {t("Сформировать")}
                        </Button>
                    </Form.Item>
                </Col>

                <Col span={24}>
                    <Form.Item>
                        <Table
                            title={() => <Space className={'flex justify-between'} block
                                                align={'center'}><Typography.Title
                                level={5}>{t('Материалы по претензионному делу')}</Typography.Title> <Button
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
                                        title: t('Дата запроса')
                                    },
                                    {
                                        title: t('Описание документа')
                                    },
                                    {
                                        title: t('Шаблон')
                                    },
                                    {
                                        title: t('Кем запрошено')
                                    },
                                    {
                                        title: t('Дата предоставления')
                                    }
                                ]
                            }
                        />
                    </Form.Item>
                </Col>
            </Row>
        </Form>
    );
};

export default ClaimDocs;
