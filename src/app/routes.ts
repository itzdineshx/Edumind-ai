import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { PDFSmartSearch } from "./pages/PDFSmartSearch";
import { LectureNotes } from "./pages/LectureNotes";
import { QuizGenerator } from "./pages/QuizGenerator";
import { SelfTest } from "./pages/SelfTest";
import { TamilNaduSyllabus } from "./pages/TamilNaduSyllabus";
import { Login } from "./pages/Login";
import { StudentDashboard } from "./pages/StudentDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      {
        path: "login",
        Component: Login,
      },
      {
        path: "student-dashboard",
        Component: StudentDashboard,
      },
      {
        path: "admin-dashboard",
        Component: AdminDashboard,
      },
      {
        path: "dashboard",
        Component: Dashboard,
      },
      {
        path: "dashboard/pdf-search",
        Component: PDFSmartSearch,
      },
      {
        path: "dashboard/lecture-notes",
        Component: LectureNotes,
      },
      {
        path: "dashboard/quiz-generator",
        Component: QuizGenerator,
      },
      {
        path: "dashboard/self-test",
        Component: SelfTest,
      },
      {
        path: "dashboard/syllabus",
        Component: TamilNaduSyllabus,
      },
    ],
  },
]);
