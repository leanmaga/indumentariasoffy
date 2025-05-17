import Link from "next/link";

const ButtonContact = () => {
  return (
    <div>
      <Link
        href="/contact"
        className="cursor-pointer btn-drop bg-black group inline-flex items-center border-2 border-white hover:border-black text-white px-8 py-4 font-medium uppercase tracking-wider hover:text-black transition-all duration-300"
      >
        <span className="flex items-center">Contáctanos</span>
      </Link>
    </div>
  );
};

export default ButtonContact;
