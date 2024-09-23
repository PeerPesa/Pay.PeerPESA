import { FC, ReactNode } from "react";
import Footer from "./Footer";
import Header from "./Header";

interface Props {
    children: ReactNode;
}
const Layout: FC<Props> = ({ children }) => {
    return (
        <>
            <div className="flex flex-col min-h-screen bg-gray-100 font-harmony">
                <Header />
                <div className="mx-auto space-y-8 max-w-7xl sm:px-4 md:px-6 lg:px-8">
                    {children}
                </div>
                <Footer />
            </div>
        </>
    );
};

export default Layout;
