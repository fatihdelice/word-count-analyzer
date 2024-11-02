import { Html, Head, Main, NextScript } from "next/document";


export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <title>Word Count Analyzer</title>
        <meta name="description" content="Analyze the word count in your PDF and DOCX files with our powerful tool." />
        <meta name="keywords" content="word count, PDF, DOCX, text analysis, document analysis, word frequency, document editor, text statistics, readability, language processing, text extraction, writing tools, online word counter, file analysis" />
        <meta name="author" content="Fatih Delice" />
        <meta property="og:title" content="Word Count Analyzer" />
        <meta property="og:description" content="Analyze the word count in your PDF and DOCX files with our powerful tool." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
