import React from 'react';
import {useGetAllQuery} from "../../../../hooks/api";
import {KEYS} from "../../../../constants/key";
import {URLS} from "../../../../constants/url";
import {getSelectOptionsListFromData} from "../../../../utils";
import {get, isEqual} from "lodash";
import {useTranslation} from "react-i18next";
import {
    Button,
    Checkbox,
    Col,
    Divider,
    Flex,
    Form,
    Input,
    InputNumber,
    notification,
    Row,
    Select,
    Switch,
    Typography
} from "antd";
import {DeleteOutlined, PlusOutlined} from "@ant-design/icons";
import {find} from "lodash/collection";

const StepOne = ({form}) => {
    const {t} = useTranslation();
    const group = Form.useWatch('group', form)
    const riskType = Form.useWatch('riskType', form)
    let {data: groups} = useGetAllQuery({
        key: KEYS.groupsofproducts,
        url: `${URLS.groupsofproducts}/list`,
    })
    const groupsList = getSelectOptionsListFromData(get(groups, `data.data`, []), '_id', 'name')

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

    const subGroupsList = getSelectOptionsListFromData(get(subGroups, `data.data`, []), '_id', 'name')

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

    let {data: riskData} = useGetAllQuery({
        key: KEYS.risk, url: `${URLS.risk}/list`, params: {
            params: {
                riskType
            }
        },
        enabled: !!riskType
    })
    let risks = getSelectOptionsListFromData(get(riskData, `data.data`, []), '_id', 'name')

    let {data: insuranceClassesList} = useGetAllQuery({key: KEYS.classes, url: `${URLS.insuranceClass}/list`})
    let insuranceClasses = getSelectOptionsListFromData(get(insuranceClassesList, `data.data`, []), '_id', 'name')

    let {data: risksListData} = useGetAllQuery({key: KEYS.risk, url: `${URLS.risk}/list`})
    let risksList = getSelectOptionsListFromData(get(risksListData, `data.data`, []), '_id', 'name')

    const handleAdd = () => {
        const risk = form.getFieldValue('risks') || [];
        if(form.getFieldValue('classId', form)) {
            const newRisk = {riskType: form.getFieldValue('riskType'), risk: form.getFieldValue('risk'), classId: form.getFieldValue('classId')};
            form.setFieldValue(
                'risks', [...risk, newRisk]
            );
            form.setFieldValue(
                'riskType', null
            );
            form.setFieldValue(
                'risk', null
            );
            form.setFieldValue(
                'classId', null
            );
        }else{
            notification['warning']({
                message:  t('Выберите риск')
            })
        }
    };
    console.log('groups', group)
    return (
        <>
            <Row gutter={16}>
                <Col xs={6}>
                    <Form.Item name={'group'} label={t('Выберите категорию')}
                               rules={[{required: true, message: t('Обязательное поле')}]}>
                        <Select placeholder={t("Выбирать")} showSearch allowClear options={groupsList}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'subGroup'} label={t('Выберите подкатегорию')}
                               rules={[{required: true, message: t('Обязательное поле')}]}>
                        <Select placeholder={t("Выбирать")} showSearch allowClear options={subGroupsList}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'name'} label={t('Наименование продукта')}
                               rules={[{required: true, message: t('Обязательное поле')}]}>
                        <Input placeholder={t("Введите значение")}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'nameUz'}
                               label={t('Наименование продукта (UZ)')}>
                        <Input placeholder={t("Введите значение")}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'nameEng'}
                               label={t('Наименование продукта (EN)')}>
                        <Input placeholder={t("Введите значение")}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'code'}
                               label={t('Код назначения')} rules={[{required: true, message: t('Обязательное поле')}]}>
                        <Input placeholder={t("Введите значение")}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'version'}
                               label={t('Работа по версии продукта (Версия продукта)')}>
                        <Input placeholder={t("Введите значение")}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'insuranceForm'} label={t('Форма страхования')}
                    >
                        <Select placeholder={t("Выбирать")} showSearch allowClear options={insurances}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'sectorType'} label={t('Указать сектор')}
                    >
                        <Select placeholder={t("Выбирать")} showSearch allowClear options={sectors}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'bcoType'} label={t('Bco type')}
                    >
                        <Select placeholder={t("Выбирать")} showSearch allowClear options={bcoTypes}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'isRequirePermission'} label={t('Требуется разрешение')}
                               valuePropName="checked"
                               initialValue={false}
                    >
                        <Switch/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'personType'} label={t("Выбрать тип страховщика")}
                    >
                        <Checkbox.Group options={persons}/>
                    </Form.Item>
                </Col>
                <Col xs={6}>
                    <Form.Item name={'status'} label={t('Статус продукта')}
                               rules={[{required: true, message: t('Обязательное поле')}]}
                    >
                        <Select placeholder={t("Выбирать")} showSearch allowClear options={status}/>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Divider orientation="left"><Typography.Title
                        level={4}>{t("Добавить риски")}</Typography.Title></Divider>
                    <Row gutter={16}>
                        <Col xs={6}>
                            <Form.Item name={'riskType'} label={t('Выберите группу риска')}
                            >
                                <Select placeholder={t("Выбирать")} showSearch allowClear options={riskGroups}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={'risk'} label={t('Выберите риск')}
                            >
                                <Select onChange={(_,{option})=>{
                                    form.setFieldValue('classId',get(option, 'insuranceClass._id'));
                                }} placeholder={t("Выбирать")} showSearch allowClear options={risks}/>
                            </Form.Item>
                        </Col>
                        <Col xs={8}>
                            <Form.Item name={'classId'}  label={t('Класс страхования')}
                            >
                                <Select disabled placeholder={t("Выбирать")} showSearch allowClear options={insuranceClasses}/>
                            </Form.Item>
                        </Col>
                        <Col xs={4}>
                            <Form.Item  label={' '}
                            >
                            <Button icon={<PlusOutlined/>} shape={'circle'} onClick={handleAdd} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.List name="risks" rules={[
                        {
                            validator: async (_, names) => {
                                if (!names || names.length < 1) {
                                    return Promise.reject(new Error('Требуется как минимум 1 риск'));
                                }
                            }
                        }
                    ]}>
                        {
                            (fields, {remove},{errors}) => (<>
                                <Form.ErrorList errors={errors} className={'text-red-400'} />

                                {
                                    fields?.map(({name, ...restField}) => <Row gutter={16} className={'mb-3'}>

                                        <Col xs={6}>
                                            <Form.Item {...restField} name={[name,'riskType']} label={t('Тип риска')}
                                            >
                                                <Select disabled placeholder={t("Выбирать")} showSearch allowClear options={riskGroups}/>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={6}>
                                            <Form.Item {...restField} name={[name,'risk']} label={t('Риск')}
                                            >
                                                <Select disabled placeholder={t("Выбирать")} showSearch allowClear options={risksList}/>
                                            </Form.Item>
                                        </Col>
                                        <Col xs={8}>
                                            <Form.Item {...restField} name={[name,'classId']} label={t('Класс страхования')}
                                            >
                                                <Select disabled placeholder={t("Выбирать")} showSearch allowClear options={insuranceClasses}/>
                                            </Form.Item>
                                        </Col>
                                        <Col span={4}>
                                            <Form.Item label={' '}>
                                                <Button shape={'circle'} icon={<DeleteOutlined/>} danger
                                                        onClick={() => remove(name)}/>
                                            </Form.Item>
                                        </Col>
                                    </Row>)
                                }
                            </>)
                        }
                    </Form.List>
                </Col>
            </Row>
        </>
    );
};

export default StepOne;
