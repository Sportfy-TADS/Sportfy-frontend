import Header from '@/components/Header';

export default function HealthWarningPage() {
  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#202024] transition-colors p-4">
        <div className="w-full max-w-md bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-6 m-4 sm:w-4/5 md:w-3/4 lg:w-1/2 xl:w-1/3 transition-colors">
          <h1 className="text-2xl font-bold text-center text-emerald-600 dark:text-emerald-400 mb-6">
            Aviso de Saúde
          </h1>

          <p className="text-center text-gray-700 dark:text-gray-300 mb-4">
            Aqui estão algumas informações importantes sobre as casas de saúde da UFPR.
          </p>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
              Casa de Saúde 1
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Endereço: Rua Exemplo, 123<br />
              Telefone: (41) 1234-5678<br />
              Horário de Funcionamento: 08:00 - 18:00
            </p>
          </div>

          <div className="mb-4">
            <h2 className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
              Casa de Saúde 2
            </h2>
            <p className="text-gray-700 dark:text-gray-300">
              Endereço: Avenida Exemplo, 456<br />
              Telefone: (41) 8765-4321<br />
              Horário de Funcionamento: 07:00 - 19:00
            </p>
          </div>

          {/* Adicione mais casas de saúde conforme necessário */}
        </div>
      </div>
    </>
  );
}
