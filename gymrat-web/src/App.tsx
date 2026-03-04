import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from '@/app/AppContext';
import { AppLayout } from '@/layouts/AppLayout';
import { Home } from '@/pages/Home';
import { Profile } from '@/pages/Profile';
import { GenerateRoutine } from '@/pages/GenerateRoutine';
import { RoutineDetail } from '@/pages/RoutineDetail';
import { LogWorkout } from '@/pages/LogWorkout';
import { History } from '@/pages/History';
import { Records } from '@/pages/Records';
import { Progress } from '@/pages/Progress';
import { DevTools } from '@/pages/DevTools';

export function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="generate" element={<GenerateRoutine />} />
            <Route path="routines/:id" element={<RoutineDetail />} />
            <Route path="routines/:id/log" element={<LogWorkout />} />
            <Route path="history" element={<History />} />
            <Route path="records" element={<Records />} />
            <Route path="progress" element={<Progress />} />
            <Route path="dev" element={<DevTools />} />
          </Route>
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}
