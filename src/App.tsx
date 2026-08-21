import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import { AuthGuard } from '@/components/layout/AuthGuard';

// Public Pages (A)
import Landing from '@/pages/public/Landing';
import About from '@/pages/public/About';
import DramaMode from '@/pages/public/DramaMode';
import LegacyMode from '@/pages/public/LegacyMode';
import SponsoredLegacy from '@/pages/public/SponsoredLegacy';
import Recruit from '@/pages/public/Recruit';
import Enterprise from '@/pages/public/Enterprise';
import Works from '@/pages/public/Works';
import WorkDetail from '@/pages/public/WorkDetail';
import Login from '@/pages/public/Login';
import Pricing from '@/pages/public/Pricing';

// Creator Pages (B)
import CreatorDashboard from '@/pages/creator/CreatorDashboard';
import CreatorWorks from '@/pages/creator/CreatorWorks';
import ModeSelect from '@/pages/creator/ModeSelect';
import { DramaWorkflow } from '@/pages/creator/DramaWorkflow';
import LegacyWorkflow from '@/pages/creator/LegacyWorkflow';
import ScriptEditor from '@/pages/creator/ScriptEditor';
import Assets from '@/pages/creator/Assets';
import Storyboard from '@/pages/creator/Storyboard';
import Canvas from '@/pages/creator/Canvas';
import Interview from '@/pages/creator/Interview';
import SubmitReview from '@/pages/creator/SubmitReview';
import Credits from '@/pages/creator/Credits';
import ESGTier from '@/pages/creator/ESGTier';
import Notifications from '@/pages/creator/Notifications';

// Viewer Pages (C)
import ViewerHome from '@/pages/viewer/ViewerHome';
import DramaWall from '@/pages/viewer/DramaWall';
import VideoPlayer from '@/pages/viewer/VideoPlayer';
import Favorites from '@/pages/viewer/Favorites';
import History from '@/pages/viewer/History';

// Admin Pages (D)
import AdminOverview from '@/pages/admin/AdminOverview';
import ReviewQueue from '@/pages/admin/ReviewQueue';
import SingleReview from '@/pages/admin/SingleReview';
import UserManagement from '@/pages/admin/UserManagement';
import CreatorManagement from '@/pages/admin/CreatorManagement';
import ContentModeration from '@/pages/admin/ContentModeration';
import CreditEngine from '@/pages/admin/CreditEngine';
import BrandAds from '@/pages/admin/BrandAds';
import ESGSponsor from '@/pages/admin/ESGSponsor';
import EnterpriseLegacy from '@/pages/admin/EnterpriseLegacy';
import SponsoredLegacyAdmin from '@/pages/admin/SponsoredLegacyAdmin';
import Redlines from '@/pages/admin/Redlines';
import AIAdapters from '@/pages/admin/AIAdapters';
import Analytics from '@/pages/admin/Analytics';
import SystemSettings from '@/pages/admin/SystemSettings';

// Sponsor
import SponsorDashboard from '@/pages/sponsor/SponsorDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public Routes (A) ── */}
        <Route path="/" element={<Landing />} />
        <Route path="/about" element={<About />} />
        <Route path="/drama-mode" element={<DramaMode />} />
        <Route path="/legacy-mode" element={<LegacyMode />} />
        <Route path="/sponsored-legacy" element={<SponsoredLegacy />} />
        <Route path="/recruit" element={<Recruit />} />
        <Route path="/enterprise" element={<Enterprise />} />
        <Route path="/works" element={<Works />} />
        <Route path="/works/:id" element={<WorkDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pricing" element={<Pricing />} />

        {/* ── Creator Routes (B) — requires creator role ── */}
        <Route element={<AuthGuard allowedRoles={['creator', 'admin']} />}>
          <Route path="/creator" element={<CreatorDashboard />} />
          <Route path="/creator/works" element={<CreatorWorks />} />
          <Route path="/creator/new" element={<ModeSelect />} />
          <Route path="/creator/drama/:step?" element={<DramaWorkflow />} />
          <Route path="/creator/legacy/:step?" element={<LegacyWorkflow />} />
          <Route path="/creator/script/:id?" element={<ScriptEditor />} />
          <Route path="/creator/assets/:id?" element={<Assets />} />
          <Route path="/creator/storyboard/:id?" element={<Storyboard />} />
          <Route path="/creator/canvas/:id?" element={<Canvas />} />
          <Route path="/creator/interview/:id?" element={<Interview />} />
          <Route path="/creator/submit/:id?" element={<SubmitReview />} />
          <Route path="/creator/credits" element={<Credits />} />
          <Route path="/creator/esg" element={<ESGTier />} />
          <Route path="/creator/notifications" element={<Notifications />} />
        </Route>

        {/* ── Viewer Routes (C) — requires elder role ── */}
        <Route element={<AuthGuard allowedRoles={['elder', 'admin']} />}>
          <Route path="/viewer" element={<ViewerHome />} />
          <Route path="/viewer/drama" element={<DramaWall />} />
          <Route path="/viewer/watch/:id" element={<VideoPlayer />} />
          <Route path="/viewer/favorites" element={<Favorites />} />
          <Route path="/viewer/history" element={<History />} />
        </Route>

        {/* ── Admin Routes (D) — requires admin role ── */}
        <Route element={<AuthGuard allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/queue" element={<ReviewQueue />} />
          <Route path="/admin/review/:id" element={<SingleReview />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/creators" element={<CreatorManagement />} />
          <Route path="/admin/moderation" element={<ContentModeration />} />
          <Route path="/admin/credits" element={<CreditEngine />} />
          <Route path="/admin/brands" element={<BrandAds />} />
          <Route path="/admin/esg" element={<ESGSponsor />} />
          <Route path="/admin/enterprise" element={<EnterpriseLegacy />} />
          <Route path="/admin/sponsored-legacy" element={<SponsoredLegacyAdmin />} />
          <Route path="/admin/redlines" element={<Redlines />} />
          <Route path="/admin/adapters" element={<AIAdapters />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
        </Route>

        {/* ── Sponsor Routes — requires sponsor role ── */}
        <Route element={<AuthGuard allowedRoles={['sponsor', 'admin']} />}>
          <Route path="/sponsor" element={<SponsorDashboard />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
