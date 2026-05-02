export function About() {
  return (
    <div className="min-h-screen bg-black pt-32 pb-32">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Image */}
          <div className="flex items-center justify-center">
            <img
              src="https://images.pexels.com/photos/5632399/pexels-photo-5632399.jpeg"
              alt="Joel Gyamera"
              className="w-full max-w-sm aspect-square object-cover"
            />
          </div>

          {/* Bio Section */}
          <div>
            <div className="space-y-6 text-gray-200 text-lg leading-relaxed">
              <p>
                Joel Gyamera (b. 1999, Tema, Ghana) is a photographer whose work
                transforms personal memory and everyday environments into visual
                narratives of connection. Originally entering the creative space as a
                model, Joel developed a distinct sensitivity to posture and presence,
                qualities that inform his emotionally resonant photographic style.
              </p>

              <p>
                He developed his narrative approach through close engagement with
                artists, whose dialogue and guidance helped shape his photographic
                language.
              </p>

              <p>
                His work foregrounds motion, texture, and community as sites of creative
                inquiry. Rooted in personal experience and cultural memory, Joel's
                photography offers a poetic lens into resilience, joy, and collective
                identity, bridging the past and present through visual storytelling.
              </p>
            </div>

            {/* Contact Section */}
            <div className="mt-16 pt-12 border-t border-gray-800">
              <h2 className="text-3xl font-light text-white mb-8">Contact</h2>
              <div className="space-y-4 text-gray-300">
                <p className="text-lg">
                  <a
                    href="mailto:joelgyamera@gmail.com"
                    className="hover:text-white transition"
                  >
                    joelgyamera@gmail.com
                  </a>
                </p>
                <p className="text-lg">
                  <a href="tel:+233594214783" className="hover:text-white transition">
                    +233 59 4214 783
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
