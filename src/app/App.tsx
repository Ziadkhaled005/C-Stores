import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { useAuthStore } from "./store";

export default function App() {
    const initializeAuth = useAuthStore((s) => s.initializeAuth);

    useEffect(() => {
        void initializeAuth();
    }, [initializeAuth]);

    return <RouterProvider router={router} />;
}
