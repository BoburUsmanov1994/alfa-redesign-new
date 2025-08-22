import React from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {
    Spin, Tabs,
} from "antd";
import {useParams} from "react-router-dom";
import {useGetAllQuery} from "../../../hooks/api";
import {URLS} from "../../../constants/url";
import {get} from "lodash";
import {KEYS} from "../../../constants/key";
import Datagrid from "../../../containers/datagrid";
import View from "../components/view";


const ClaimViewPage = () => {
    const {claimNumber} = useParams();
    const {t} = useTranslation();
    let {data, isLoading} = useGetAllQuery({
        key: [KEYS.claimShow, claimNumber],
        url: `${URLS.claimShow}?claimNumber=${claimNumber}`,
        enabled: !!(claimNumber)
    });


    if (isLoading) {
        return <Spin spinning fullscreen/>
    }


    return (
        <>
            <PageHeader
                title={t('Детали  портфель')}
            >
                <Tabs
                    items={[
                        {
                            key: 'view',
                            label: t('Претензионный портфель'),
                            children: <View id={claimNumber} data={get(data, 'data')}/>
                        },
                        {
                            key: 'docs',
                            label: t('Документы по заявлению')
                        },
                        {
                            key: 'history',
                            label: t('История операций'),
                            children: <Datagrid responseListKeyName={'result'} showSearch={false} columns={[
                                {
                                    title: t('Дата операции'),
                                    dataIndex: 'date',
                                },
                                {
                                    title: t('Комментарий'),
                                    dataIndex: 'comment',
                                },
                                {
                                    title: t('Типы операций'),
                                    dataIndex: 'operation',
                                }
                            ]} url={`${URLS.claimHistory}?claimNumber=${claimNumber}`}/>
                        },
                        {
                            key: 'cek',
                            label: t('СЭК')
                        },
                        {
                            key: 'payment',
                            label: t('Решение и выплата')
                        },
                    ]}
                />
            </PageHeader>

        </>

    );
};

export default ClaimViewPage;
