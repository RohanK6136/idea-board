const Hero = () => {
  return (
    <section
      id="home"
      className="min-h-screen bg-gradient-to-r from-violet-600 to-indigo-700 flex items-center justify-center"
    >
      <div className="text-center text-white">
        <img
          src="https://tse4.mm.bing.net/th/id/OIP.46kBfNqdOveb1FS1c_V9VwHaHa?cb=thfvnextfalcon2&w=980&h=980&rs=1&pid=ImgDetMain&o=7&rm=3"
          alt="profile"
          className="hero-profile-image"
        />

        <h1 className="text-5xl font-bold mt-6">
          Hi, I'm Rohan Kumar
        </h1>

        <p className="text-xl mt-4">
          MERN Stack Developer
        </p>

        <a
          className="resume-button"
          href="/RohanKumar-bs-resume-2026.pdf"
          download
        >
          Download Resume
        </a>
      </div>
    </section>
  );
};

export default Hero;
