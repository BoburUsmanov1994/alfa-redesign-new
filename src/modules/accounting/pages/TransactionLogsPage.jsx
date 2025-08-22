import React, {useRef} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {get} from "lodash";

const TransactionLogsPage = () => {
    const {t} = useTranslation()
    const formRef = useRef(null);

    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Журналы транзакций')}
            />
            <Datagrid
                showSearch={false}
                rowKey={'createdAt'}
                responseListKeyName={'data'}
                formRef={formRef}
                defaultCollapsed
                columns={[

                    {
                        title: t('Distribute type'),
                        dataIndex: 'typeofdistribute',
                        render: (_, _tr) => get(_tr, 'typeofdistribute.name'),
                        width: 225,
                        hideInSearch:true
                    },
                    {
                        title: t('Payment order number'),
                        dataIndex: 'payment_order_number',
                        width: 125,
                        align:'center',
                        hideInSearch:true
                    },

                    {
                        title: t('Amount'),
                        dataIndex: 'amount',
                        valueType: 'digit',
                        fieldProps: {
                            style: {width: '100%'},
                            formatter: (value) =>
                                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '',
                            parser: (value) => value?.replace(/(,*)/g, ''),
                        },
                        align: 'center',
                        render: (_, record) => Intl.NumberFormat('en-US')?.format(get(record, 'amount', 0)),
                        width: 175,
                        hideInSearch:true
                    },
                    {
                        title: t('cred_account_ID'),
                        dataIndex: 'cred_account_ID',
                        hideInSearch: true,
                        align: 'center',
                        width: 125
                    },
                    {
                        title: t('debt_account_ID'),
                        dataIndex: 'debt_account_ID',
                        hideInSearch: true,
                        align: 'center',
                        width: 125
                    },
                    {
                        title: t('transaction_date'),
                        dataIndex: 'transaction_date',
                        hideInSearch: true,
                        align: 'center',
                        width: 125
                    },
                ]}
                url={`${URLS.transactionLogs}/list`} />

        </>
    );
};

export default TransactionLogsPage;
