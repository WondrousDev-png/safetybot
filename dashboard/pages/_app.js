import '../styles/globals.css';
import { SessionProvider } from 'next-auth/react';

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-gray-900 text-white font-sans">
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
}

export default MyApp;
