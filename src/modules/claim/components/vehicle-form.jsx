import React, {useEffect} from 'react';
import {Button, Col, DatePicker, Divider, Form, Input, InputNumber, Radio, Row, Select, Switch, Typography} from "antd";
import {get, isEqual} from "lodash";
import MaskedInput from "../../../components/masked-input";
import {ReloadOutlined} from "@ant-design/icons";
import {getSelectOptionsListFromData, stripNonDigits} from "../../../utils";
import {useTranslation} from "react-i18next";
import {useGetAllQuery} from "../../../hooks/api";
import {KEYS} from "../../../constants/key";
import {URLS} from "../../../constants/url";
import {isNil} from "lodash/lang";

const VehicleForm = ({
                         owner,
                         applicant,
                         getPersonInfo,
                         isPending,
                         getOrgInfo,
                         residentTypes = [],
                         countryList = [],
                         regions = [],
                         ownershipForms = [],
                         vehicleTypes = [],
                         getVehicleInfo,
                         hasResponsibleVehicle = false,
                         form = null,
                         data,
                         insurantIsOwnerDisabled=false
                     }) => {
    const {t} = useTranslation();
    let {data: districts} = useGetAllQuery({
        key: [KEYS.districts, get(applicant, 'ownerPerson.regionId'), get(applicant, 'ownerOrganization.regionId'), get(applicant, 'regionId')],
        url: `${URLS.districts}/list`,
        params: {
            params: {
                region: get(applicant, 'ownerPerson.regionId') || get(applicant, 'ownerOrganization.regionId') || get(applicant, 'regionId')
            }
        },
        enabled: !!(get(applicant, 'ownerPerson.regionId') || get(applicant, 'ownerOrganization.regionId') || get(applicant, 'regionId'))
    })
    districts = getSelectOptionsListFromData(get(districts, `data.data`, []), '_id', 'name')
    return (
        <>
            <Row gutter={16}>
                <Col span={24} className={'mb-4'}>
                    <Divider orientation={'left'}>
                        <Typography.Title level={5}>{t('Виновное транспортное средство:')}</Typography.Title>
                    </Divider>
                </Col>
                <Col span={24}>
                    <Form.Item
                        initialValue={!isNil(get(data, 'responsibleVehicleInfo', null))}
                        layout={'horizontal'}
                        labelAlign={'left'}
                        labelCol={{span: 4}}
                        label={t("Виновное лицо")}
                        name={'hasResponsibleVehicle'}
                    >
                        <Radio.Group options={[{value: false, label: t('нет')}, {
                            value: true,
                            label: t('есть')
                        }]}/>
                    </Form.Item>
                </Col>
            </Row>
            {
                hasResponsibleVehicle && <>
                    <Row gutter={16}>
                        <Col xs={4}>
                            <Form.Item
                                label={t("Серия тех. паспорта")}
                                name={['responsibleVehicleInfo', 'techPassport', 'seria']}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                                normalize={(value) => (value ? value.toUpperCase() : "")}
                            >
                                <MaskedInput mask={'aaa'}  placeholder={'__'}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item
                                label={t("Номер тех. паспорта")}
                                name={['responsibleVehicleInfo', 'techPassport', 'number']}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={'9999999'} placeholder={'_______'}/>
                            </Form.Item>
                        </Col>
                        <Col xs={8}>
                            <Form.Item
                                label={t("Регистрационный номер")}
                                name={['responsibleVehicleInfo', 'govNumber']}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item label={' '}>
                                <Button loading={isPending} icon={<ReloadOutlined/>}
                                        onClick={() => getVehicleInfo(['responsibleVehicleInfo'])}
                                        type="primary">
                                    {t('Найти')}
                                </Button>
                            </Form.Item>
                        </Col>

                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'vehicleTypeId']} label={t('Тип авто')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={vehicleTypes}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'modelCustomName']} label={t('Марка')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item initialValue={210} name={['responsibleVehicleInfo', 'countryId']}
                                       label={t('Страна')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={countryList}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'regionId']} label={t('Область')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={regions}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'districtId']} label={t('Район')}
                            >
                                <Select options={districts}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'bodyNumber']}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                                       label={t('Номер кузова')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'engineNumber']} label={t('Номер двигателя')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'liftingCapacity']} label={t('Грузоподъемность')}
                            >
                                <InputNumber/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'numberOfSeats']} label={t('Количество мест')}
                            >
                                <InputNumber className={'w-full'}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'issueYear']} label={t('Год выпуска')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <InputNumber className={'w-full'}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item valuePropName="checked"
                                       initialValue={false} name={['responsibleVehicleInfo', 'isForeign']}
                                       label={t('Является иностранным')}
                            >
                                <Switch/>
                            </Form.Item>
                        </Col>

                        <Col xs={24}>
                            <Divider/>
                        </Col>
                        <Col xs={6}>
                            <Form.Item initialValue={'person'} name={'owner'} label={t('Владелец авто')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Radio.Group options={[{value: 'person', label: t('физ.лицо')}, {
                                    value: 'organization',
                                    label: t('юр.лицо')
                                }]}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item valuePropName="checked"
                                       initialValue={false} name={['responsibleVehicleInfo', 'insurantIsOwner']}
                                       label={t("Владеет Виновное лицо")}
                            >
                                <Switch
                                    onChange={(val) => {
                                        if (val) {
                                            if (isEqual(owner, 'person')) {
                                                form.setFieldValue(['responsibleVehicleInfo', 'ownerPerson'], form.getFieldValue(['responsibleForDamage', 'person']));
                                            } else {
                                                form.setFieldValue(['responsibleVehicleInfo', 'ownerOrganization'], form.getFieldValue(['responsibleForDamage', 'organization']));
                                            }
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            {isEqual(owner, 'person') && <Row gutter={16}>
                                <Col xs={6}>
                                    <Form.Item
                                        label={t("Серия паспорта")}
                                        name={['responsibleVehicleInfo', 'ownerPerson', 'passportData', 'seria']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <Input className={'uppercase'}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={6}>
                                    <Form.Item
                                        label={t("Номер паспорта")}
                                        name={['responsibleVehicleInfo', 'ownerPerson', 'passportData', 'number']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Col>
                                <Col xs={8}>
                                    <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'birthDate']}
                                               label={t('Дата рождения')}
                                               rules={[{required: true, message: t('Обязательное поле')}]}>
                                        <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                                    </Form.Item>
                                </Col>
                                <Col xs={4}>
                                    <Form.Item label={' '}>
                                        <Button loading={isPending} icon={<ReloadOutlined/>}
                                                onClick={() => getPersonInfo(['responsibleVehicleInfo', 'ownerPerson'])}
                                                type="primary">
                                            {t('Найти')}
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>}
                            {isEqual(owner, 'organization') && <Row gutter={16}>
                                <Col xs={4}>
                                    <Form.Item
                                        label={t("ИНН")}
                                        name={['responsibleVehicleInfo', 'ownerOrganization', 'inn']}
                                        rules={[{required: true, message: t('Обязательное поле')}]}
                                    >
                                        <MaskedInput mask={'999999999'} placeholder={'_________'}/>
                                    </Form.Item>
                                </Col>

                                <Col xs={6}>
                                    <Form.Item label={' '}>
                                        <Button loading={isPending} icon={<ReloadOutlined/>}
                                                onClick={() => getOrgInfo(['responsibleVehicleInfo', 'ownerOrganization'])}
                                                type="primary">
                                            {t('Найти')}
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>}
                        </Col>
                    </Row>
                    {isEqual(owner, 'person') ? <Row gutter={16}>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'passportData', 'givenPlace']}
                                       label={t(' Кем выдан паспорт')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'passportData', 'issueDate']}
                                       label={t('Дата выдачи паспорта')}
                            >
                                <DatePicker format={"DD.MM.YYYY"} className={'w-full'}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item
                                label={t("ПИНФЛ")}
                                name={['responsibleVehicleInfo', 'ownerPerson', 'passportData', 'pinfl']}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'fullName', 'lastname']}
                                       label={t('Фамилия')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'fullName', 'firstname']}
                                       label={t('Имя')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'fullName', 'middlename']}
                                       label={t('Отчество')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'residentType']}
                                       label={t('Резидент')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={residentTypes}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item initialValue={210} name={['responsibleVehicleInfo', 'ownerPerson', 'countryId']}
                                       label={t('Страна')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={countryList}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'gender']} label={t('Пол')}
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
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'regionId']} label={t('Область')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={regions}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'districtId']} label={t('Район')}
                            >
                                <Select options={districts}/>
                            </Form.Item>
                        </Col>
                        <Col xs={12}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'address']} label={t('Адрес')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'driverLicenseSeria']}
                                       label={t(' Серия вод. удостоверения')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerPerson', 'driverLicenseNumber']}
                                       label={t('Номер вод. удостоверения')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Телефон")}
                                name={['responsibleVehicleInfo', 'ownerPerson', 'phone']}
                                getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Электронная почта")}
                                name={['responsibleVehicleInfo', 'ownerPerson', 'email']}
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

                    </Row> : <Row gutter={16}>
                        <Col xs={12}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['responsibleVehicleInfo', 'ownerOrganization', 'name']}
                                       label={t('Наименование')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerOrganization', 'ownershipFormId']}
                                       label={t('Форма собственности')}
                            >
                                <Select options={ownershipForms}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={['responsibleVehicleInfo', 'ownerOrganization', 'oked']}
                                       label={t('ОКЭД')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item initialValue={210}
                                       name={['responsibleVehicleInfo', 'ownerOrganization', 'countryId']}
                                       label={t('Страна')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={countryList}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerOrganization', 'regionId']}
                                       label={t('Область')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}>
                                <Select options={regions}/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerOrganization', 'districtId']}
                                       label={t('Район')}
                            >
                                <Select options={districts}/>
                            </Form.Item>
                        </Col>
                        <Col xs={12}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerOrganization', 'address']} label={t('Адрес')}
                                       rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerOrganization', 'checkingAccount']}
                                       label={t('Расчетный счет')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerOrganization', 'representativeName']}
                                       label={t('Фамилия представителя')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={6}>
                            <Form.Item name={['responsibleVehicleInfo', 'ownerOrganization', 'position']}
                                       label={t('Должность представителя')}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Контактный номер")}
                                name={['responsibleVehicleInfo', 'ownerOrganization', 'phone']}
                                getValueFromEvent={(e) => stripNonDigits(e.target.value)}
                                rules={[{required: true, message: t('Обязательное поле')}]}
                            >
                                <MaskedInput mask={"+\\9\\98 (99) 999-99-99"}/>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item
                                label={t("Электронная почта")}
                                name={['responsibleVehicleInfo', 'ownerOrganization', 'email']}
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
                </>
            }
        </>
    );
};

export default VehicleForm;
