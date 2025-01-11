import BibleTimeline from "@/components/BibleTimeline";

const Timeline = () => {
  return (
    <div className="min-h-screen bg-bible-gray">
      <nav className="bg-bible-navy text-white py-4">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-xl font-bold">Linha do Tempo Bíblica</h1>
        </div>
      </nav>
      <main>
        <BibleTimeline />
      </main>
    </div>
  );
};

export default Timeline;