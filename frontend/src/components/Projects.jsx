const Projects = () => {
  const projects = [
    {
      title: "E-Commerce Website",
      desc: "Online shopping platform."
    },
    {
      title: "Travel Website",
      desc: "Tour package booking application."
    },
    {
      title: "Portfolio Website",
      desc: "Personal portfolio project."
    }
  ];

  return (
    <section id="projects" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-10">
          Projects
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="shadow-lg rounded-lg overflow-hidden"
            >
              <img
                src="https://via.placeholder.com/400x250"
                alt=""
                className="w-full"
              />

              <div className="p-5">
                <h3 className="text-2xl font-bold">
                  {project.title}
                </h3>

                <p className="mt-3 text-gray-600">
                  {project.desc}
                </p>

                <button className="bg-blue-600 text-white px-4 py-2 rounded mt-4">
                  View Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;
