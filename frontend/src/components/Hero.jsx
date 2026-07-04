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
          className="w-40 h-40 rounded-full mx-auto border-4 border-white"
        />

        <h1 className="text-5xl font-bold mt-6">
          Hi, I'm Rohan Kumar
        </h1>

        <p className="text-xl mt-4">
          MERN Stack Developer
        </p>

        <button className="bg-white text-blue-600 px-6 py-3 rounded-lg mt-6 font-semibold hover:scale-105 transition">
          Download Resume
        </button>
      </div>
    </section>
  );
};

export default Hero;
