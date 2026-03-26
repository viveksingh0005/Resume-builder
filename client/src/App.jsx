import { BrowserRouter, Routes, Route } from "react-router-dom";
import TemplatesPage from "./pages/TemplatePage";
import TemplatePreview from "./pages/TemplatePreview";
import ATSResumeBuilder from "./pages/ATSResumeEditor";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TemplatesPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/template/:id" element={<TemplatePreview />} />
        <Route path="/editor/:id" element={<ATSResumeBuilder />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;