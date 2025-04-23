import { Route, Routes } from 'react-router-dom';
import { Admin } from '@payloadcms/admin';
import config from './payload.config';
import FrontPage from './components/FrontPage';

const App = () => (
  <Routes>
    <Route path="/admin" element={<Admin config={config} />} />
    <Route path="/" element={<FrontPage />} />
  </Routes>
);

export default App;