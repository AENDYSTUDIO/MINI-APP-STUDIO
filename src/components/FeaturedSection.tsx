import TrackCard from "./TrackCard";

const FeaturedSection = () => {
  const tracks = [
    {
      title: "Neon Lights",
      artist: "DJ Electric",
      duration: "3:45",
      coverColor: "hsl(326, 100%, 74%)",
    },
    {
      title: "Midnight Rave",
      artist: "Bass Master",
      duration: "4:20",
      coverColor: "hsl(280, 80%, 60%)",
    },
    {
      title: "Digital Dreams",
      artist: "Synth Wave",
      duration: "3:15",
      coverColor: "hsl(195, 100%, 50%)",
    },
    {
      title: "Urban Pulse",
      artist: "City Beats",
      duration: "4:05",
      coverColor: "hsl(326, 100%, 64%)",
    },
    {
      title: "Energy Flow",
      artist: "Rhythm Nation",
      duration: "3:55",
      coverColor: "hsl(280, 70%, 55%)",
    },
    {
      title: "Cosmic Dance",
      artist: "Space Grooves",
      duration: "4:30",
      coverColor: "hsl(195, 90%, 45%)",
    },
  ];

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <h2 className="mb-8 text-3xl font-bold text-foreground md:text-4xl">
          Популярные треки
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tracks.map((track, index) => (
            <TrackCard key={index} {...track} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
