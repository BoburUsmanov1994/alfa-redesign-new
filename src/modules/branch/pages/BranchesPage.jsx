import React, {useRef} from 'react';
import {Button} from "antd";
import {DownloadOutlined} from "@ant-design/icons";
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {get} from "lodash";

const BranchesPage = () => {
    const {t} = useTranslation()
    const actionRef = useRef(null);

    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Филиалы')}
            />
            <Datagrid
                showSearch={false}
                rowKey={'_id'}
                responseListKeyName={'data'}
                actionRef={actionRef}
                defaultCollapsed
                columns={[

                    {
                        title: t('Название филиала'),
                        dataIndex: 'branchName',
                    },
                    {
                        title: t('Fond id'),
                        dataIndex: 'fondId',
                        align: 'center',
                    },
                ]}
                url={`${URLS.branches}/list`} />
        </>
    );
};

export default BranchesPage;
