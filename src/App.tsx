/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import ManagerDashboard from './components/ManagerDashboard';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800" id="takeaway_system_master_root">
      <ManagerDashboard />
    </div>
  );
}
