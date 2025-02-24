import "./styles.css";

function Input({ index }: { index: number }) {
  return (
    <input
      type="text"
      className="w-10 h-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-white text-white text-2xl text-center bg-transparent border-2 border-white"
      maxLength={1}
      aria-label={`Input ${index}`}
    />
  );
}

export default function App() {
  return (
    <main className="h-full flex flex-col items-center justify-center gap-10">
      <p className="text-white text-2xl">Enter your OTP</p>
      <div className="flex flex-row gap-4">
        {[...Array(6)].map((_, index) => (
          <Input key={index} index={index} />
        ))}
      </div>
    </main>
  );
}
