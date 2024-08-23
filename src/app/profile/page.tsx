import Header from '../../components/Header';

export default function ProfilePage() {
  return (
    <div>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white">
        <h1 className="text-2xl font-bold">Perfil do Usuário</h1>
        <p className="mt-4">Informações do usuário serão exibidas aqui.</p>
      </div>
    </div>
  );
}
