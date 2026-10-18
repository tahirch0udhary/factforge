import { Route, Routes } from "react-router-dom";
import MainLayout from "./component/layout/MainLayout";
import HomePage from "./pages/HomePage";
import VerifyPage from "./pages/VerifyPage";
import HistoryPage from "./pages/HistoryPage";
import ReviewQueuePage from "./pages/ReviewQueuePage";
import StatsPage from "./pages/StatsPage";
import AboutPage from "./pages/AboutPage";
import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/review" element={<ReviewQueuePage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
