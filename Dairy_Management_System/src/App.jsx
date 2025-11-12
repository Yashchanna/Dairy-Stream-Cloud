import React from 'react'
import 'bootstrap/dist/css/bootstrap.min.css';
import AddNewCustomerForm from './components/AddNewCustomerForm';
import { Route, Routes } from 'react-router-dom';
import AddNewAgentForm from './components/AddNewAgentForm';
import DairyCustomerDashboard from './components/DairyCustomerDashboard';
import AdminDashboard from './components/AdminDashboard';
import CustomerLogin from './components/CustomerLogin';
import CustomerRegister from './components/CustomerRegister';
import CustomerDashboard from './components/CustomerDashboard';
function App() {
  return (
    <Routes>
      <Route path='/' element={<CustomerLogin></CustomerLogin>}></Route>
      <Route path='/register' element={<CustomerRegister></CustomerRegister>}></Route>
      <Route path='/customer-dashboard' element={<CustomerDashboard></CustomerDashboard>}></Route>
      <Route path='admin/adminDashboard' element={<AdminDashboard></AdminDashboard>}></Route>
      <Route path='admin/addCustomer' element={<AddNewCustomerForm></AddNewCustomerForm>}></Route>

      <Route path='admin/addAgent' element={<AddNewAgentForm></AddNewAgentForm>}></Route>
      <Route path='/customerDashbord' element={<DairyCustomerDashboard></DairyCustomerDashboard>}></Route>

    </Routes>
   
)
}

export default App