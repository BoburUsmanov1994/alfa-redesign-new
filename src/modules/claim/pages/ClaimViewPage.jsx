import React from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {
    Card,
    Spin, Tabs,
} from "antd";
import {useParams, useSearchParams} from "react-router-dom";
import {useGetAllQuery} from "../../../hooks/api";
import {URLS} from "../../../constants/url";
import {get} from "lodash";
import {KEYS} from "../../../constants/key";
import Datagrid from "../../../containers/datagrid";
import View from "../components/view";
import ClaimVoice from "../components/claim-voice";
import ClaimDocs from "../components/claim-docs";


const ClaimViewPage = () => {
    const {claimNumber} = useParams();
    const [searchParams, setSearchParams] = useSearchParams()
    const {t} = useTranslation();
    let {data, isLoading,refetch:refresh} = useGetAllQuery({
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
                    onTabClick={(tab) => {
                        setSearchParams(`tab=${tab}`);
                    }}
                    activeKey={searchParams.get("tab") || 'view'}
                    items={[
                        {
                            key: 'view',
                            label: t('Претензионный портфель'),
                            children: <View refresh={refresh} claimNumber={claimNumber} data={get(data, 'data')}/>
                        },
                        {
                            key: 'docs',
                            label: t('Документы по заявлению'),
                            children: <ClaimDocs data={get(data, 'data')} claimNumber={claimNumber} />,
                        },
                        {
                            key: 'history',
                            label: t('История операций'),
                            children: <Card bordered title={(t('История операций по заявлению'))}>
                                <Datagrid responseListKeyName={'docs'} showSearch={false} columns={[
                                    {
                                        title: t('Дата операции'),
                                        dataIndex: 'date',
                                    },
                                    {
                                        title: t('Кем произведена'),
                                        dataIndex: 'comment',
                                    },
                                    {
                                        title: t('Типы операций'),
                                        dataIndex: 'operation',
                                    },
                                    {
                                        title: t('Комментарий'),
                                        dataIndex: 'comment',
                                    }
                                ]} url={`${URLS.claimHistory}?claimNumber=${claimNumber}`}/>
                            </Card>
                        },
                        {
                            key: 'voice',
                            label: t('СЭК'),
                            children: <ClaimVoice claimNumber={claimNumber} data={get(data, 'data')}/>
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
