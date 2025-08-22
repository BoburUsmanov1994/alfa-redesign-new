import React, {useRef, useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {
    Button, Col, Divider,
    Flex,
    Form, Input, Radio, Row,
    Spin, Switch,
} from "antd";
import {useNavigate} from "react-router-dom";
import {useGetAllQuery, usePostQuery} from "../../../../hooks/api";
import {URLS} from "../../../../constants/url";
import {get, toUpper} from "lodash";
import dayjs from "dayjs";
import {KEYS} from "../../../../constants/key";
import {getSelectOptionsListFromData} from "../../../../utils";
import ApplicantForm from "../applicant-form";
import EventForm from "../event-form";
import FileForm from "../file-form";
import PoliceForm from "../police-form";
import ResponsibleForm from "../responsible-form";
import VehicleForm from "../vehicle-form";
import LifeDamage from "../life-damage";
import HealthDamage from "../health-damage";
import VehicleDamage from "../vehicle-damage";
import PropertyDamage from "../property-damage";
import ClaimStatus from "../claim-status";
import BankDetails from "../bank-details";
import ClaimDamage from "../claim-damage";


const ClaimView = () => {
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
        responsibleForDamage
    } = Form.useWatch([], form) || {}
    const [files, setFiles] = useState([]);
    const submitType = useRef(null);

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
                          ...rest
                      }) => {
        if (submitType.current) {
            mutate({
                url: URLS.claimCreate,
                attributes: {
                    ...rest,
                    lifeDamage,
                    healthDamage,
                    vehicleDamage,
                    otherPropertyDamage,
                    photoVideoMaterials: files?.map(({id, url}) => ({file: id, url}))
                }
            }, {
                onSuccess: () => {
                    form.resetFields();
                    navigate('/claims')
                }
            })
        } else {
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
        }
    };

    if (isLoadingCountry || isLoadingResident || isLoadingRegion || isLoadingOwnershipForms) {
        return <Spin spinning fullscreen/>
    }


    return (
        <>
            <PageHeader
            >
                <ClaimStatus/>
                <BankDetails/>
                <ClaimDamage/>
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
                        <ResponsibleForm applicant={responsibleForDamage} getPersonInfo={getPersonInfo}
                                         getOrgInfo={getOrgInfo}
                                         client={responsible} countryList={countryList} regions={regions}
                                         residentTypes={residentTypes} ownershipForms={ownershipForms}/>
                        <VehicleForm applicant={responsibleVehicleInfo} vehicleTypes={vehicleTypes}
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

                        <FileForm files={files} setFiles={setFiles}/>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Divider orientation={'left'}>{t('Информация для Заключения ДУСП')}</Divider>
                            </Col>
                            <Col span={6}>
                                <Form.Item label={t('Номер заключения')}>
                                    <Input disabled/>
                                </Form.Item>
                            </Col>

                            <Col span={6}>
                                <Form.Item label={t('Дата заключения')}>
                                    <Input disabled/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t('Вывод специалиста')}>
                                    <Input.TextArea/>
                                </Form.Item>
                            </Col>
                            <Col span={24}>
                                <Form.Item label={t('Регресс')}>
                                    <Input/>
                                </Form.Item>
                            </Col>
                        </Row>
                        <Flex className={'mt-6'}>
                            <Button onClick={() => (submitType.current = true)} className={'mr-3'} type="primary"
                                    htmlType={'submit'} name={'save'}>
                                {t('Сохранить дело')}
                            </Button>
                            <Button danger type={'primary'} onClick={() => navigate('/claims')}>
                                {t('Отменаs')}
                            </Button>
                        </Flex>
                    </Form>
                </Spin>

            </PageHeader>
        </>

    );
};

export default ClaimView;
