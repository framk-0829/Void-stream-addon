// Public-domain demo catalog. Replace/add items only when you have rights to the media.
export const demoMovies = [
  {
    id: "void:big-buck-bunny",
    type: "movie",
    name: "Big Buck Bunny",
    poster: "https://peach.blender.org/wp-content/uploads/title_anouncement.jpg",
    description: "A public-domain-friendly animated short from the Blender Open Movie project.",
    year: 2008,
    genres: ["Animation", "Comedy"],
    runtime: "10 min",
    imdbRating: "6.5",
    streams: [{
      name: "Blender Open Movie • Original",
      title: "1080p • English audio • English subtitles unavailable • Demo source",
      url: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      quality: "1080p",
      audio: ["English"],
      subtitles: []
    }]
  },
  {
    id: "void:elephants-dream",
    type: "movie",
    name: "Elephants Dream",
    poster: "https://orange.blender.org/wp-content/themes/orange/images/common/ed_header.jpg",
    description: "An experimental animated short from the Blender Open Movie project.",
    year: 2006,
    genres: ["Animation", "Sci-Fi"],
    runtime: "11 min",
    streams: []
  },
  {
    id: "void:sintel",
    type: "movie",
    name: "Sintel",
    poster: "https://durian.blender.org/wp-content/uploads/2010/05/sintel_poster.jpg",
    description: "A fantasy short film from the Blender Open Movie project.",
    year: 2010,
    genres: ["Animation", "Fantasy"],
    runtime: "15 min",
    streams: []
  }
];

export const demoSeries = [];
export const demoChannels = [
  {
    id: "void:nasa-tv",
    type: "channel",
    name: "NASA+ / NASA TV",
    poster: "https://www.nasa.gov/wp-content/uploads/2023/03/nasa-logo-web-rgb.png",
    description: "NASA public live programming. Availability and stream URL may change.",
    streams: []
  }
];
