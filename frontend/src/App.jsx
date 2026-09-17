import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import Dashboard from "./pages/Dashboard";
import Navbar from "./components/Navbar";
import EventDetails from "./pages/EventDetails";
import MyEvents from "./pages/MyEvents";
import CreateEvent from "./pages/CreateEvent";
import EventRegistrations from "./pages/EventRegistrations";
import EditEvent from "./pages/EditEvent";
import ProtectedRoute from "./components/ProtectedRoute";
import Ticket from "./pages/Ticket";
import QRScanner from "./pages/QRScanner";
import Attendance from "./pages/Attendance";
function App() {
    return (
         <>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/events" element={<Events />} />
                <Route path="/dashboard" element={ <ProtectedRoute allowedRoles={["organiser", "admin"]}> <Dashboard /> </ProtectedRoute> } />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/my-events" element={ <ProtectedRoute> <MyEvents /> </ProtectedRoute> } />
                <Route path="/tickets/:id" element={ <ProtectedRoute> <Ticket /> </ProtectedRoute> } />
                <Route path="/dashboard" element={ <ProtectedRoute allowedRoles={["organiser", "admin"]}> <Dashboard /> </ProtectedRoute> } />
                <Route path="/create-event" element={ <ProtectedRoute allowedRoles={["organiser", "admin"]}> <CreateEvent /> </ProtectedRoute> } />
                <Route path="/dashboard/events/:id/registrations" element={ <ProtectedRoute allowedRoles={["organiser", "admin"]}> <EventRegistrations /> </ProtectedRoute> } />
                <Route path="/dashboard/events/:id/attendance" element={ <ProtectedRoute allowedRoles={["organiser", "admin"]}> <Attendance /> </ProtectedRoute> } />
                <Route path="/dashboard/events/:id/edit" element={ <ProtectedRoute allowedRoles={["organiser", "admin"]}> <EditEvent /> </ProtectedRoute> } />
                <Route path="/scanner/:eventId" element={ <ProtectedRoute allowedRoles={["organiser", "admin"]} > <QRScanner /> </ProtectedRoute> } />
                
            </Routes>
        </>
    );
}

export default App;