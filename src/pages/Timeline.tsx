import BibleTimeline from "@/components/BibleTimeline";

const Timeline = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-serif font-bold text-bible-navy mb-8">
        Linha do Tempo Bíblica
      </h1>
      <BibleTimeline />
    </div>
  );
};

export default Timeline;