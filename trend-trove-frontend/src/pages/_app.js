import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useEffect } from "react";
import { FilterProvider } from "@/context/filterContext";
import { Provider } from "react-redux";
import store from "../redux/store";
import '@/styles/globals.css';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from '../utils/createEmotionCache';
import { setupAxios } from '../utils/setupAxios';
import { useRouter } from "next/router";
import ChatBox from "@/components/modals/chatBox";
import Head from 'next/head';

const clientSideEmotionCache = createEmotionCache();
// hello
const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          minHeight: '100vh',
        },
        '*': {
          boxSizing: 'border-box',
        }
      }
    }
  }
});

export default function App({ Component, pageProps, emotionCache = clientSideEmotionCache }) {
  const router = useRouter()
  const isAdminRoute = router.pathname.startsWith('/admin');

  useEffect(() => {
    setupAxios();
    // Remove the server-side injected CSS
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Provider store={store}>
        <FilterProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <style jsx global>{`
              html,
              body {
                padding: 0;
                margin: 0;
                font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
                  Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
                  sans-serif;
                min-height: 100vh;
              }
              * {
                box-sizing: border-box;
              }
              a {
                color: inherit;
                text-decoration: none;
              }
            `}</style>
            <Component {...pageProps} />
            {!isAdminRoute && <ChatBox />}
          </ThemeProvider>
        </FilterProvider>
      </Provider>
    </CacheProvider>
  );
}


