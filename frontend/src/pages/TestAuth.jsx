import { useAuth } from "../contexts/AuthContext";

const TestAuth = () => {
  const { user, isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Auth Debug</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Loading:</strong> {loading ? "true" : "false"}
          </div>
          <div>
            <strong>Is Authenticated:</strong> {isAuthenticated ? "true" : "false"}
          </div>
          <div>
            <strong>User Object:</strong>
            <pre className="bg-gray-100 p-4 rounded mt-2 overflow-auto">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>
          <div>
            <strong>User Role:</strong> {user?.role || "Not set"}
          </div>
          <div>
            <strong>Role Type:</strong> {typeof user?.role}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAuth;