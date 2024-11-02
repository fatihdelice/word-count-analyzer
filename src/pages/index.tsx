import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WordCount from "@/components/WordCount";


export default function Home() {


  return (
    <div className="container grid place-items-center">
      <Header />
      <main className="w-full mb-52">
        <WordCount />
      </main>
      <Footer />
    </div>
  );
}
