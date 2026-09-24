import './App.css'

const featureList = [
  'Be Part of a Community',
  'Track Your Watchlist',
  'Personalized Recommendations',
  'Connect with Your Friends',
]

const galleryImages = [
  'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
]

const testimonials = [
  {
    quote:
      'Finally, an easy way to decide what to watch. I love the swipe feature because it’s so much easier than scrolling through Netflix for 30 minutes. The recommendations actually feel tailored to my taste.',
    author: 'Lindsey Sou',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote:
      'Movie night just got so much easier. The session feature is my favorite part. My friends and I can see which movies we both like without having to send each other a million titles. It makes picking a movie way less complicated.',
    author: 'Ada Kivanc',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote:
      'Simple idea, really fun to use. Flick makes discovering movies feel like a game. I especially like that I can build up my preferences over time and get recommendations based on what I actually enjoy.',
    author: 'Adrian Blanco',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
  },
]

function App() {
  return (
    <div className="flick-site">
      <div className="built-on-bar">
        <span>Built on</span>
        <strong>Wix Studio</strong>
      </div>

      <header className="site-header">
        <div className="brand-lockup">
          <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=200&q=80" alt="Flick logo" />
          <span>Flick</span>
        </div>

        <nav className="site-nav" aria-label="Main navigation">
          <button type="button" className="menu-button">Menu</button>
        </nav>

        <a className="header-cta" href="https://jcdavidson6.github.io/Flick/" target="_blank" rel="noreferrer">
          Start Today
        </a>
      </header>

      <main className="page-shell">
        <section className="hero-section">
          <div className="hero-video">
            <button type="button" className="video-button">Play video</button>
          </div>

          <div className="hero-copy">
            <h1>Swipe into Something Worth Watching</h1>
            <p>A personalized app for your next watch</p>
            <a className="primary-link" href="https://jcdavidson6.github.io/Flick/" target="_blank" rel="noreferrer">
              Start Today
            </a>
          </div>
        </section>

        <section className="info-section">
          <div className="info-copy">
            <h2>Why Flix will simplify your life</h2>
            <div className="quote-block">
              <p>“Every group hangout has the same five minutes of dead air: “What do you want to watch?” “I don’t know, what do you want to watch?””</p>
              <p>
                Existing tools solve half the problem - a watchlist app remembers what you wanted to see, and a ratings app tells you what’s good - but nothing helps two or more people actually converge on one answer in the moment.
              </p>
              <p>
                “Flick treats movie discovery as a taste-matching problem, not a search problem: swipe on movies the way you’d swipe on a dating profile, build a taste graph from the pattern, and when you’re watching with someone else, swipe the same deck and surface exactly where you overlap.”
              </p>
            </div>
          </div>
          <div className="info-visual" aria-label="Feature illustration" />
        </section>

        <section className="app-feature section-block">
          <div className="section-heading-row">
            <h2>Explore the App</h2>
          </div>

          <ul className="feature-list">
            {featureList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="pages-section section-block">
          <div className="section-toolbar">
            <div>
              <h2>Explore Our Pages</h2>
              <p>A curated “For You” page we think you will love</p>
            </div>
            <a className="secondary-link" href="https://jcdavidson6.github.io/Flick/" target="_blank" rel="noreferrer">
              Start Now
            </a>
          </div>

          <div className="gallery-grid">
            {galleryImages.map((image, index) => (
              <div key={image + index} className="gallery-card" style={{ backgroundImage: `url(${image})` }} />
            ))}
          </div>
        </section>

        <section className="testimonials section-block">
          <div className="testimonials-header">
            <img src="https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80" alt="People using Flick" />
            <h2>Hear What Our Community Has to Say</h2>
          </div>

          <div className="testimonial-list">
            {testimonials.map((item) => (
              <article key={item.author} className="testimonial-item">
                <div className="quote-mark" aria-hidden="true">“</div>
                <blockquote>{item.quote}</blockquote>
                <div className="person-row">
                  <img src={item.avatar} alt={item.author} />
                  <div>
                    <strong>{item.author}</strong>
                    <div className="stars" aria-label="five star rating">
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                      <span>★</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="newsletter section-block">
          <div className="newsletter-header">
            <h2>Keep up With Our Latest Updates</h2>
          </div>

          <form className="newsletter-form">
            <div className="input-group">
              <label htmlFor="email">Your Email</label>
              <div className="email-row">
                <input id="email" type="email" placeholder="Your Email" />
                <button type="submit">Submit</button>
              </div>
              <label className="checkbox-row">
                <input type="checkbox" defaultChecked />
                <span>Yes, Subscribe me to your newsletter</span>
              </label>
            </div>
          </form>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-brand">
          <img src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=200&q=80" alt="Flick brand" />
          <span>Flick</span>
        </div>

        <div className="footer-links">
          <a href="https://jamesdportfolio.wixstudio.com/flick">Home</a>
          <a href="https://jcdavidson6.github.io/Flick/" target="_blank" rel="noreferrer">Start Now</a>
        </div>
      </footer>
    </div>
  )
}

export default App
