/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LanguageProvider } from './contexts/LanguageContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ToastContainer } from './components/ui/Toast';

// Modules
import { PostAnalyzer } from './modules/PostAnalyzer';
import { ContentPlanner } from './modules/ContentPlanner';
import { ProfileAnalyzer } from './modules/ProfileAnalyzer';
import { SmartAssistant } from './modules/SmartAssistant';

export default function App() {
  return (
    <LanguageProvider>
      <DashboardLayout>
        {(activeModule) => (
          <>
            {activeModule === 'postAnalyzer' && <PostAnalyzer />}
            {activeModule === 'contentPlanner' && <ContentPlanner />}
            {activeModule === 'profileAnalyzer' && <ProfileAnalyzer />}
            {activeModule === 'smartAssistant' && <SmartAssistant />}
          </>
        )}
      </DashboardLayout>
      <ToastContainer />
    </LanguageProvider>
  );
}
