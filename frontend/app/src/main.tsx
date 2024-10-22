import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client';
import { StrictMode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import superjson from 'superjson';
import App from './App';
import './index.css';
import type { LoginCredentials } from './Login';
import Login from './Login';
import { trpc } from './trpc';
import { UserProvider } from './UserContext';
import config from './config'

const wsClient = createWSClient({ url: config.trpcBackendUrl });

const queryClient = new QueryClient();

const AppWrapper = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [trpcClient, setTrpcClient] = useState<any>(null);

  const createTrpcClient = (token?: string | null) => {
    return trpc.createClient({
      links: [
        splitLink({
          condition(op) {
            return op.type === 'subscription';
          },
          true: wsLink({ client: wsClient }),
          false: httpBatchLink({
            url: config.trpcBackendUrl,
            headers: () => {
              return token ? { Authorization: `Bearer ${token}` } : {};
            },
          }),
        }),
      ],
      transformer: superjson,
    });
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }

    const newTrpcClient = createTrpcClient(token);
    setTrpcClient(newTrpcClient);
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      const response = await fetch(`${config.apiURL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        setIsAuthenticated(true);

        const newTrpcClient = createTrpcClient(data.token);
        setTrpcClient(newTrpcClient);
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  if (!trpcClient) {
    return <div>Loading...</div>;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <UserProvider isAuthenticated={isAuthenticated}>
        <Router>
          <Routes>
            <Route
              path="/login"
              element={
                isAuthenticated ?
                <Navigate to="/" replace /> :
                <Login onLogin={handleLogin} />
              }
            />
            <Route
              path="/"
              element={
                isAuthenticated ?
                <App /> :
                <Navigate to="/login" replace />
              }
            />
          </Routes>
        </Router>
        </UserProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
};


const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
);
