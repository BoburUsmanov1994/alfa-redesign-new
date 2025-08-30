import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import MainLayout from '../layouts/main'
import AuthLayout from '../layouts/auth'
import {AuthProvider} from "../services/auth/auth";
import LoginPage from "../modules/auth/pages/LoginPage";
import PrivateRoute from "../services/auth/PrivateRoute";
import AgreementsPage from "../modules/agreement/pages/AgreementsPage";
import ProductsPage from "../modules/product/pages/ProductsPage";
import ProductGroupsPage from "../modules/product/pages/ProductGroupsPage";
import ProductSubGroupsPage from "../modules/product/pages/ProductSubGroupsPage";
import ProductStatusPage from "../modules/product/pages/ProductStatusPage";
import ProductCreatePage from "../modules/product/pages/ProductCreatePage";
import PhysicalClientsPage from "../modules/client/pages/PhysicalClientsPage";
import JuridicalClientsPage from "../modules/client/pages/JuridicalClientsPage";
import ClientTypePage from "../modules/client/pages/ClientTypePage";
import OsgorListPage from "../modules/insurance/pages/OsgorListPage";
import OsgopListPage from "../modules/insurance/pages/OsgopListPage";
import OsagoListPage from "../modules/insurance/pages/OsgagoListPage";
import SmrListPage from "../modules/insurance/pages/SmrListPage";
import NbuListPage from "../modules/insurance/pages/NbuListPage";
import SmrDistributePage from "../modules/insurance/pages/SmrDistributePage";
import DistributionPage from "../modules/accounting/pages/DistributionPage";
import DistributionTypePage from "../modules/accounting/pages/DistributionTypePage";
import EndorsementPage from "../modules/bco/pages/EndorsementPage";
import AccountsPage from "../modules/account/pages/AccountsPage";
import RolesPage from "../modules/account/pages/RolesPage";
import AccountStatusPage from "../modules/account/pages/AccountStatusPage";
import AccountingPage from "../modules/accounting/pages/AccountingPage";
import TransactionLogsPage from "../modules/accounting/pages/TransactionLogsPage";
import BranchesPage from "../modules/branch/pages/BranchesPage";
import EmployeesPage from "../modules/branch/pages/EmployeesPage";
import PositionPage from "../modules/branch/pages/PositionPage";
import BranchLevelPage from "../modules/branch/pages/BranchLevelPage";
import BranchStatusPage from "../modules/branch/pages/BranchStatusPage";
import BranchSettingsPage from "../modules/branch/pages/BranchSettingsPage";
import AgentsPage from "../modules/agent/pages/AgentsPage";
import AgentTypePage from "../modules/agent/pages/AgentTypePage";
import AgentStatusPage from "../modules/agent/pages/AgentStatusPage";
import AgentRolePage from "../modules/agent/pages/AgentRolePage";
import BankPage from "../modules/agent/pages/BankPage";
import AgentCommissionPage from "../modules/agent/pages/AgentCommissionPage";
import AgreementCreatePage from "../modules/agreement/pages/AgreementCreatePage";
import ProductCreatePage_ from "../modules/product/pages/ProductCreatePage_";
import ClaimListPage from "../modules/claim/pages/ClaimListPage";
import ClaimCreatePage from "../modules/claim/pages/ClaimCreatePage";
import ClaimViewPage from "../modules/claim/pages/ClaimViewPage";
import ClaimEditPage from "../modules/claim/pages/ClaimEditPage";
import ClaimJurnalPage from "../modules/claim/pages/ClaimJurnalPage";
import ClaimJurnalViewPage from "../modules/claim/pages/ClaimJurnalViewPage";

const Index = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<AuthLayout>
                        <LoginPage/>
                    </AuthLayout>}/>
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ProductsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/products"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ProductsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/products/product-groups"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ProductGroupsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/products/product-subgroups"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ProductSubGroupsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/products/product-status"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ProductStatusPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/products/create"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ProductCreatePage_/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agreements"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AgreementsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agreements/create"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AgreementCreatePage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/clients/physical"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <PhysicalClientsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/clients/juridical"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <JuridicalClientsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/clients/person-type"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ClientTypePage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/insurance/osgor"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <OsgorListPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/insurance/osgop"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <OsgopListPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/insurance/osago"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <OsagoListPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/insurance/smr"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <SmrListPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/insurance/smr/distribute"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <SmrDistributePage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/insurance/nbu-credits"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <NbuListPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/accounting/distribtion"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <DistributionPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/accounting/distribution-type"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <DistributionTypePage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/accounting/account"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AccountingPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/accounting/transaction-logs"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <TransactionLogsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/endorsement"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <EndorsementPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/accounts/list"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AccountsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/accounts/role"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <RolesPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/accounts/status"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AccountStatusPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/branches/list"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <BranchesPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/branches/employees"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <EmployeesPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/branches/position"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <PositionPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/branches/branch-level"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <BranchLevelPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/branches/branch-status"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <BranchStatusPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/branches/branch-settings"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <BranchSettingsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agents/insurance-agents"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AgentsPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agents/types"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AgentTypePage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agents/status"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AgentStatusPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agents/roles"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AgentRolePage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agents/bank"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <BankPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/agents/commission"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <AgentCommissionPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/claims"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ClaimListPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/claims/create"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ClaimCreatePage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/claims/view/:claimNumber"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ClaimViewPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/claims/edit/:claimNumber"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ClaimEditPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/claims/jurnal"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ClaimJurnalPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/claims/jurnal/view/:claimNumber"
                        element={
                            <PrivateRoute>
                                <MainLayout>
                                    <ClaimJurnalViewPage/>
                                </MainLayout>
                            </PrivateRoute>
                        }
                    />
                    <Route path={"/"} element={<Navigate to={'/claims'} replace/>}/>
                    <Route path={"*"} element={<Navigate to={'/'} replace/>}/>
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default Index;
