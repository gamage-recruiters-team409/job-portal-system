import { Route, Routes } from 'react-router-dom';

import FoundationPage from '../pages/FoundationPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

import AboutPage from '../features/help-support/pages/AboutPage.jsx';
import ContactPage from '../features/help-support/pages/ContactPage.jsx';
import FAQPage from '../features/help-support/pages/FAQPage.jsx';
import HelpPage from '../features/help-support/pages/HelpPage.jsx';
import SupportFormPage from '../features/help-support/pages/SupportFormPage.jsx';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<FoundationPage />} />

      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/help" element={<HelpPage />} />
      <Route path="/support" element={<SupportFormPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
