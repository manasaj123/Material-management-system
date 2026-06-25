import { Routes, Route } from "react-router-dom";
import QCDashboardPage from "./pages/QCDashboardPage";
import MasterInspectionPage from "./pages/MasterInspectionPage";
import InspectionMethodPage from "./pages/InspectionMethodPage";
import SamplingProcedurePage from "./pages/SamplingProcedurePage";
import InspectionPlanPage from "./pages/InspectionPlanPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<QCDashboardPage />} />
      <Route path="/master-inspections" element={<MasterInspectionPage />} />
      <Route path="/inspection-methods" element={<InspectionMethodPage />} />
      <Route path="/sampling-procedures" element={<SamplingProcedurePage />} />
      <Route path="/inspection-plans" element={<InspectionPlanPage />} />
    </Routes>
  );
}

export default App;