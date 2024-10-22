const apiURL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const trpcRoute = import.meta.env.VITE_TRPC_ROUTE || "trpc";

const config = {
  apiURL,
  trpcRoute,
  trpcBackendUrl: `${apiURL}/${trpcRoute}`,
};

export default config;
