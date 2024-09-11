import Head from 'next/head';

interface DynamicHeadProps {
  title?: string;
}

export default function DynamicHead({ title }: DynamicHeadProps) {
  const defaultTitle = 'Sportfy'; // Nome padrão do sistema
  const pageTitle = title ? `${title} | ${defaultTitle}` : defaultTitle;

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content="Sportfy - Sistema de gerenciamento esportivo." />
    </Head>
  );
}
