import React, {useEffect} from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    ProductOutlined,
    FileOutlined,
    InsuranceOutlined,
    CalculatorOutlined,
    CheckSquareOutlined,
    TeamOutlined,
    IdcardOutlined,
    BankOutlined,
    UserSwitchOutlined
} from '@ant-design/icons';
import {Button, Flex, Layout, Menu, Modal, Spin, theme, Tooltip} from 'antd';
import {useLocation, useNavigate} from 'react-router-dom';
import Logo from "../../components/logo";
import AlfaSvg from './../../assets/images/alfa.svg'
import Mode from "../../components/mode";
import {useSettingsStore, useStore} from "../../store";
import {KEYS} from "../../constants/key";
import {URLS} from "../../constants/url";
import {isNil} from "lodash/lang";
import {useGetAllQuery} from "../../hooks/api";
import {get, includes} from "lodash";
import FullScreen from "../../components/full-screen";
import {useTranslation} from "react-i18next";
import {LogoutOutlined, UserOutlined, ExclamationCircleOutlined} from "@ant-design/icons"
import Lang from "../../components/lang";
import i18n from './../../services/i18n';

const {Header, Sider, Content} = Layout;


function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label: i18n.t(label)
    };
}

const getItems = (role) => [
    includes(['admin'], role) && getItem('Продукты', '/products', <ProductOutlined/>, [
        getItem('Все продукты', '/products'),
        getItem('Группы продуктов', '/products/product-groups'),
        getItem('Подгруппы продуктов', '/products/product-subgroups'),
        getItem('Статус продукта', '/products/product-status'),
    ]),
    includes(['admin'], role) && getItem('Соглашения', '/agreements', <FileOutlined/>),
    includes(['admin'], role) && getItem('Клиенты', '/clients', <TeamOutlined/>, [
        getItem('Физические лица', '/clients/physical'),
        getItem('Юридические лица', '/clients/juridical'),
        getItem('Тип человека', '/clients/person-type'),
    ]),
    includes(['admin'], role) && getItem('Агенты', '/agents', <UserSwitchOutlined/>, [
        getItem('Страховые агенты', '/agents/insurance-agents'),
        getItem('Типы агентов', '/agents/types'),
        getItem('Роли агента', '/agents/roles'),
        getItem('Статус агента', '/agents/status'),
        getItem('Банк', '/agents/bank'),
        getItem('Комиссия и РПМ', '/agents/commission'),
        getItem('Подготовка актов выполненных работ', '/agents/report'),
        getItem('Управление актами выполненных работ', '/agents/report-control'),
    ]),
    includes(['admin'], role) && getItem('Аккаунты', '/accounts', <IdcardOutlined/>, [
        getItem('Пользователи', '/accounts/list'),
        getItem('Роль аккаунта', '/accounts/role'),
        getItem('Статус аккаунта', '/accounts/status'),
    ]),
    includes(['admin'], role) && getItem('Филиалы и сотрудники', '/branches', <BankOutlined/>, [
        getItem('Филиалы', '/branches/list'),
        getItem('Сотрудники', '/branches/employees'),
        getItem('Должность', '/branches/position'),
        getItem('Уровень филиала', '/branches/branch-level'),
        getItem('Статус отделения', '/branches/branch-status'),
        getItem('Банк реквизиты филиалов', '/branches/branch-settings'),
    ]),
    includes(['admin'], role) && getItem('Бухгалтерия', '/accounting', <CalculatorOutlined/>, [
        getItem('Импорт платёжных документов', '/accounting/import-payment-documents'),
        getItem('Распределение', '/accounting/distribtion'),
        getItem('Тип распределения', '/accounting/distribution-type'),
        getItem('К полису', '/accounting/policy'),
        getItem('Счета', '/accounting/account'),
        getItem('Журналы транзакций', '/accounting/transaction-logs'),
    ]),
    includes(['admin'], role) && getItem('Индоссамент', '/endorsement', <CheckSquareOutlined/>),
    includes(['admin'], role) && getItem('Страховой', '/insurance', <InsuranceOutlined/>, [
        getItem('ОСГОР', '/insurance/osgor'),
        getItem('ОСГОП', '/insurance/osgop'),
        getItem('ОСАГО', '/insurance/osago'),
        getItem('СМР', '/insurance/smr'),
        getItem('Распределение СМР', '/insurance/smr/distribute'),
        getItem('Страхование кредитов НБУ', '/insurance/nbu-credits'),
    ]),
    includes(['claim-admin', 'claim-user', 'sek-member'], role) && getItem('АИС ДУСП', '/claims',
        <InsuranceOutlined/>, [
            includes(['claim-admin', 'claim-user'], role) && getItem('Претензионный портфель', '/claims'),
            includes(['sek-member'], role) && getItem('Журнал СЭК', '/claims/jurnal'),
        ]),
];


const Index = ({children}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const {t} = useTranslation()
    const {collapsed, toggleCollapsed, token} = useSettingsStore()
    const {setUser, user} = useStore()
    const [modal, contextHolder] = Modal.useModal();

    const {
        token: {colorBgContainer, borderRadiusLG},
    } = theme.useToken();

    const {data, isLoading} = useGetAllQuery({
        key: KEYS.getMe,
        url: URLS.getMe,
        hideErrorMsg: true,
        params: {},
        enabled: !isNil(token),
    })

    const confirm = () => {
        modal.confirm({
            title: t('Вы уверены, что хотите выйти?'),
            icon: <ExclamationCircleOutlined/>,
            okText: t('Да'),
            cancelText: t('Нет'),
            onOk() {
                localStorage.clear()
                window.location.reload()
            }
        });
    };
    useEffect(() => {
        if (data) {
            setUser(get(data, 'data'))
        }
    }, [data]);

    if (isLoading) {
        return <Spin fullscreen spinning={isLoading}/>
    }

    return (
        <Layout style={{minHeight: '100vh'}}>
            <Sider style={{
                position: 'sticky',
                top: 0,
                alignSelf: 'flex-start',
                height: '100vh',
                overflowY: 'auto'
            }} trigger={null} collapsible collapsed={collapsed} width={225}>
                <Logo/>
                <Menu onClick={({key}) => navigate(key)} theme="dark" defaultSelectedKeys={[location?.pathname]}
                      mode="inline" items={getItems(get(user, 'role.name'))}/>
                <img className={'absolute bottom-0 right-0 -z-10'} src={AlfaSvg} alt="alfa"/>
            </Sider>
            <Layout>
                <Header className={'justify-between w-full flex p-0 pr-6 items-center'}
                        style={{background: colorBgContainer}}>
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined/> : <MenuFoldOutlined/>}
                        onClick={() => toggleCollapsed(!collapsed)}
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64,
                        }}
                    />
                    <Flex align={'center'} gap={12}>
                        {user && <Button type={'link'} icon={<UserOutlined/>} className={'font-medium'}>
                            {get(user, 'employee.fullname', get(user, 'username'))}
                        </Button>}
                        <FullScreen/>
                        <Mode/>
                        <Lang/>
                        <Tooltip title={t('Выйти')}>
                            <Button className={'mt-1.5'} size={'large'} onClick={confirm} type={'link'} danger
                                    icon={<LogoutOutlined style={{fontSize: '24px'}}/>}
                            />
                        </Tooltip>
                    </Flex>
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 12,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    {children}
                    {contextHolder}
                </Content>
            </Layout>
        </Layout>
    );
};
export default Index;
