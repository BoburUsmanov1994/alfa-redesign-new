import React, {useRef} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {useTranslation} from "react-i18next";
import {Button, Space, Tooltip} from "antd";
import {EyeOutlined} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import dayjs from "dayjs";
import {PERSON_TYPE} from "../../../constants";
import {get, isEqual, values} from "lodash";
import {useGetAllQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData} from "../../../utils";
import numeral from "numeral";
import {useStore} from "../../../store";
import {find} from "lodash/collection";


const ClaimJurnalPage = () => {
    const {t} = useTranslation();
    const actionRef = useRef();
    const {user} = useStore()
    const navigate = useNavigate();
    let {data: branches} = useGetAllQuery({
        key: KEYS.branches, url: `${URLS.branches}/list`, params: {
            params: {
                limit: 100
            }
        }
    })
    branches = getSelectOptionsListFromData(get(branches, `data.data`, []), '_id', 'branchName')

    const getVoteDetail = (votes=[]) => {
        return find(votes,(_vote)=>isEqual(get(_vote,'member.employee.id'),get(user,'employee.id')))
    }

    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Журнал СЭК')}
            />
            <Datagrid
                span={4}
                rowKey={'_id'}
                responseListKeyName={'docs'}
                actionRef={actionRef}
                columns={[
                    {
                        title: t('Номер заявления'),
                        dataIndex: 'claimNumber',
                        width: 100,
                        align: 'center',
                        render:(_,record)=>get(record,'regNumber',get(record,'claimNumber'))
                    },
                    {
                        title: t('Дата заявления'),
                        dataIndex: 'claimDate',
                        render: (text) => dayjs(text).format('YYYY-MM-DD'),
                        width: 100,
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Дата заявления'),
                        dataIndex: 'claimDate',
                        width: 150,
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                startDate: value[0],
                                endDate: value[1],
                            }),
                        },
                        hideInTable: true,
                    },
                    {
                        title: t('Дата передачи СЭК'),
                        dataIndex: 'sekVoteDetails',
                        width: 100,
                        hideInSearch: true,
                        align: 'center',
                        render: (text) => dayjs(get(text, 'sentDate')).format('YYYY-MM-DD')
                    },
                    {
                        title: t('Решение'),
                        dataIndex: 'sekVoteDetails',
                        width: 100,
                        hideInSearch: true,
                        align: 'center',
                        render: (text) =>  <Tooltip title={get(getVoteDetail(get(text,'votes',[])), 'comment','-')}>{t(get(getVoteDetail(get(text,'votes',[])), 'decision','-'))}</Tooltip>
                    },
                    {
                        title: t('Решение'),
                        dataIndex: 'voteDecision',
                        hideInTable: true,
                        valueType: 'select',
                        fieldProps: {
                            showSearch: true,
                            options: [
                                {value: 'agree', label: t('соглашаюсь')},
                                {
                                    value: 'disagree',
                                    label: t('против')
                                },
                                {
                                    value: 'abstain',
                                    label: t('воздержусь')
                                }
                            ],
                        },
                    },
                    {
                        title: t('Проголосовано'),
                        dataIndex: 'sekVoteDetails',
                        width: 100,
                        hideInSearch: true,
                        align: 'center',
                        render: (text) => get(getVoteDetail(get(text,'votes',[])), 'decision') ? 'Да' : 'Нет'
                    },
                    {
                        title: t('Проголосовано'),
                        dataIndex: 'isVoted',
                        hideInTable: true,
                        valueType: 'select',
                        fieldProps: {
                            showSearch: true,
                            options: [{
                                value: true,
                                label: 'Да'
                            },
                                {
                                    value: false,
                                    label: 'Нет'
                                }],
                        },
                    },

                    {
                        title: t('Юр/физ'),
                        dataIndex: 'applicant',
                        width: 100,
                        align: 'center',
                        hideInSearch: true,
                        render: (text) => get(text, 'organization.name') ? t('Юр') : t('физ')
                    },
                    {
                        title: t('Юр/физ'),
                        dataIndex: 'applicant',
                        valueType: 'select',
                        width: 100,
                        align: 'center',
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: values(PERSON_TYPE)?.map(item => ({value: item, label: t(item)})) || [],
                        },
                        hideInTable: true,
                    },
                    {
                        title: t('Филиал'),
                        width: 175,
                        dataIndex: 'agreement',
                        render: (_, record) => get(record, 'agreement.branch.branchName'),
                        hideInSearch: true,
                    },
                    {
                        title: t('Филиал'),
                        valueType: 'select',
                        dataIndex: 'branch',
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: branches
                        },
                        hideInTable: true,
                    },
                    {
                        title: t('Страховой продукт'),
                        dataIndex: 'product',
                        render: (text) => get(text, 'name'),
                        width: 200,
                    },
                    {
                        title: t('Классы страхования'),
                        dataIndex: 'agreement',
                        render: (text) => get(text, 'product.risk', [])?.map(item => get(item, 'insuranceClass.name'))?.join(', '),
                        hideInSearch: true,
                        align: 'center',
                        width: 175,
                    },
                    {
                        title: t('Серия и номер полиса'),
                        dataIndex: 'policy',
                        align: 'center',
                        render: (text, record) => <span>{get(record, 'polisSeria')}{get(record, 'polisNumber')}</span>,
                        width: 175,
                    },
                    {
                        title: t('Период страхования'),
                        dataIndex: 'policy',
                        hideInSearch: true,
                        width: 200,
                        align: 'center',
                        render: (text) => <span>{dayjs(get(text, 'startDate')).format('YYYY-MM-DD')} / {dayjs(get(text, 'endDate')).format('YYYY-MM-DD')}</span>,
                    },
                    {
                        title: t('Страховая сумма'),
                        dataIndex: 'policy',
                        hideInSearch: true,
                        width: 150,
                        align: 'center',
                        render: (text) => numeral(get(text, 'insuranceSum')).format('0,0.00')
                    },
                    {
                        title: t('Дата события'),
                        dataIndex: 'eventCircumstances',
                        render: (text) => dayjs(get(text, 'eventDateTime')).format('YYYY-MM-DD HH:mm'),
                        width: 150,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Дата события'),
                        dataIndex: 'eventCircumstances',
                        valueType: 'dateRange',
                        hideInTable: true,
                        search: {
                            transform: (value) => ({
                                eventStart: value[0],
                                eventEnd: value[1],
                            }),
                        },
                    },
                    {
                        title: t('Страховой риск'),
                        dataIndex: 'insuranceRisk',
                        hideInSearch: true,
                        width: 150,
                        align: 'center'
                    },
                    {
                        title: t('Объект страхования'),
                        dataIndex: 'agreement',
                        hideInSearch: true,
                        width: 150,
                        align: 'center',
                        render: (text) => get(text, 'objectOfInsurance', [])?.map(({type}) => t(type))?.join(', '),
                    },
                    {
                        title: t('Сумма заявленного убытка'),
                        dataIndex: 'totalDamageSum',
                        render: (text) => numeral(text).format('0,0.00'),
                        hideInSearch: true,
                        width: 150,
                        align: 'center',
                    },
                    {
                        title: t('Сумма выплаты'),
                        dataIndex: 'totalPaymentSum',
                        render: (text) => numeral(text).format('0,0.00'),
                        hideInSearch: true,
                        width: 150,
                        align: 'center',
                    },
                    {
                        title: t('Дата урегулирования'),
                        dataIndex: 'settlementDate',
                        width: 100,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Дата урегулирования'),
                        dataIndex: 'settlementDate',
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                settlementStart: value[0],
                                settlementEnd: value[1],
                            }),
                        },
                        hideInTable: true,
                    },
                    {
                        title: t('Дата выплаты'),
                        dataIndex: 'payment',
                        render: (text) => get(text, '[0].payoutDate') ? dayjs(get(text, '[0].payoutDate')).format('YYYY-MM-DD') : '-',
                        width: 100,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Дата выплаты'),
                        valueType: 'dateRange',
                        search: {
                            transform: (value) => ({
                                paymentStart: value[0],
                                paymentEnd: value[1],
                            }),
                        },
                        align: 'center',
                        hideInTable: true,
                    },
                    {
                        title: t('Регресс'),
                        dataIndex: 'conclusionDUSP',
                        render: (text) => get(text, 'regress'),
                        width: 100,
                        hideInSearch: true,
                        align: 'center',
                    },
                    {
                        title: t('Дата регресса'),
                        dataIndex: 'conclusionDUSP',
                        render: (text) => get(text, 'regressDate'),
                        width: 100,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Доля перестраховщиков'),
                        dataIndex: 'decision',
                        render: (text) => numeral(get(text, 'decision.reinsurerShare', 0)).format('0,0.00'),
                        width: 125,
                        align: 'center',
                        hideInSearch: true,
                    },
                    {
                        title: t('Действия'),
                        dataIndex: 'id',
                        fixed: 'right',
                        align: 'center',
                        width: 100,
                        hideInSearch: true,
                        render: (_id, record) => <Space>
                            <Button  onClick={() => navigate(`/claims/jurnal/view/${get(record, 'claimNumber')}`)}
                                    className={'cursor-pointer'}
                                    icon={<EyeOutlined/>}/>

                        </Space>
                    }

                ]}
                url={`${URLS.claims}`}/>
        </>
    );
};

export default ClaimJurnalPage;
