const About = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-10">
          About Me
        </h2>
        
        <div className="max-w-2xl mx-auto">
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            I'm Rohan Kumar Bangalore Sukumar, a passionate MERN Stack Developer with a love for creating beautiful and functional web applications. With expertise in MongoDB, Express, React, and Node.js, I build scalable and responsive solutions.
          </p>
          
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            I'm dedicated to writing clean, maintainable code and staying updated with the latest web development trends. My goal is to create web experiences that are not just functional but also delightful for users.
          </p>
          
          <p className="text-lg text-gray-700 dark:text-gray-300">
            When I'm not coding, you can find me exploring new technologies, contributing to open-source projects, or sharing knowledge with the developer community.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
