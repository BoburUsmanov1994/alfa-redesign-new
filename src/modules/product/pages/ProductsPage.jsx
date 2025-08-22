import React, {useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {Button} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {useTranslation} from "react-i18next";
import Datagrid from "../../../containers/datagrid";
import {URLS} from "../../../constants/url";
import {request} from "../../../services/api";
import {getSelectOptionsListFromData} from "../../../utils";
import {get} from "lodash";
import {KEYS} from "../../../constants/key";
import {useGetAllQuery} from "../../../hooks/api";
import {useNavigate} from "react-router-dom";

const ProductsPage = () => {
    const {t} = useTranslation()
    const navigate = useNavigate()
    const [group,setGroup] = useState(null);
    let {data: subGroups} = useGetAllQuery({
        key: KEYS.subgroupsofproductsFilter,
        url: URLS.subgroupsofproductsFilter,
        params: {
            params: {
                group
            }
        },
        enabled: !!group
    })
    return (
        <>
            <PageHeader
                className={'p-0 mb-1.5'}
                title={t('Все продукты')}
                extra={[
                    <Button type="primary" icon={<PlusOutlined/>} onClick={()=>navigate('/products/create')}>
                        {t('Добавить')}
                    </Button>,
                ]}
            />
            <Datagrid
                columns={[
                    {
                        title:t('Выберите категорию'),
                        dataIndex: 'group',
                        valueType: 'select',
                        hideInTable: true,
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            onChange:setGroup,
                        },
                        request: async () => {
                            const groups =  await request.get(`${URLS.groupsofproducts}/list`)
                            return getSelectOptionsListFromData(get(groups, `data.data`, []), '_id', 'name')
                        },
                    },
                    {
                        title:t('Выберите подкатегорию'),
                        dataIndex: 'subGroup',
                        valueType: 'select',
                        hideInTable: true,
                        fieldProps: {
                            showSearch: true,
                            placeholder: t('Поиск...'),
                            options: getSelectOptionsListFromData(get(subGroups, `data.data`, []), '_id', 'name') || [],
                        },
                    },
                    {
                        title: t('Наименование продукта'),
                        dataIndex: 'name',
                        hideInSearch:true
                    },
                    {
                        title: t('Тип страховщика'),
                        dataIndex: 'policyTypes',
                        hideInSearch:true,
                        render:(text)=>text?.map(({name})=>name).join(' , ')
                    },
                    {
                        title: t('Тип оплаты'),
                        dataIndex: 'paymentType',
                        hideInSearch:true,
                        render:(text)=>text?.map(({name})=>name).join(' , ')
                    },
                    {
                        title: t('Страховая сумма'),
                        dataIndex: 'fixedPremium',
                        valueType:'digit',
                        hideInSearch:true,
                        align:'center'
                    },
                    {
                        title: t('Действия'),
                        valueType: 'option',
                        align:'right',
                        render: (text, record, _, action) => [
                            <Button  size={'small'} className={'mx-auto'} key="edit" type="link" onClick={() => console.log('Edit', record)}>
                                {t('Редактировать')}
                            </Button>,
                            <Button size={'small'} className={'mx-auto'} key="delete" type="link" danger onClick={() => console.log('Delete', record)}>
                                {t('Удалить')}
                            </Button>,
                        ],
                        width:200,
                    },
                ]}
                url={`${URLS.products}`}
            />
        </>
    );
};

export default ProductsPage;
