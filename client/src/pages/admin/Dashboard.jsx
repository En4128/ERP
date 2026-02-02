import { useNavigate, Routes, Route, useLocation } from 'react-router-dom';
import Layout from '../../components/Layout';
import DashboardOverview from './DashboardOverview';
import ManageStudents from './ManageStudents';
import ManageFaculty from './ManageFaculty';
import AdminCourses from './Courses';
import ManagePlacements from './ManagePlacements';
import ManageTimetables from './ManageTimetables';
import Notifications from './Notifications';
import ManageFees from './ManageFees';

const AdminDashboard = () => {
    return (
        <Layout role="admin">
            <Routes>
                <Route index element={<DashboardOverview />} />
                <Route path="students" element={<ManageStudents />} />
                <Route path="faculty" element={<ManageFaculty />} />
                <Route path="courses" element={<AdminCourses />} />
                <Route path="placements" element={<ManagePlacements />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="timetables" element={<ManageTimetables />} />
                <Route path="fees" element={<ManageFees />} />
            </Routes>
        </Layout>
    );
};

export default AdminDashboard;
