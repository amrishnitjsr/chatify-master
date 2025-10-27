import { Outlet } from "react-router";
import Navbar from "./Navbar";

const AuthenticatedLayout = () => {
    return (
        <div className="min-h-screen bg-slate-900">
            {/* DECORATORS - GRID BG & GLOW SHAPES */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
            <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
            <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

            {/* Navigation */}
            <Navbar />

            {/* Main Content */}
            <div className="relative z-10">
                <Outlet />
            </div>
        </div>
    );
};

export default AuthenticatedLayout;