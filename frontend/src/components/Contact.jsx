const Contact = () => {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-10">
          Get In Touch
        </h2>

        <div className="max-w-2xl mx-auto">
          <div className="contact-form">
            <form className="space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-2">Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Your Email"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">Message</label>
                <textarea
                  placeholder="Your Message"
                  rows="5"
                ></textarea>
              </div>

              <button type="submit">
                Send Message
              </button>
            </form>
          </div>

          <div className="contact-info">
            <p className="mb-4">
              You can also reach me at:
            </p>
            <div className="space-y-2">
              <p>
                <a href="mailto:rohans76426@gmail.com">
                  rohans76426@gmail.com
                </a>
              </p>
              <p>
                <a href="tel:+919606318240">
                  +91 9606318240
                </a>
              </p>
            </div>

            <div className="social-links">
              <a
                className="social-button"
                href="https://github.com/RohanK6136"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              <a
                className="social-button"
                href="https://linkedin.com/in/rohan-kumar-bangalore-sukumar-702381273"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
