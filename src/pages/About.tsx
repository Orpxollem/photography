import { useEffect, useState } from 'react';
import * as neonApi from '../lib/neonApi';

function hasHtmlTags(str: string) {
  return /<[a-z][\s\S]*>/i.test(str);
}

function ensureExternalLink(url: string) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:')) {
    return url;
  }
  return `https://${url}`;
}

export function About() {
  const [aboutImage, setAboutImage] = useState('');
  const [aboutBio, setAboutBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await neonApi.getSettings();
        data.forEach((row: any) => {
          if (row.key === 'about_image') setAboutImage(row.value);
          if (row.key === 'about_bio') setAboutBio(row.value);
          if (row.key === 'about_instagram') setInstagram(row.value);
          if (row.key === 'about_email') setEmail(row.value);
          if (row.key === 'about_phone') setPhone(row.value);
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const renderBio = () => {
    if (!aboutBio) return null;
    if (hasHtmlTags(aboutBio)) {
      return <div dangerouslySetInnerHTML={{ __html: aboutBio }} />;
    }
    return aboutBio.split('\n').filter((p) => p.trim()).map((p, i) => <p key={i}>{p}</p>);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black pt-32 pb-32 flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-32 pb-32 max-sm:pt-24">
      <div className="max-w-7xl mx-auto px-6 max-sm:px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-sm:gap-10">
          <div className="space-y-16 max-sm:space-y-10 animate-fade-slide-up" style={{ animationDelay: '0.05s' }}>
            {aboutImage && (
              <div>
                <img
                  src={aboutImage}
                  alt="Joel Gyamera"
                  className="w-full max-w-sm aspect-square object-cover"
                />
              </div>
            )}

            <div>
              <h2 className="text-3xl font-light text-white mb-8 max-sm:text-2xl max-sm:mb-6">Contact</h2>
              <div className="space-y-4 text-gray-300">
                {instagram && (
                  <p className="text-lg max-sm:text-base">
                    <a
                      href={ensureExternalLink(instagram)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white transition"
                    >
                      Instagram
                    </a>
                  </p>
                )}
                {email && (
                  <p className="text-lg max-sm:text-base">
                    <a
                      href={`mailto:${email}`}
                      className="hover:text-white transition break-all"
                    >
                      {email}
                    </a>
                  </p>
                )}
                {phone && (
                  <p className="text-lg max-sm:text-base">
                    <a href={`tel:${phone}`} className="hover:text-white transition">
                      {phone}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="animate-fade-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="space-y-6 text-gray-200 text-lg leading-relaxed max-sm:text-base [&_strong]:font-semibold [&_strong]:text-white [&_em]:italic">
              {renderBio()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
