import React, {useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {
    Button, Col, Divider,
    Flex,
    Form, Radio,
    Spin, Switch,
} from "antd";
import {useNavigate} from "react-router-dom";
import {useGetAllQuery, usePostQuery} from "../../../hooks/api";
import {URLS} from "../../../constants/url";
import {get, isEqual, toUpper} from "lodash";
import dayjs from "dayjs";
import {KEYS} from "../../../constants/key";
import {getSelectOptionsListFromData} from "../../../utils";
import ApplicantForm from "../components/applicant-form";
import EventForm from "../components/event-form";
import FileForm from "../components/file-form";
import PoliceForm from "../components/police-form";
import ResponsibleForm from "../components/responsible-form";
import VehicleForm from "../components/vehicle-form";
import LifeDamage from "../components/life-damage";
import HealthDamage from "../components/health-damage";
import VehicleDamage from "../components/vehicle-damage";
import PropertyDamage from "../components/property-damage";
import {find} from "lodash/collection";


const ClaimCreatePage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [lifeDamage, setLifeDamage] = useState([]);
    const [healthDamage, setHealthDamage] = useState([]);
    const [vehicleDamage, setVehicleDamage] = useState([]);
    const [otherPropertyDamage, setOtherPropertyDamage] = useState([]);
    const {mutate, isPending} = usePostQuery({})
    const {
        eventCircumstances,
        client,
        applicant,
        polisSeria,
        polisNumber,
        claimType,
        responsible,
        owner,
        hasLifeDamage,
        hasHealthDamage,
        hasVehicleDamage,
        hasPropertyDamage,
        responsibleVehicleInfo,
        responsibleForDamage,
        hasResponsibleDamage,
        hasResponsibleVehicle,
        isApplicationBehalfToApplicant
    } = Form.useWatch([], form) || {}
    const [files, setFiles] = useState([]);

    let {data: residentTypes, isLoading: isLoadingResident} = useGetAllQuery({
        key: KEYS.residentType,
        url: URLS.residentType,
    });
    residentTypes = getSelectOptionsListFromData(get(residentTypes, `data.data`, []), '_id', 'name')

    const {data: country, isLoading: isLoadingCountry} = useGetAllQuery({
        key: KEYS.countries, url: `${URLS.countries}`
    })
    const countryList = getSelectOptionsListFromData(get(country, `data.data`, []), '_id', 'name')

    let {data: regions, isLoading: isLoadingRegion} = useGetAllQuery({
        key: KEYS.regions,
        url: `${URLS.regions}/list`,
    });
    regions = getSelectOptionsListFromData(get(regions, `data.data`, []), '_id', 'name')


    let {data: ownershipForms, isLoading: isLoadingOwnershipForms} = useGetAllQuery({
        key: KEYS.ownershipForms,
        url: `${URLS.ownershipForms}/list`,
    });
    ownershipForms = getSelectOptionsListFromData(get(ownershipForms, `data.data`, []), '_id', 'name')

    let {data: vehicleTypes} = useGetAllQuery({
        key: KEYS.vehicleType,
        url: `${URLS.vehicleType}/list`,
    });
    vehicleTypes = getSelectOptionsListFromData(get(vehicleTypes, `data.data`, []), '_id', 'name')

    let {data: areaTypes} = useGetAllQuery({
        key: KEYS.areaTypes,
        url: `${URLS.areaTypes}`,
    });
    areaTypes = getSelectOptionsListFromData(get(areaTypes, `data.data`, []), 'id', 'name')

    const getPersonInfo = (type = ['applicant', 'person'], _form = form) => {
        mutate({
            url: URLS.personalInfo,
            attributes: {
                passportSeries: toUpper(_form.getFieldValue([...type, 'passportData', 'seria'])),
                passportNumber: _form.getFieldValue([...type, 'passportData', 'number']),
                pinfl: _form.getFieldValue([...type, 'passportData', 'pinfl']),
            }
        }, {
            onSuccess: ({data: result}) => {
                _form.setFieldValue([...type, 'birthDate'], dayjs(get(result, 'birthDate')))
                _form.setFieldValue([...type, 'fullName', 'firstname'], get(result, 'firstNameLatin'))
                _form.setFieldValue([...type, 'fullName', 'lastname'], get(result, 'lastNameLatin'))
                _form.setFieldValue([...type, 'fullName', 'middlename'], get(result, 'middleNameLatin'))
                _form.setFieldValue([...type, 'gender'], get(result, 'gender'))
                _form.setFieldValue([...type, 'regionId'], get(result, 'regionId'))
                _form.setFieldValue([...type, 'districtId'], get(result, 'districtId'))
                _form.setFieldValue([...type, 'address'], get(result, 'address'))
                _form.setFieldValue([...type, 'passportData', 'givenPlace'], get(find(get(result, 'documents', []), _item => isEqual(get(_item, 'document'), `${toUpper(_form.getFieldValue([...type, 'passportData', 'seria']))}${_form.getFieldValue([...type, 'passportData', 'number'])}`)), 'docgiveplace'))
                _form.setFieldValue([...type, 'passportData', 'issueDate'], dayjs(get(find(get(result, 'documents', []), _item => isEqual(get(_item, 'document'), `${toUpper(_form.getFieldValue([...type, 'passportData', 'seria']))}${_form.getFieldValue([...type, 'passportData', 'number'])}`)), 'datebegin')))
            }
        })
    }

    const getOrgInfo = (type = ['applicant', 'organization'], _form = form) => {
        mutate({
            url: URLS.orgInfo,
            attributes: {
                inn: _form.getFieldValue([...type, 'inn']),
            }
        }, {
            onSuccess: ({data: result}) => {
                _form.setFieldValue([...type, 'name'], get(result, 'name'))
                _form.setFieldValue([...type, 'oked'], get(result, 'oked'))
                _form.setFieldValue([...type, 'address'], get(result, 'address'))
                _form.setFieldValue([...type, 'checkingAccount'], get(result, 'account'))
                _form.setFieldValue([...type, 'representativeName'], get(result, 'gdFullName'))
                _form.setFieldValue([...type, 'phone'], get(result, 'phone'))
                _form.setFieldValue([...type, 'email'], get(result, 'email'))
            }
        })
    }

    const getVehicleInfo = (type = ['vehicle', 'person'], _form = form) => {
        mutate({
            url: URLS.vehicleInfoProvider,
            attributes: {
                techPassportSeria: toUpper(_form.getFieldValue([...type, 'techPassport', 'seria'])),
                techPassportNumber: _form.getFieldValue([...type, 'techPassport', 'number']),
                govNumber: _form.getFieldValue([...type, 'govNumber']),
            }
        }, {
            onSuccess: ({data: result}) => {
                _form.setFieldValue([...type, 'vehicleTypeId'], get(result, 'vehicleTypeId'))
                _form.setFieldValue([...type, 'modelCustomName'], get(result, 'modelName'))
                _form.setFieldValue([...type, 'regionId'], get(result, 'regionId'))
                _form.setFieldValue([...type, 'bodyNumber'], get(result, 'bodyNumber'))
                _form.setFieldValue([...type, 'engineNumber'], get(result, 'engineNumber'))
                _form.setFieldValue([...type, 'liftingCapacity'], parseInt(get(result, 'stands')))
                _form.setFieldValue([...type, 'numberOfSeats'], parseInt(get(result, 'seats')))
                _form.setFieldValue([...type, 'issueYear'], get(result, 'issueYear'))
            }
        })
    }

    const onFinish = ({
                          client,
                          responsible,
                          owner,
                          hasLifeDamage,
                          hasHealthDamage,
                          hasVehicleDamage,
                          hasPropertyDamage,
                          hasResponsibleDamage,
                          ...rest
                      }) => {

        mutate({
            url: URLS.claimDraft,
            attributes: {
                ...rest,
                photoVideoMaterials: files?.map(({id, url}) => ({file: id, url})),
                lifeDamage,
                healthDamage,
                vehicleDamage,
                otherPropertyDamage
            }
        }, {
            onSuccess: () => {
                form.resetFields();
                navigate('/claims')
            }
        })
    };

    if (isLoadingCountry || isLoadingResident || isLoadingRegion || isLoadingOwnershipForms) {
        return <Spin spinning fullscreen/>
    }


    return (
        <>
            <PageHeader
                title={t('Добавление заявление')}
            >
                <Spin spinning={isPending}>
                    <Form
                        name="create"
                        form={form}
                        layout="vertical"
                        initialValues={{}}
                        onFinish={onFinish}
                    >
                        <ApplicantForm applicant={applicant} getPersonInfo={getPersonInfo} getOrgInfo={getOrgInfo}
                                       client={client} countryList={countryList} regions={regions}
                                       residentTypes={residentTypes} ownershipForms={ownershipForms}/>
                        <PoliceForm form={form} polisSeria={polisSeria} polisNumber={polisNumber}/>
                        <EventForm areaTypes={areaTypes} eventCircumstances={eventCircumstances} regions={regions}
                                   claimType={claimType}/>
                        <ResponsibleForm hasResponsibleDamage={hasResponsibleDamage} applicant={responsibleForDamage}
                                         getPersonInfo={getPersonInfo} getOrgInfo={getOrgInfo}
                                         client={responsible} countryList={countryList} regions={regions}
                                         residentTypes={residentTypes} ownershipForms={ownershipForms}/>
                        <VehicleForm form={form} hasResponsibleVehicle={hasResponsibleVehicle} isPending={isPending}
                                     applicant={responsibleVehicleInfo} vehicleTypes={vehicleTypes}
                                     getVehicleInfo={getVehicleInfo}
                                     getPersonInfo={getPersonInfo} getOrgInfo={getOrgInfo}
                                     owner={owner} countryList={countryList} regions={regions}
                                     residentTypes={residentTypes} ownershipForms={ownershipForms}/>
                        <Col span={24}>
                            <Divider orientation={'left'}>{t('Понесенный ущерб:')}</Divider>
                        </Col>
                        <Col span={24}>
                            <Form.Item
                                initialValue={false}
                                layout={'horizontal'}
                                label={t("Вред жизни (летальный исход)")}
                                name={'hasLifeDamage'}
                            >
                                <Radio.Group options={[{value: false, label: t('нет')}, {
                                    value: true,
                                    label: t('нанесен')
                                }]}/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            {
                                hasLifeDamage &&
                                <LifeDamage getPersonInfo={getPersonInfo}
                                            regions={regions}
                                            residentTypes={residentTypes}
                                            countryList={countryList}
                                            isPending={isPending}
                                            title={'Потерпевшие'}
                                            setLifeDamage={setLifeDamage}
                                            lifeDamage={lifeDamage}/>
                            }
                        </Col>


                        <Col span={24}>
                            <Form.Item
                                initialValue={false}
                                layout={'horizontal'}
                                label={t("Вред здоровью:")}
                                name={'hasHealthDamage'}
                            >
                                <Radio.Group options={[{value: false, label: t('нет')}, {
                                    value: true,
                                    label: t('нанесен')
                                }]}/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            {
                                hasHealthDamage && <HealthDamage
                                    getPersonInfo={getPersonInfo}
                                    regions={regions}
                                    residentTypes={residentTypes}
                                    countryList={countryList}
                                    isPending={isPending}
                                    title={'Потерпевшие'} setHealthDamage={setHealthDamage}
                                    healthDamage={healthDamage}/>
                            }
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                initialValue={false}
                                layout={'horizontal'}
                                label={t("Вред автомобилю:")}
                                name={'hasVehicleDamage'}
                            >
                                <Radio.Group options={[{value: false, label: t('нет')}, {
                                    value: true,
                                    label: t('нанесен')
                                }]}/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            {
                                hasVehicleDamage &&
                                <VehicleDamage
                                    _form={form}
                                    getPersonInfo={getPersonInfo}
                                    regions={regions}
                                    residentTypes={residentTypes}
                                    countryList={countryList}
                                    isPending={isPending}
                                    getVehicleInfo={getVehicleInfo}
                                    getOrgInfo={getOrgInfo}
                                    title={'Пострадавшие ТС'}
                                    setVehicleDamage={setVehicleDamage}
                                    vehicleDamage={vehicleDamage}
                                    vehicleTypes={vehicleTypes}
                                />
                            }
                        </Col>

                        <Col span={24}>
                            <Form.Item
                                initialValue={false}
                                layout={'horizontal'}
                                label={t("Вред имуществу:")}
                                name={'hasPropertyDamage'}
                            >
                                <Radio.Group options={[{value: false, label: t('нет')}, {
                                    value: true,
                                    label: t('нанесен')
                                }]}/>
                            </Form.Item>
                        </Col>
                        <Col span={24}>
                            {
                                hasPropertyDamage && <PropertyDamage
                                    _form={form}
                                    ownershipForms={ownershipForms}
                                    regions={regions}
                                    residentTypes={residentTypes}
                                    countryList={countryList}
                                    isPending={isPending}
                                    getVehicleInfo={getVehicleInfo}
                                    getOrgInfo={getOrgInfo}
                                    getPersonInfo={getPersonInfo}
                                    title={'Пострадавшее имущество'}
                                    setOtherPropertyDamage={setOtherPropertyDamage}
                                    otherPropertyDamage={otherPropertyDamage}/>
                            }
                        </Col>
                        <Col span={24}>
                            <Form.Item rules={[{required: true, message: t('Обязательное поле')}]}
                                       name={'isApplicationBehalfToApplicant'} layout={'horizontal'}
                                       label={t('Заявление подано от имени Заявителя:')} valuePropName="checked"
                                       initialValue={false}>
                                <Switch/>
                            </Form.Item>
                        </Col>

                        <FileForm enabled={isApplicationBehalfToApplicant} files={files} setFiles={setFiles}/>

                        <Flex className={'mt-6'}>
                            <Button className={'mr-3'} type="default" htmlType={'submit'}
                                    name={'draft'}>
                                {t('Сохранить как черновик')}
                            </Button>
                            <Button danger type={'primary'} onClick={() => navigate('/claims')}>
                                {t('Отменить')}
                            </Button>
                        </Flex>
                    </Form>
                </Spin>

            </PageHeader>
        </>

    );
};

export default ClaimCreatePage;
