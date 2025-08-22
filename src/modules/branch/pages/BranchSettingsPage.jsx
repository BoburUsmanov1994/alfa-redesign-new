import React, {useEffect, useRef, useState} from 'react';
import {Button, Input} from "antd";
import {PageHeader, ProTable} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {get} from "lodash";
import {useGetAllQuery, usePutQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {URLS} from "../../../constants/url";

const BranchSettingsPage = () => {
    const {t} = useTranslation()
    const actionRef = useRef(null);
    const [dataSource, setDataSource] = useState([]);

    let {data,isLoading} = useGetAllQuery({
        key: KEYS.specificList, url: URLS.specificList
    })
    const {mutate, isPending} = usePutQuery({listKeyId: KEYS.specificList})

    const update = () => {
        mutate({
                   url:'api/branch/edit/bulk-update',
                   attributes:dataSource
        });
    }

    useEffect(() => {
        if(data){
            setDataSource(get(data,'data.data',[]).map(({_id,branchName,mfo,checkingAccount})=>({
                id:_id,
                branchName,
                mfo,
                checkingAccount
            })))
        }
    },[data])

    return (
        <>
            <PageHeader
                className={'p-0 mb-3'}
                title={t('Банк реквизиты филиалов')}
            />
            <ProTable
                dataSource={dataSource}
                loading={isLoading}
                style={{cursor: 'pointer'}}
                columns={[
                    {
                        title: t('Наименование филиала'),
                        dataIndex: 'branchName',
                    },
                    {
                        title: t('МФО банка'),
                        dataIndex: 'mfo',
                        align: 'center',
                        editable:true,
                        render: (_, record, index) => (
                            <Input
                                value={get(record, 'mfo')}
                                onChange={(e) => {
                                    const newData = [...dataSource];
                                    newData[index].mfo = e.target.value;
                                    setDataSource(newData);
                                }}
                            />
                        ),
                        width:150
                    },
                    {
                        title: t('Расчетный счет'),
                        dataIndex: 'checkingAccount',
                        align: 'center',
                        width:350,
                        render: (_, record, index) => (
                            <Input
                                value={get(record, 'checkingAccount')}
                                onChange={(e) => {
                                    const newData = [...dataSource];
                                    newData[index].checkingAccount = e.target.value;
                                    setDataSource(newData);
                                }}
                            />
                        ),
                    },
                ]}
                actionRef={actionRef}
                cardBordered
                pagination={false}
                search={false}
                rowKey={'id'}
                toolBarRender={false}
                revalidateOnFocus
                defaultSize={'small'}
            />
            <Button loading={isPending} onClick={update} type={'primary'} className={'mt-6 min-w-80'}>{t("Сохранить")}</Button>
        </>
    );
};

export default BranchSettingsPage;
