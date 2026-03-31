import Header from "./components/Header";
import Footer from "./components/Footer";
import ScenarioForm from "./components/ScenarioForm";

export default function Home() {
  return (
    <>
      <Header />
      <main className="main-content">
        <ScenarioForm />
      </main>
      <Footer />
    </>
  );
}
