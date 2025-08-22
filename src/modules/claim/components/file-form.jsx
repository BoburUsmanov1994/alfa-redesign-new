import React, {useState} from 'react';
import {Button, Col, Divider, Drawer, Form, notification, Row, Table, Upload} from "antd";
import {DeleteOutlined, InboxOutlined, PlusOutlined} from "@ant-design/icons";
import {useDeleteQuery} from "../../../hooks/api";
import {useTranslation} from "react-i18next";
import {request} from "../../../services/api";
import {URLS} from "../../../constants/url";
import {get} from "lodash";

const {Dragger} = Upload;

const FileForm = ({
                      files = [],
                      setFiles,
                  }) => {
    const {t} = useTranslation();
    const [open, setOpen] = useState(false);
    const {mutate: deleteRequest, isPending: isPendingDelete} = useDeleteQuery({})
    const customUpload = async ({file, onSuccess, onError}) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await request.post('api/file', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });

            const _file = res?.data;
            onSuccess(_file);
            notification['success']({
                message: 'Успешно'
            })
        } catch (err) {
            notification['error']({
                message: err?.response?.data?.message || 'Ошибка'
            })
            onError(err);
        }
    };

    const handleChange = ({file}) => {
        if (file.status === 'done') {
            setFiles(prev => [...prev, file.response]);
            setOpen(false);
        }
    };
    const removeFile = (_file) => {
        setFiles(prev => prev.filter(item => item._id !== _file._id));
        deleteRequest({url: `${URLS.file}/${get(_file, '_id')}`}, {
            onSuccess: () => {

            }
        })
    }
    console.log('files', files)
    return (
        <>
            <Row gutter={16} align="middle">
                <Col span={20}>
                    <Divider orientation={'left'}>{t('Подтверждающие фото- и видео-материалы:')}</Divider>
                </Col>

                <Col span={4} className={'text-right'}>
                    <Form.Item label={' '}
                    >
                        <Button icon={<PlusOutlined/>} onClick={() => setOpen(true)}>
                            {t('Добавить файл')}
                        </Button>
                    </Form.Item>
                </Col>
                <Col span={24}>
                    <Table
                        loading={isPendingDelete}
                        dataSource={files}
                        columns={[
                            {
                                title: t('ID'),
                                dataIndex: 'id',
                            },
                            {
                                title: t('URL-адрес файла'),
                                dataIndex: 'url',
                            },
                            {
                                title: t('Действия'),
                                dataIndex: '_id',
                                render: (text, record) => <Button onClick={() => removeFile(record)} danger
                                                                  shape="circle" icon={<DeleteOutlined/>}/>
                            }
                        ]}
                    />
                </Col>
            </Row>
            <Drawer title={t('Добавить файл')} open={open} onClose={() => setOpen(false)}>

                <div className={'h-60'}>
                    <Dragger

                        name={'file'}
                        multiple={false}
                        onChange={handleChange}
                        customRequest={customUpload}
                    >
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined/>
                        </p>
                        <p className="ant-upload-text">{t('Щелкните или перетащите файл в эту область для загрузки.')}</p>

                    </Dragger>
                </div>
            </Drawer>
        </>
    );
};

export default FileForm;
