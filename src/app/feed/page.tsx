import Header from "@/components/Header";

export default function FeedPage() {
    return (
        <>
            <Header />
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-2xl font-bold">Bem-vindo ao Feed!</h1>
            <p className="mt-4">Aqui está o seu conteúdo personalizado.</p>
        </div>
      </>
    );
  }
  