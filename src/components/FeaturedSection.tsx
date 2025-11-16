import TrackCard from "./TrackCard";

const FeaturedSection = () => {
  const tracks = [
    {
      title: "Neon Lights",
      artist: "DJ Electric",
      duration: "3:45",
      coverColor: "hsl(207, 100%, 50%)",
    },
    {
      title: "Midnight Rave",
      artist: "Bass Master",
      duration: "4:20",
      coverColor: "hsl(207, 80%, 45%)",
    },
    {
      title: "Digital Dreams",
      artist: "Synth Wave",
      duration: "3:15",
      coverColor: "hsl(207, 90%, 55%)",
    },
    {
      title: "Urban Pulse",
      artist: "City Beats",
      duration: "4:05",
      coverColor: "hsl(207, 85%, 48%)",
    },
    {
      title: "Energy Flow",
      artist: "Rhythm Nation",
      duration: "3:55",
      coverColor: "hsl(207, 95%, 52%)",
    },
    {
      title: "Cosmic Dance",
      artist: "Space Grooves",
      duration: "4:30",
      coverColor: "hsl(207, 88%, 47%)",
    },
  ];

  return (
    <section className="px-4 pb-6">
      <h2 className="mb-3 text-xl font-semibold">
        Популярные треки
      </h2>
      <div className="space-y-2">
        {tracks.map((track, index) => (
          <TrackCard key={index} {...track} />
        ))}
      </div>
    </section>
  );
};

export default FeaturedSection;
