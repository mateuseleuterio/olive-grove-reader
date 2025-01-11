import BibleReader from "@/components/BibleReader";

const Index = () => {
  return (
    <div className="min-h-screen bg-bible-gray">
      <nav className="bg-bible-navy text-white py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Bible App</h1>
        </div>
      </nav>
      <main>
        <BibleReader />
      </main>
    </div>
  );
};

export default Index;