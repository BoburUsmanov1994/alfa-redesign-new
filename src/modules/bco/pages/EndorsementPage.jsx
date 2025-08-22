import React, {useRef} from 'react';
import {Button, Flex, Popconfirm, Spin} from "antd";
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {get} from "lodash";
import dayjs from "dayjs";
import {usePutQuery} from "../../../hooks/api";

const EndorsementPage = () => {
    const {t} = useTranslation()
    const actionRef = useRef(null);
    const {mutate: allowRequest, isPending} = usePutQuery({})

    const allow = (_id, _isAllowed = true) => {
        allowRequest({
            url: `${URLS.endorsements}/${_id}`,
            attributes: {
                allow: _isAllowed
            }
        },{
            onSuccess:()=>{
                actionRef.current?.reload()
            }
        })
    }

    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Индоссамент')}
            />
            <Spin spinning={isPending}>
            <Datagrid
                rowKey={'createdAt'}
                responseListKeyName={'data'}
                actionRef={actionRef}
                defaultCollapsed
                showSearch={false}
                columns={[

                    {
                        title: t('№ договора'),
                        dataIndex: 'agreement',
                        render: (_, _tr) => get(_tr, 'agreement.agreementNumber'),
                        width: 175,
                        hideInSearch: true
                    },
                    {
                        title: t('Дата договора'),
                        dataIndex: 'createdAt',
                        render: (_, _tr) => dayjs(get(_tr, 'createdAt')).format("DD.MM.YYYY"),
                        width: 85,
                        hideInSearch: true,
                        align: 'center'
                    },
                    {
                        title: t('Причина'),
                        dataIndex: 'reason',
                        width: 200,
                        hideInSearch: true,
                        align: 'center'
                    },
                    {
                        title: t('Продукт'),
                        dataIndex: 'product',
                        width: 225,
                        hideInSearch: true,
                        render: (_, _tr) => get(_tr, 'product.name'),
                    },
                    {
                        title: t('Страховая премия'),
                        dataIndex: 'insurancePremium',
                        align: 'right',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'insurancePremium', 0)),
                        width: 175,
                        hideInSearch: true,
                    },
                    {
                        title: t('Начало покрытия'),
                        dataIndex: 'startDate',
                        render: (_, _tr) => dayjs(get(_tr, 'startDate')).format("DD.MM.YYYY"),
                        valueType: 'date',
                        hideInSearch: true,
                        align: 'center',
                        width: 85
                    },
                    {
                        title: t('Конец покрытия'),
                        dataIndex: 'endDate',
                        render: (_, _tr) => dayjs(get(_tr, 'endDate')).format("DD.MM.YYYY"),
                        valueType: 'date',
                        hideInSearch: true,
                        align: 'center',
                        width: 85
                    },
                    {
                        title: t('Дата решения'),
                        dataIndex: 'createdAt',
                        render: (_, _tr) => dayjs(get(_tr, 'createdAt')).format("DD.MM.YYYY"),
                        valueType: 'date',
                        hideInSearch: true,
                        align: 'center',
                        width: 85
                    },
                    {
                        title: t('Кем принято решение'),
                        dataIndex: 'request_creator',
                        width: 175,
                        hideInSearch: true,
                        render: (_, _tr) => get(_tr, 'request_creator.name'),
                    },
                    {
                        title: t('Решение'),
                        dataIndex: 'request_creator',
                        width: 225,
                        hideInSearch: true,
                        render: (_, _tr) => get(_tr, 'decision') === 'waiting' ?<Flex align={'center'}>
                            <Popconfirm
                                title={t('Одобрить?')}
                                onConfirm={() => allow(get(_tr, '_id'))}
                            >
                            <Button className='mr-1.5'>{t('Одобрить')} </Button>
                            </Popconfirm>
                            <Popconfirm
                                title={t('Отказать?')}
                                onConfirm={() => allow(get(_tr, '_id'),false)}
                            >
                            <Button danger>{t('Отказать')}</Button>
                            </Popconfirm>
                        </Flex>:get(_tr, 'decision')
                    },

                ]}
                url={`${URLS.endorsements}/list`}/>
            </Spin>
        </>
    );
};

export default EndorsementPage;
