import React, {useRef, useState} from 'react';
import {useTranslation} from "react-i18next";
import {
    PageHeader,
    ProCard,
    ProForm,
    ProFormCheckbox,
    ProFormDependency,
    ProFormList,
    ProFormSelect, ProFormSwitch,
    ProFormText, ProFormUploadDragger,
    StepsForm,
} from '@ant-design/pro-components';
import {useGetAllQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {URLS} from "../../../constants/url";
import {getSelectOptionsListFromData} from "../../../utils";
import {get, isEqual} from "lodash";
import {request} from "../../../services/api";
import {Button, Steps} from "antd";
import {find} from "lodash/collection";
import {DeleteOutlined} from "@ant-design/icons";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const ProductCreatePage = () => {
    const {t} = useTranslation()
    const formRef = useRef();
    const reactQuillRef = React.useRef();
    const [comment, setComment] = useState('');
    let {data: groups} = useGetAllQuery({
        key: KEYS.groupsofproducts,
        url: `${URLS.groupsofproducts}/list`,
    })
    const groupsList = getSelectOptionsListFromData(get(groups, `data.data`, []), '_id', 'name')

    let {data: insurances} = useGetAllQuery({key: KEYS.insuranceForm, url: `${URLS.insuranceForm}/list`})
    insurances = getSelectOptionsListFromData(get(insurances, `data.data`, []), '_id', 'name')

    let {data: sectors} = useGetAllQuery({key: KEYS.typeofsector, url: `${URLS.sectorType}/list`})
    sectors = getSelectOptionsListFromData(get(sectors, `data.data`, []), '_id', 'name')

    let {data: bcoTypes} = useGetAllQuery({key: KEYS.typeofbco, url: `${URLS.bcoType}/list`})
    bcoTypes = getSelectOptionsListFromData(get(bcoTypes, `data.data`, []), '_id', 'policy_type_name')

    let {data: persons} = useGetAllQuery({key: KEYS.typeofpersons, url: `${URLS.personType}/list`})
    persons = getSelectOptionsListFromData(get(persons, `data.data`, []), '_id', 'name')

    let {data: status} = useGetAllQuery({key: KEYS.statusofproduct, url: `${URLS.statusofproduct}/list`})
    status = getSelectOptionsListFromData(get(status, `data.data`, []), '_id', 'name')

    let {data: riskGroups} = useGetAllQuery({key: KEYS.typeofrisk, url: `${URLS.riskType}/list`})
    riskGroups = getSelectOptionsListFromData(get(riskGroups, `data.data`, []), '_id', 'name')

    let {data: insuranceClassesList} = useGetAllQuery({key: KEYS.classes, url: `${URLS.insuranceClass}/list`})
    let insuranceClasses = getSelectOptionsListFromData(get(insuranceClassesList, `data.data`, []), '_id', 'name')

    let {data: risksListData} = useGetAllQuery({key: KEYS.risk, url: `${URLS.risk}/list`})
    let risksList = getSelectOptionsListFromData(get(risksListData, `data.data`, []), '_id', 'name')

    const findItem = (list = [], id = null) => {
        console.log(find(list, l => isEqual(get(l, "_id"), id)))
        return find(list, l => isEqual(get(l, "_id"), id))
    }
    const addRisk = async () => {
        const values = formRef.current?.getFieldValue('riskId') || [];
        const newValues = [...values, {
            riskgroup: formRef.current?.getFieldValue('riskType'),
            risk: formRef.current?.getFieldValue('risk'),
            classeId: formRef.current?.getFieldValue('classeId')
        }];
        formRef.current?.setFieldValue('riskId', newValues);
        formRef.current?.setFieldValue('riskType', null);
        formRef.current?.setFieldValue('risk', null);
        formRef.current?.setFieldValue('classeId', null);
    };

        const customUpload = async (file) => {
            console.log('file',file,)
            try {
                const formData = new FormData();
                formData.append('file', file);
                request.post(URLS.file,formData,{headers:{
                        'content-type': 'multipart/form-data'
                    }}).then((res)=>{
                    // onSuccess(res, file);
                    console.log(res)
                })

            } catch (err) {
                // onError(err);
            }
        };

    return (
        <>
            <PageHeader
                className={'px-3'}
                title={t('Добавить продукт')}
            />
            <StepsForm
                formRef={formRef}
                onFinish={async (values) => {
                    console.log(values);
                }}
                stepsFormRender={(dom, submitter) => (
                    <div className={'py-2.5 px-4 w-full'}>
                        {dom}
                        {submitter}
                    </div>
                )}
                stepsRender={(steps, props) => {
                    return (
                        <div style={{width: '100%'}}>
                            <Steps
                                {...props}
                                current={props?.current}
                                items={steps.map((step) => ({
                                    key: step.key,
                                    title: step.title,
                                }))}
                                responsive={false}
                            />
                        </div>
                    );
                }}
                formProps={{
                    validateMessages: {
                        required: t('Обязательное поле'),
                    },
                }}

            >
                <StepsForm.StepForm
                    name="one"
                    title={t("Добавление продукта")}
                    onFinish={async (values) => {
                        console.log('one', values)
                        return true;
                    }}
                >
                    <ProCard
                        title={t("Информация о продукте")}
                        bordered
                        headerBordered
                        collapsible
                        style={{
                            marginBlockEnd: 16,
                            minWidth: 1000,
                            maxWidth: '100%',
                        }}
                    >
                        <ProForm.Group>
                            <ProFormSelect
                                width="md"
                                name="group"
                                placeholder={t("Выбирать")}
                                label={t('Выберите категорию')}
                                rules={[{required: true}]}
                                options={groupsList}
                            />
                            <ProFormDependency name={['group']}>
                                {({group}) => (
                                    <ProFormSelect
                                        key={group}
                                        width="md"
                                        name="subGroup"
                                        placeholder={t("Выбирать")}
                                        label={t('Выберите подкатегорию')}
                                        rules={[{required: true}]}
                                        disabled={!group}
                                        request={
                                            async () => {
                                                const subGroups = await request.get(`${URLS.subgroupsofproductsFilter}`, {params: {group}})
                                                return getSelectOptionsListFromData(get(subGroups, `data.data`, []), '_id', 'name')
                                            }
                                        }
                                    />
                                )}

                            </ProFormDependency>
                            <ProFormText
                                name="name"
                                width="md"
                                label={t('Наименование продукта')}
                                placeholder={t("Введите значение")}
                                rules={[{required: true}]}
                            />
                            <ProFormText
                                name="nameUz"
                                width="md"
                                label={t('Наименование продукта (UZ)')}
                                placeholder={t("Введите значение")}
                            />
                            <ProFormText
                                name="nameEng"
                                width="md"
                                label={t('Наименование продукта (EN)')}
                                placeholder={t("Введите значение")}
                            />
                            <ProFormText
                                name="code"
                                width="md"
                                label={t('Код назначения')}
                                placeholder={t("Введите значение")}
                                rules={[{required: true}]}
                            />
                            <ProFormText
                                name="version"
                                width="md"
                                label={t('Работа по версии продукта (Версия продукта)')}
                                placeholder={t("Введите значение")}
                            />
                            <ProFormSelect
                                width="md"
                                name="insuranceForm"
                                placeholder={t("Выбирать")}
                                label={t('Форма страхования')}
                                options={insurances}
                            />
                            <ProFormSelect
                                width="md"
                                name="sectorType"
                                placeholder={t("Выбирать")}
                                label={t('Указать сектор')}
                                options={sectors}
                            />
                            <ProFormSelect
                                width="md"
                                name="bcoType"
                                placeholder={t("Выбирать")}
                                label={t('Bco type')}
                                options={bcoTypes}
                            />
                            <ProFormSwitch
                                width="xs"
                                label={t('Требуется разрешение')}
                                name="isRequirePermission"
                            />
                            <ProFormCheckbox.Group
                                name="personType"
                                label={t("Выбрать тип страховщика")}
                                options={persons}
                            />
                            <ProFormSelect
                                width="md"
                                name="status"
                                placeholder={t("Выбирать")}
                                label={t('Статус продукта')}
                                options={status}
                                rules={[{required: true}]}
                            />

                        </ProForm.Group>

                    </ProCard>

                    <ProCard
                        title={t("Добавить риски")}
                        bordered
                        headerBordered
                        collapsible
                        style={{
                            minWidth: 1000,
                            marginBlockEnd: 16,
                        }}

                    >
                        <ProForm.Group>
                            <ProFormSelect
                                width="md"
                                name="riskType"
                                placeholder={t("Выбирать")}
                                label={t('Выберите группу риска')}
                                options={riskGroups}
                            />
                            <ProFormDependency name={['riskType']}>
                                {({riskType}) => (
                                    <ProFormSelect
                                        key={riskType}
                                        width="md"
                                        name="risk"
                                        placeholder={t("Выбирать")}
                                        label={t('Выберите риск')}
                                        disabled={!riskType}
                                        request={
                                            async () => {
                                                const subGroups = await request.get(`${URLS.risk}/list`, {params: {riskType}})
                                                return getSelectOptionsListFromData(get(subGroups, `data.data`, []), '_id', 'name')
                                            }
                                        }
                                    />
                                )}

                            </ProFormDependency>
                            <ProFormDependency name={['risk']}>
                                {({risk}) => {
                                    formRef.current?.setFieldsValue({
                                        classeId: get(findItem(
                                            get(risksListData, 'data.data', []), risk
                                        ), 'insuranceClass._id')
                                    });
                                    return <ProFormSelect
                                        key={risk}
                                        width="md"
                                        name="classeId"
                                        placeholder={t("Выбирать")}
                                        label={t('Класс страхования')}
                                        options={insuranceClasses}
                                        disabled
                                    />
                                }
                                }
                            </ProFormDependency>
                            <ProForm.Item label={' '}>
                                <Button onClick={addRisk}>{t('Добавить')}</Button>
                            </ProForm.Item>
                        </ProForm.Group>
                        <ProFormList
                            name="riskId"
                            creatorButtonProps={false}
                            copyIconProps={false}
                            deleteIconProps={{
                                tooltipText: t('Удалить'),
                                icon: <Button danger icon={<DeleteOutlined/>}/>,
                            }}
                            rules={[{required: true}]}
                        >
                            <ProForm.Group>
                                <ProFormSelect
                                    width="md"
                                    name="riskgroup"
                                    placeholder={t("Выбирать")}
                                    label={t('Тип риска')}
                                    options={riskGroups}
                                    disabled
                                />
                                <ProFormSelect
                                    width="md"
                                    name="risk"
                                    placeholder={t("Выбирать")}
                                    label={t('Риск')}
                                    options={risksList}
                                    disabled
                                />
                                <ProFormSelect
                                    width="md"
                                    name="classeId"
                                    placeholder={t("Выбирать")}
                                    label={t('Класс страхования')}
                                    options={insuranceClasses}
                                    disabled
                                />
                            </ProForm.Group>
                        </ProFormList>
                    </ProCard>
                    <ProCard
                        title={t("Комментарий о риске")}
                        bordered
                        headerBordered
                        collapsible
                        style={{
                            minWidth: 1000,
                            marginBlockEnd: 16,

                        }}
                    >
                        <ReactQuill
                            ref={reactQuillRef}
                            value={comment}
                            onChange={setComment}
                            style={{height: 250, marginBottom: 50}}
                        />

                    </ProCard>
                </StepsForm.StepForm>
                <StepsForm.StepForm name="two" title={t("Добавление параметров")}
                                    onFinish={async (values) => {
                                        console.log('two', values)
                                        return true;
                                    }}
                >
                    <ProCard
                        style={{
                            minWidth: 1000,
                            marginBlockEnd: 16,
                            maxWidth: '100%',
                        }}
                    >
                        <ProForm.Group>
                            <ProForm.Group>
                                <ProFormSwitch
                                    width="md"
                                    label={t('Имеет форму анкеты заявления')}
                                    name="hasApplicationForm"
                                />
                                <ProFormDependency name={['hasApplicationForm']}>
                                    {({hasApplicationForm}) => hasApplicationForm && <ProFormUploadDragger
                                        max={1}
                                        beforeUpload={() => false}
                                        action={customUpload}
                                        name="applicationForm" label={t("Форма заявки")} description={null} title={t("Прикрепить файл")}/>
                                    }</ProFormDependency>
                            </ProForm.Group>
                            <ProForm.Group>
                                <ProFormSwitch
                                    width="md"
                                    label={t('Имеет конракт')}
                                    name="hasContractForm"
                                />
                                <ProFormDependency name={['hasContractForm']}>
                                    {({hasContractForm}) => hasContractForm && <ProFormUploadDragger max={1}  action={customUpload} name="contractForm" label={t("Форма договора")} description={null} title={t("Прикрепить файл")}/>
                                    }</ProFormDependency>
                            </ProForm.Group>
                            <ProForm.Group>
                                <ProFormSwitch
                                    width="md"
                                    label={t('Имеет приложение')}
                                    name="hasAdditionalDocuments"
                                />
                                <ProFormDependency name={['hasAdditionalDocuments']}>
                                    {({hasAdditionalDocuments}) => hasAdditionalDocuments && <ProFormUploadDragger max={1}  action={customUpload} name="additionalDocuments" label={t("Дополнительные документы")} description={null} title={t("Прикрепить файл")}/>
                                    }</ProFormDependency>
                            </ProForm.Group>
                        </ProForm.Group>
                    </ProCard>
                </StepsForm.StepForm>
                <StepsForm.StepForm name="time11" title={t("Калькуляция")}>
                    <ProCard
                        style={{
                            marginBlockEnd: 16,
                            minWidth: 800,
                            maxWidth: '100%',
                        }}
                    >
                        <ProFormCheckbox.Group
                            name="checkbox"
                            label="部署单元"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            options={['部署单元1', '部署单元2', '部署单元3']}
                        />
                        <ProFormSelect
                            label="部署分组策略"
                            name="remark"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            width="md"
                            initialValue="1"
                            options={[
                                {
                                    value: '1',
                                    label: '策略一',
                                },
                                {value: '2', label: '策略二'},
                            ]}
                        />
                        <ProFormSelect
                            label="Pod 调度策略"
                            name="remark2"
                            width="md"
                            initialValue="2"
                            options={[
                                {
                                    value: '1',
                                    label: '策略一',
                                },
                                {value: '2', label: '策略二'},
                            ]}
                        />
                    </ProCard>
                </StepsForm.StepForm>
                <StepsForm.StepForm name="time" title={t("Франшиза")}>
                    <ProCard
                        style={{
                            marginBlockEnd: 16,
                            minWidth: 800,
                            maxWidth: '100%',
                        }}
                    >
                        <ProFormCheckbox.Group
                            name="checkbox"
                            label="部署单元"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            options={['部署单元1', '部署单元2', '部署单元3']}
                        />
                        <ProFormSelect
                            label="部署分组策略"
                            name="remark"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            width="md"
                            initialValue="1"
                            options={[
                                {
                                    value: '1',
                                    label: '策略一',
                                },
                                {value: '2', label: '策略二'},
                            ]}
                        />
                        <ProFormSelect
                            label="Pod 调度策略"
                            name="remark2"
                            width="md"
                            initialValue="2"
                            options={[
                                {
                                    value: '1',
                                    label: '策略一',
                                },
                                {value: '2', label: '策略二'},
                            ]}
                        />
                    </ProCard>
                </StepsForm.StepForm>
                <StepsForm.StepForm name="time1" title={t("Проверка данных")}>
                    <ProCard
                        style={{
                            marginBlockEnd: 16,
                            minWidth: 800,
                            maxWidth: '100%',
                        }}
                    >
                        <ProFormCheckbox.Group
                            name="checkbox"
                            label="部署单元"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            options={['部署单元1', '部署单元2', '部署单元3']}
                        />
                        <ProFormSelect
                            label="部署分组策略"
                            name="remark"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            width="md"
                            initialValue="1"
                            options={[
                                {
                                    value: '1',
                                    label: '策略一',
                                },
                                {value: '2', label: '策略二'},
                            ]}
                        />
                        <ProFormSelect
                            label="Pod 调度策略"
                            name="remark2"
                            width="md"
                            initialValue="2"
                            options={[
                                {
                                    value: '1',
                                    label: '策略一',
                                },
                                {value: '2', label: '策略二'},
                            ]}
                        />
                    </ProCard>
                </StepsForm.StepForm>
                <StepsForm.StepForm name="time2" title={t("Подтверждение")}>
                    <ProCard
                        style={{
                            marginBlockEnd: 16,
                            minWidth: 800,
                            maxWidth: '100%',
                        }}
                    >
                        <ProFormCheckbox.Group
                            name="checkbox"
                            label="部署单元"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            options={['部署单元1', '部署单元2', '部署单元3']}
                        />
                        <ProFormSelect
                            label="部署分组策略"
                            name="remark"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            width="md"
                            initialValue="1"
                            options={[
                                {
                                    value: '1',
                                    label: '策略一',
                                },
                                {value: '2', label: '策略二'},
                            ]}
                        />
                        <ProFormSelect
                            label="Pod 调度策略"
                            name="remark2"
                            width="md"
                            initialValue="2"
                            options={[
                                {
                                    value: '1',
                                    label: '策略一',
                                },
                                {value: '2', label: '策略二'},
                            ]}
                        />
                    </ProCard>
                </StepsForm.StepForm>
            </StepsForm>
        </>
    );
};

export default ProductCreatePage;
