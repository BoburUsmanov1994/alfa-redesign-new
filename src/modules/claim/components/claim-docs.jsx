import React, {useEffect, useState} from 'react';
import {
    Button,
    Col,
    DatePicker,
    Drawer,
    Flex,
    Form,
    Input,
    Radio,
    Row,
    Space,
    Spin,
    Table,
    Typography
} from "antd";
import {useTranslation} from "react-i18next";
import {get} from "lodash"
import {useDeleteQuery, usePutQuery} from "../../../hooks/api";
import {URLS} from "../../../constants/url";
import dayjs from "dayjs";
import {useStore} from "../../../store";
import CustomUpload from "../../../components/custom-upload";
import {EyeOutlined, DeleteOutlined} from "@ant-design/icons";
import {isNil} from "lodash/lang";

const ClaimDocs = ({data, claimNumber, refresh}) => {
    const {t} = useTranslation();
    const [form] = Form.useForm();
    const [requestForm] = Form.useForm();
    const [approveForm] = Form.useForm();
    const {user} = useStore()
    const [open, setOpen] = useState(false);
    const [paymentDocs, setPaymentDocs] = useState(null);
    const [conclusionFatf, setConclusionFatf] = useState(null);
    const [record, setRecord] = useState(null);
    const {mutate, isPending} = usePutQuery({})
    const {mutate: deleteRequest, isPending: isPendingDelete} = useDeleteQuery({})

    const onFinish = () => {
    }
    useEffect(() => {
        if (get(data, 'documents.paymentDocs.url')) {
            setPaymentDocs(get(data, 'documents.paymentDocs'));
        }
        if (get(data, 'documents.conclusionFatf.url')) {
            setConclusionFatf(get(data, 'documents.conclusionFatf'));
        }
    }, [data]);

    console.log('DATAAA',data)

    return (
        <>
            <Spin spinning={isPending}>
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
                            <Form.Item layout={'horizontal'}
                                       label={t('Заявление о страховом событии')}>
                                <Input value={get(data, 'documents.claimStatement.url')} disabled suffix={
                                    get(data, 'documents.claimStatement.url') ?
                                        <Button href={get(data, 'documents.claimStatement.url')}
                                                icon={<EyeOutlined/>} type="link"/> : null
                                }/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item>
                                <Button onClick={() => {
                                    mutate({
                                        url: `${URLS.claimGenStatement}?claimNumber=${claimNumber}`,
                                        attributes: {},
                                        method: 'put'
                                    }, {
                                        onSuccess: () => {
                                            refresh()
                                        }
                                    })
                                }} type="dashed"
                                >
                                    {t("Сформировать")}
                                </Button>
                            </Form.Item>
                        </Col>

                        <Col span={24}>
                            <Form.Item>
                                <Table
                                    scroll={{x: 1200}}
                                    dataSource={get(data, 'documents.materials', [])}
                                    title={() => <Space className={'flex justify-between'} block
                                                        align={'center'}><Typography.Title
                                        level={5}>{t('Материалы по претензионному делу')}</Typography.Title> <Button
                                        onClick={() => {
                                            setOpen(true);
                                        }}
                                        type="dashed">
                                        {t('Запросить документ')}
                                    </Button></Space>}
                                    columns={
                                        [
                                            {
                                                title: t('Дата запроса'),
                                                dataIndex: 'requestDate',
                                                align: 'center',
                                                render: (text) => dayjs(text).format('YYYY-MM-DD'),
                                            },
                                            {
                                                title: t('Описание документа'),
                                                dataIndex: 'description',
                                                align: 'center',
                                            },
                                            {
                                                title: t('Шаблон'),
                                                dataIndex: 'template',
                                                align: 'center',
                                                render: (text, record) => <Button icon={<EyeOutlined/>} type={'link'}
                                                                                  href={get(text, 'url')}/>
                                            },
                                            {
                                                title: t('Кем запрошено'),
                                                dataIndex: 'whoRequested',
                                            },
                                            {
                                                title: t('Дата предоставления'),
                                                dataIndex: 'provideDate',
                                                render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : '',
                                            },
                                            {
                                                title: t('Файл'),
                                                dataIndex: 'file',
                                                align: 'center',
                                                render: (text, record) => get(text, 'url') ?
                                                    <Button icon={<EyeOutlined/>} type={'link'}
                                                            href={get(text, 'url')}/> : ''
                                            },
                                            {
                                                title: t('Дата проверки'),
                                                dataIndex: 'checkDate',
                                                align: 'center',
                                                render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : '',
                                            },
                                            {
                                                title: t('Кем проверено'),
                                                dataIndex: 'whoChecked',
                                                align: 'center',
                                            },
                                            {
                                                title: t('Результат проверки'),
                                                dataIndex: 'checkResult',
                                                align: 'center',
                                                render: (text) => isNil(text) ? 'Не проверено' : text ? 'принят' : 'не принят'
                                            },
                                            {
                                                title: t('Комментарий'),
                                                dataIndex: 'comment',
                                                align: 'center',
                                            },
                                            {
                                                title: t('Действия'),
                                                render: (text, _record) => <Space>
                                                    <Button
                                                        onClick={() => {
                                                            mutate({
                                                                url: URLS.claimDocsDeny,
                                                                attributes: {
                                                                    claimNumber: parseInt(claimNumber),
                                                                    docId: get(_record, 'id')
                                                                },
                                                            }, {
                                                                onSuccess: () => {
                                                                    refresh()
                                                                }
                                                            })
                                                        }}
                                                        danger type={'dashed'}>
                                                        {t('Отозвать')}
                                                    </Button>
                                                    <Button onClick={() => {
                                                        setRecord(_record)
                                                    }} type={'dashed'}>
                                                        {t('Проверить')}
                                                    </Button>
                                                    {get(data,'isApplicationBehalfToApplicant') &&<CustomUpload
                                                        setFile={(_file) => {
                                                            mutate({
                                                                url: URLS.claimDocsAttach,
                                                                attributes: {
                                                                    claimNumber: parseInt(claimNumber),
                                                                    materials: [{
                                                                        id: get(_record, 'id'),
                                                                        provideDate: dayjs(),
                                                                        file: {
                                                                            file: get(_file, '_id'),
                                                                            url: get(_file, 'url')
                                                                        }
                                                                    }]
                                                                }
                                                            }, {
                                                                onSuccess: () => {
                                                                    refresh()
                                                                }
                                                            })
                                                        }}

                                                    />}
                                                </Space>
                                            }
                                        ]
                                    }
                                />
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item layout={'horizontal'}
                                       label={t('Заключение ДУСП')}>
                                <Input value={get(data, 'documents.conclusionDusp.url')} disabled suffix={
                                    get(data, 'documents.conclusionDusp.url') ?
                                        <Button href={get(data, 'documents.conclusionDusp.url')}
                                                icon={<EyeOutlined/>} type="link"/> : null
                                }/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item>
                                <Button onClick={() => {
                                    mutate({
                                        url: `${URLS.claimGenConclusionDusp}?claimNumber=${claimNumber}`,
                                        attributes: {},
                                        method: 'put'
                                    }, {
                                        onSuccess: () => {
                                            refresh()
                                        }
                                    })
                                }} type="dashed"
                                >
                                    {t("Сформировать")}
                                </Button>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item layout={'horizontal'}
                                       label={t('Решение СЭК')}>
                                <Input value={get(data, 'documents.decisionSek.url')} disabled suffix={
                                    get(data, 'documents.decisionSek.url') ?
                                        <Button href={get(data, 'documents.decisionSek.url')}
                                                icon={<EyeOutlined/>} type="link"/> : null
                                }/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item>
                                <Button onClick={() => {
                                    mutate({
                                        url: `${URLS.claimGenDecisionDusp}?claimNumber=${claimNumber}`,
                                        attributes: {},
                                        method: 'put'
                                    }, {
                                        onSuccess: () => {
                                            refresh()
                                        }
                                    })
                                }} type="dashed"
                                >
                                    {t("Сформировать")}
                                </Button>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item layout={'horizontal'}
                                       label={t('Акт о страховом случае (для ОСГОР)')}>
                                <Input value={get(data, 'documents.claimAct.url')} disabled
                                       suffix={
                                           get(data, 'documents.claimAct.url') ?
                                               <Button href={get(data, 'documents.claimAct.url')}
                                                       icon={<EyeOutlined/>} type="link"/> : null
                                       }
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item>
                                <Button onClick={() => {
                                    mutate({
                                        url: `${URLS.claimGenAct}?claimNumber=${claimNumber}`,
                                        attributes: {},
                                        method: 'put'
                                    }, {
                                        onSuccess: () => {
                                            refresh()
                                        }
                                    })
                                }} type="dashed"
                                >
                                    {t("Сформировать")}
                                </Button>
                            </Form.Item>
                        </Col>

                        <Col span={12}>
                            <Form.Item layout={'horizontal'}
                                       label={t('Платежные документы')}>
                                {
                                    get(paymentDocs, 'url') ? <Flex align={'center'}><Input disabled
                                                                                            value={get(paymentDocs, 'url')}
                                                                                            suffix={
                                                                                                <Button
                                                                                                    href={get(paymentDocs, 'url')}
                                                                                                    icon={
                                                                                                        <EyeOutlined/>}
                                                                                                    type="link"/>
                                                                                            }
                                        /><Button loading={isPendingDelete} onClick={() => {
                                            deleteRequest({
                                                url: `${URLS.file}/${get(paymentDocs, 'file')}`
                                            }, {
                                                onSuccess: () => {
                                                    setPaymentDocs({})
                                                }
                                            })
                                        }} className={'ml-3'} danger icon={<DeleteOutlined/>}/></Flex> :
                                        <CustomUpload setFile={(_file) => {
                                            setPaymentDocs({
                                                file: get(_file, 'id'),
                                                url: get(_file, 'url')
                                            })
                                        }}/>
                                }

                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item layout={'horizontal'}
                                       label={t('Обоснование ФАТФ')}>
                                {
                                    get(conclusionFatf, 'url') ? <Flex align={'center'}><Input disabled
                                                                                               value={get(conclusionFatf, 'url')}
                                                                                               suffix={
                                                                                                   <Button
                                                                                                       href={get(conclusionFatf, 'url')}
                                                                                                       icon={
                                                                                                           <EyeOutlined/>}
                                                                                                       type="link"/>
                                                                                               }
                                        /><Button loading={isPendingDelete} onClick={() => {
                                            deleteRequest({
                                                url: `${URLS.file}/${get(conclusionFatf, 'file')}`
                                            }, {
                                                onSuccess: () => {
                                                    setConclusionFatf({})
                                                }
                                            })
                                        }} className={'ml-3'} danger icon={<DeleteOutlined/>}/></Flex> :
                                        <CustomUpload setFile={(_file) => {
                                            setConclusionFatf({
                                                file: get(_file, 'id'),
                                                url: get(_file, 'url')
                                            })
                                        }}/>
                                }
                            </Form.Item>
                        </Col>

                    </Row>
                </Form>
            </Spin>
            <Drawer width={800} title={t('Запрос о предоставлении документа по претензионному делу')} open={open}
                    onClose={() => setOpen(false)}>
                <Form form={requestForm} layout="vertical" initialValues={{}}
                      onFinish={(_attrs) => {
                          mutate({
                              url: URLS.claimDocReq,
                              attributes: {
                                  materials: [_attrs],
                                  claimNumber: parseInt(claimNumber),
                                  conclusionFatf,
                                  paymentDocs
                              }
                          }, {
                              onSuccess: () => {
                                  setOpen(false)
                                  requestForm.resetFields()
                                  refresh()
                              }
                          })
                      }}>
                    <Row gutter={16} align="middle">
                        <Col span={12}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]} name={'requestDate'}
                                       initialValue={dayjs()} label={t('Дата запроса')}>
                                <DatePicker format={"DD.MM.YYYY"} className={'w-full'} disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]} name={'whoRequested'}
                                       initialValue={get(user, 'employee.fullname')} label={t('Кем запрошен')}>
                                <Input disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]} name={'description'}
                                       label={t('Описание документа')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name={'template'} label={t('Шаблон')}>
                                <CustomUpload setFile={(_file) => {
                                    requestForm.setFieldValue(['template', 'file'], get(_file, 'id'))
                                    requestForm.setFieldValue(['template', 'url'], get(_file, 'url'))
                                }}/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Space className={'mt-4'}>
                                <Button loading={isPending} htmlType={'submit'} className={'mr-3'} type="primary"
                                        name={'save'}>
                                    {t('Запросить')}
                                </Button>
                                <Button onClick={() => setOpen(false)} danger type="primary"
                                >
                                    {t('Отмена')}
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Drawer>

            <Drawer width={800} title={t('Проверка предоставленного документа по претензионному делу')}
                    open={!isNil(record)}
                    onClose={() => setRecord(null)}>
                <Form form={approveForm} layout="vertical" initialValues={{}}
                      onFinish={(_attrs) => {
                          mutate({
                              url: URLS.claimDocAccept,
                              attributes: {
                                  materials: [_attrs],
                                  claimNumber: parseInt(claimNumber),
                              }
                          }, {
                              onSuccess: () => {
                                  setRecord(null)
                                  approveForm.resetFields()
                                  refresh()
                              }
                          })
                      }}>
                    <Row gutter={16} align="middle">
                        <Col span={12}>
                            <Form.Item
                                label={t('Дата запроса')}>
                                <DatePicker format={"DD.MM.YYYY"} value={dayjs(get(record, 'requestDate', new Date()))}
                                            className={'w-full'}
                                            disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={t('Кем запрошен')}>
                                <Input value={get(record, 'whoRequested', get(user, 'employee.fullname'))} disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={t('Дата предоставления')}>
                                <DatePicker format={"DD.MM.YYYY"} value={dayjs(get(record, 'provideDate', new Date()))}
                                            className={'w-full'}
                                            disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={t('Описание документа')}>
                                <Input value={get(record, 'description')}
                                       disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={t('Шаблон')}>
                                <Input value={get(record, 'template.url')} disabled
                                       suffix={<Button href={get(record, 'template.url')} type={'link'}
                                                       icon={<EyeOutlined/>}/>}/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                rules={[{required: true, message: t('Обязательное поле')}]}
                                label={t('Документ')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                initialValue={dayjs()}
                                name={'checkDate'}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                                label={t('Дата проверки')}>
                                <DatePicker format={"DD.MM.YYYY"} value={dayjs(new Date())} className={'w-full'}
                                            disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                initialValue={get(user, 'employee.fullname')}
                                name={'whoChecked'}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                                label={t('Кем проверен')}>
                                <Input value={get(user, 'employee.fullname')} disabled/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name={'checkResult'}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                                label={t('Результат')}>
                                <Radio.Group
                                    options={[
                                        {
                                            value: 0,
                                            label: t('не принят')
                                        },
                                        {
                                            value: 1,
                                            label: t('принят')
                                        }
                                    ]}
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]} name={'comment'}
                                       label={t('Комментарий')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item hidden initialValue={get(record, 'id')}
                                       rules={[{required: true, message: t('Обязательное поле')}]} name={'id'}
                                       label={t('Комментарий')}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            <Space className={'mt-4'}>
                                <Button loading={isPending} htmlType={'submit'} className={'mr-3'} type="primary"
                                        name={'save'}>
                                    {t('Подтвердить')}
                                </Button>
                                <Button onClick={() => setRecord(null)} danger type="primary"
                                >
                                    {t('Отмена')}
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Drawer>
        </>
    );
};

export default ClaimDocs;
