import Header from "@/components/Header";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function FeedPage() {


    return (
        <>
            <Header />
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bem-vindo ao Feed!</h1>
                <p className="mt-4 text-gray-700 dark:text-gray-300">Aqui está o seu conteúdo personalizado.</p>
            </div>
        </>
    );
}
