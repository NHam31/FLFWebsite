import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import ConfirmEmail from './pages/ConfirmEmail'
import EditionDetail from './pages/EditionDetail'
import ActivityDetail from './pages/ActivityDetail'
import NewsPage from './pages/NewsPage'
import CandidateQuestionnaire from './pages/CandidateQuestionnaire'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route path="/edition/:id" element={<EditionDetail />} />
      <Route path="/activities/:slug" element={<ActivityDetail />} />
      <Route path="/news" element={<NewsPage />} />
      <Route path="/candidate-questionnaire" element={<CandidateQuestionnaire />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
