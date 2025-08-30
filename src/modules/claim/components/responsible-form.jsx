import React from 'react';
import {Button, Col, DatePicker, Divider, Form, Input, Radio, Row, Select, Switch, Typography} from "antd";
import {get, isEqual} from "lodash";
import MaskedInput from "../../../components/masked-input";
import {ReloadOutlined} from "@ant-design/icons";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../utils";
import {useTranslation} from "react-i18next";
import {useGetAllQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {URLS} from "../../../constants/url";
import {isNil} from "lodash/lang";

const ResponsibleForm = ({
                             client,
                             applicant,
                             getPersonInfo,
                             isPending,
                             getOrgInfo,
                             residentTypes = [],
                             countryList = [],
                             regions = [],
                             ownershipForms = [],
                             hasResponsibleDamage = false,
                             data,
                             _form
                         }) => {
    const {t} = useTranslation();
    let {data: districts} = useGetAllQuery({
        key: [KEYS.districts, get(applicant, 'person.regionId'), get(applicant, 'organization.regionId')],
        url: `${URLS.districts}/list`,
        params: {
            params: {
                region: get(applicant, 'person.regionId') || get(applicant, 'organization.regionId')
            }
        },
        enabled: !!(get(applicant, 'person.regionId') || get(applicant, 'organization.regionId'))
    })
    districts = getSelectOptionsListFromData(get(districts, `data.data`, []), '_id', 'name')
    console.log('datadata', data)
    return (
        <>
            <Row gutter={16}>
                <Col span={24} className={'mb-4'}>
                    <Divider orientation={'left'}>
                        <Typography.Title level={5}>{t('Виновное лицо:')}</Typography.Title>
                    </Divider>
                </Col>
                <Col span={12}>
                    <Form.Item
                        initialValue={!isNil(get(data, 'responsibleForDamage', null))}
                        layout={'horizontal'}
                        label={t("Виновное лицо")}
                        name={'hasResponsibleDamage'}
                    >
                        <Radio.Group options={[{value: false, label: t('нет')}, {
                            value: true,
                            label: t('нанесен')
                        }]}/>
                    </Form.Item>
                </Col>
                {
                    hasResponsibleDamage && <Col span={12}>
                        <Form.Item
                            initialValue={false}
                            layout={'horizontal'}
                            name={['responsibleForDamage','isApplicantResponsible']}
                            label={t("Виновен Заявитель")}
                        >
                            <Switch
                                onChange={(val) => {
                                    if (val) {
                                        if (isEqual(client, 'person')) {
                                            _form.setFieldValue(['responsibleForDamage', 'person'], _form.getFieldValue(['applicant', 'person']));
                                        } else {
                                            _form.setFieldValue(['responsibleForDamage', 'organization'], _form.getFieldValue(['applicant', 'organization']));
                                        }
                                    }
                                }}
                            />
                        </Form.Item>
                    </Col>
                }
            </Row>
            {
                hasResponsibleDamage && <>
                    <Row gutter={16}>
                        <Col xs={6}>
                            <Form.Item initialValue={get(data,'responsibleForDamage.person')?'person':get(data,'responsibleForDamage.organization')?'organization':'person'} name={'responsible'} label={t('Виновен Заявитель')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Radio.Group options={[{value: 'person', label: t('физ.лицо')}, {
                                    value: 'organization',
                                    label: t('юр.лицо')
                                }]}/>
                            </Form.Item>
                        </Col>
                        <Col xs={18}>
                            {isEqual(client, 'person') && <Row gutter={16}>
                                <Col xs={6}>
                                    <Form.Item
                                        label={t("Серия паспорта")}
                                        name={['responsibleForDamage', 'person', 'passportData', 'seria']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <Input className={'uppercase'}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item
                                        label={t("Номер паспорта")}
                                        name={['responsibleForDamage', 'person', 'passportData', 'number']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item
                                        label={t("ПИНФЛ")}
                                        name={['responsibleForDamage', 'person', 'passportData', 'pinfl']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item label={' '}>
                                        <Button loading={isPending} icon={<ReloadOutlined/>}
                                                onClick={() => getPersonInfo(['responsibleForDamage', 'person'])}
                                                type="primary">
                                            {t('Найти')}
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>}
                            {isEqual(client, 'organization') && <Row gutter={16}>
                                <Col xs={6}>
                                    <Form.Item
                                        label={t("ИНН")}
                                        name={['responsibleForDamage', 'organization', 'inn']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <MaskedInput mask={'999999999'} placeholder={'_________'}/>
                                    </Form.Item>
                                </Col>

                                <Col xs={6}>
                                    <Form.Item label={' '}>
                                        <Button loading={isPending} icon={<ReloadOutlined/>}
                                                onClick={() => getOrgInfo(['responsibleForDamage', 'organization'])}
                                                type="primary">
                                            {t('Найти')}
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>}
                        </Col>
                    </Row>
                    {isEqual(client, 'person') && <Row gutter={16}>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'passportData', 'givenPlace']}
                                       label={t(' Кем выдан паспорт')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'passportData', 'issueDate']}
                                       label={t('Дата выдачи паспорта')}
                            >
                                <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'birthDate']} label={t('Дата рождения')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'fullName', 'lastname']}
                                       label={t('Фамилия')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'fullName', 'firstname']} label={t('Имя')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'fullName', 'middlename']}
                                       label={t('Отчество')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'residentType']} label={t('Резидент')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={residentTypes}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item initialValue={210} name={['responsibleForDamage', 'person', 'countryId']}
                                       label={t('Страна')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={countryList}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'gender']} label={t('Пол')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={[
                                    {
                                        value: 'm',
                                        label: t('мужчина')
                                    },
                                    {
                                        value: 'f',
                                        label: t('женщина')
                                    }
                                ]}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'regionId']} label={t('Область')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={regions}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'districtId']} label={t('Район')}
                            >
                                <Select options={districts}/>
                            </Form.Item>
                        </Col>
                        <Col xs={12}>
                            <Form.Item name={['responsibleForDamage', 'person', 'address']} label={t('Адрес')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'driverLicenseSeria']}
                                       label={t(' Серия вод. удостоверения')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'person', 'driverLicenseNumber']}
                                       label={t('Номер вод. удостоверения')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Телефон")}
                                name={['responsibleForDamage', 'person', 'phone']}
                                getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Электронная почта")}
                                name={['responsibleForDamage', 'person', 'email']}
                                rules={[
                                    {
                                        type: 'email',
                                        message: t('Введите действительный адрес электронной почты'),
                                    },
                                ]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>

                    </Row>}
                    {isEqual(client, 'organization') && <Row gutter={16}>
                        <Col xs={12}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['responsibleForDamage', 'organization', 'name']}
                                       label={t('Наименование')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'organization', 'ownershipFormId']}
                                       label={t('Форма собственности')}
                            >
                                <Select options={ownershipForms}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['responsibleForDamage', 'organization', 'oked']}
                                       label={t('ОКЭД')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item initialValue={210} name={['responsibleForDamage', 'organization', 'countryId']}
                                       label={t('Страна')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={countryList}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'organization', 'regionId']} label={t('Область')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={regions}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'organization', 'districtId']} label={t('Район')}
                            >
                                <Select options={districts}/>
                            </Form.Item>
                        </Col>
                        <Col xs={12}>
                            <Form.Item name={['responsibleForDamage', 'organization', 'address']} label={t('Адрес')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'organization', 'checkingAccount']}
                                       label={t('Расчетный счет')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'organization', 'representativeName']}
                                       label={t('Фамилия представителя')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleForDamage', 'organization', 'position']}
                                       label={t('Должность представителя')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Контактный номер")}
                                name={['responsibleForDamage', 'organization', 'phone']}
                                getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Электронная почта")}
                                name={['responsibleForDamage', 'organization', 'email']}
                                rules={[
                                    {
                                        type: 'email',
                                        message: t('Введите действительный адрес электронной почты'),
                                    },
                                ]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>}
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                label={t("Заявлено в организацию")}
                                name={['responsibleForDamage', 'declaredToOrganization']}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Номер заключения")}
                                name={['responsibleForDamage', 'supervisoryAuthorityConclusion', 'number']}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Дата заключения")}
                                name={['responsibleForDamage', 'supervisoryAuthorityConclusion', 'date']}
                            >
                                <DatePicker format="DD.MM.YYYY" className={'w-full'}/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label={t("Комментарий")}
                                name={['responsibleForDamage', 'supervisoryAuthorityConclusion', 'comment']}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            }
        </>
    );
};

export default ResponsibleForm;
