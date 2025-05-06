import Image from "next/image";
import Register from "../components/FormRegister";

export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold underline text-blue-500">
        Halaman Artikel - Manajemen Artikel
      </h1>
      <Register />
    </div>
  );
}
