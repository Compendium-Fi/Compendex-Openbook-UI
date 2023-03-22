import { useRouter } from 'next/router';

export async function getServerSideProps() {
  return {
    redirect: {
      destination: 'market/xfGvkmFh7MNfXQrDinNEtCcowS7JBt54rbahkwQWfzi',
      permanent: true,
    },
  };
}

function HomePage() {
  const router = useRouter();
 

 
  // The redirect will happen before this component is rendered, so this will never execute.
  return (
    <div>
      <h1>Index Page</h1>
      <button onClick={() => router.push('/market/xfGvkmFh7MNfXQrDinNEtCcowS7JBt54rbahkwQWfzi')}>
        Go to New Page
      </button>
    </div>
  );
}

export default HomePage;