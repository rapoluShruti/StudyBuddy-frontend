// import { Routes, Route } from "react-router-dom";
// import Login from "./pages/Login";
// import Register from "./pages/Register";
// import LayoutWithSidebar from "./components/LayoutWithSidebar";
// import Home from "./pages/Home";
// import History from "./pages/History";
// import NewPlan from "./pages/NewPlan";
// import GoPro from "./pages/GoPro";
// import Navbar from "./components/Navbar";
// import Layout from "./components/Layout";
// import StudyPlanGenerator from "./components/StudyPlanGenerator";

// export default function App() {
//   return (
//     <Layout>
//       <Routes>
//         {/* Public routes */}
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/" element={<Home />} />
//         {/* Protected routes */}
//         <Route element={<LayoutWithSidebar />}>
//           <Route path="/study" element={<StudyPlanGenerator />} />
//           <Route path="/new-plan" element={<NewPlan />} />
//           <Route path="/history" element={<History />} />
//           <Route path="/new-plan" element={<NewPlan />} />
//           <Route path="/go-pro" element={<GoPro />} />
//         </Route>
//       </Routes>
//     </Layout>
//   );
// }
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LayoutWithSidebar from "./components/LayoutWithSidebar";
import Home from "./pages/Home";
import History from "./pages/History";
import NewPlan from "./pages/NewPlan";
import GoPro from "./pages/GoPro";
import Navbar from "./components/Navbar";
import Layout from "./components/Layout";
import StudyBuddy from "./components/StuBuddy";

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        {/* Protected routes */}
        <Route element={<LayoutWithSidebar />}>
          <Route path="/study" element={<StudyBuddy />} />
          <Route path="/new-plan" element={<NewPlan />} />
          <Route path="/history" element={<History />} />
          <Route path="/new-plan" element={<NewPlan />} />
          <Route path="/go-pro" element={<GoPro />} />
        </Route>
      </Routes>
    </Layout>
  );
}
