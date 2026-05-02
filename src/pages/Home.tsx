import { Link } from 'react-router-dom';

export function Home() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-20">
      {/* Hero Section */}
      <div className="w-full px-0">
        <div className="mb-16 px-6 md:px-12">
          <p className="text-5xl md:text-7xl font-light text-white italic leading-tight">
            "Aside your two binocular eyes and the camera's monocular lens, you
            need a fourth eye as a photographer".
          </p>
        </div>

        {/* Featured Image */}
        <div className="mb-20">
          <img
            src="https://images.pexels.com/photos/8434761/pexels-photo-8434761.jpeg"
            alt="Featured work"
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Navigation Grid */}
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <Link
              to="/about"
              className="group py-12 border-t border-gray-800 hover:border-gray-600 transition"
            >
              <h2 className="text-3xl md:text-4xl font-light text-white group-hover:text-gray-300 transition">
                About
              </h2>
            </Link>
            <Link
              to="/series"
              className="group py-12 border-t border-gray-800 hover:border-gray-600 transition"
            >
              <h2 className="text-3xl md:text-4xl font-light text-white group-hover:text-gray-300 transition">
                Series
              </h2>
            </Link>
            <Link
              to="/exhibitions"
              className="group py-12 border-t border-gray-800 hover:border-gray-600 transition"
            >
              <h2 className="text-3xl md:text-4xl font-light text-white group-hover:text-gray-300 transition">
                Exhibitions
              </h2>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
