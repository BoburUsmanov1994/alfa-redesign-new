import React, {useState} from 'react';
import {PageHeader} from "@ant-design/pro-components";
import {useTranslation} from "react-i18next";
import {Button, Flex, Form, Steps} from "antd";
import StepOne from "../components/steps/StepOne";
import {useNavigate} from "react-router-dom";

const {Step} = Steps;

const ProductCreatePage = () => {
    const {t} = useTranslation();
    const navigate = useNavigate();
    const [current, setCurrent] = useState(0);
    const [formData, setFormData] = useState({});

    const [form] = Form.useForm();

    const steps = [
        {
            title: t("Добавление продукта"),
            content: (
                <>
                    <StepOne form={form}/>
                </>
            )
        },
        {
            title: t('Добавление параметров'),
            content: (
                <>
                </>
            )
        },
        {
            title: t("Калькуляция"),
            content: (
                <></>
            )
        },
        {
            title: t("Франшиза"),
            content: (
                <></>
            )
        },
        {
            title: t("Проверка данных"),
            content: (
                <></>
            )
        },
        {
            title: t("Подтверждение"),
            content: (
                <></>
            )
        }

    ];

    const next = async () => {
        try {
            if (current < steps.length - 1) {
                await form.validateFields();
                setFormData({
                    ...formData,
                    ...form.getFieldsValue()
                });
            }
            setCurrent(current + 1);
            if (current === steps.length - 1) {

            }
        } catch (err) {
            console.log("Validation Failed:", err);
        }
    };

    const prev = () => {
        setCurrent(current - 1);
    };

    const onFinish = async () => {

    };
    return (
        <>
            <PageHeader
                className={'p-0 mb-4'}
                title={t('Добавить продукт')}
            />
            <Steps current={current} className="mb-5">
                {steps.map((item) => (
                    <Step key={item.title} title={item.title}/>
                ))}
            </Steps>
            <Form
                name="product"
                form={form}
                layout="vertical"
                initialValues={formData}
                onFinish={onFinish}
            >

                {steps[current].content}

                <Flex className={'mt-6'}>
                    {current === 0 && (
                        <Button danger type={'primary'} className={'mr-2'} onClick={() => navigate('/products')}>
                            {t('Отменить')}
                        </Button>
                    )}
                    {current > 0 && (
                        <Button danger className={'mx-2'} onClick={() => prev()}>
                            {t('Назад')}
                        </Button>
                    )}
                    {current < steps.length - 1 && (
                        <Button type="primary" onClick={() => next()}>
                            {t('Продолжить')}
                        </Button>
                    )}
                    {current === steps.length - 1 && (
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    )}
                </Flex>
            </Form>
        </>

    );
};

export default ProductCreatePage;
