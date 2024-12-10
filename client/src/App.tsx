import { Switch, Route, useLocation } from "wouter";
import { useUser } from "./hooks/use-user";
import DashboardPage from "./pages/DashboardPage";
import ClassroomPage from "./pages/ClassroomPage";
import AssignmentPage from "./pages/AssignmentPage";
import AuthPage from "./pages/AuthPage";
import { Loader2 } from "lucide-react";

function App() {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <AuthPage />;
  }

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/course/:id" component={ClassroomPage} />
      <Route path="/assignment/:id" component={AssignmentPage} />
      <Route>404 Page Not Found</Route>
    </Switch>
  );
}

export default App;
