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
import dayjs from "dayjs";
import ClaimDecision from "../components/claim-decision";
import ClaimJurnalVoice from "../components/claim-jurnal-voice";


const ClaimJurnalViewPage = () => {
    const {claimNumber} = useParams();
    const [searchParams, setSearchParams] = useSearchParams()
    const {t} = useTranslation();
    let {data, isLoading, refetch: refresh} = useGetAllQuery({
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
                            label: t('Журнал СЭК'),
                            children: <View disabled refresh={refresh} claimNumber={claimNumber}
                                            data={get(data, 'data')}/>
                        },
                        {
                            key: 'docs',
                            label: t('Документы по заявлению'),
                            children: <ClaimDocs disabled refresh={refresh} data={get(data, 'data')}
                                                 claimNumber={claimNumber}/>,
                        },
                        {
                            key: 'history',
                            label: t('История операций'),
                            children: <Card bordered title={(t('История операций по заявлению'))}>
                                <Datagrid responseListKeyName={'history'} showSearch={false} columns={[
                                    {
                                        title: t('Дата операции'),
                                        dataIndex: 'date',
                                        render: (text) => dayjs(text).format('YYYY-MM-DD'),
                                    },
                                    {
                                        title: t('Кем произведена'),
                                        dataIndex: 'whoMade',
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
                            children: <ClaimJurnalVoice refresh={refresh} claimNumber={claimNumber}
                                                        data={get(data, 'data')}/>
                        },
                    ]}
                />
            </PageHeader>

        </>

    );
};

export default ClaimJurnalViewPage;
