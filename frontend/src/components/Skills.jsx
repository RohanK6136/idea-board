const Skills = () => {
  const skills = [
    { category: "Frontend", items: ["React", "JavaScript", "Tailwind CSS", "HTML/CSS"] },
    { category: "Backend", items: ["Node.js", "Express", "REST APIs", "Authentication"] },
    { category: "Database", items: ["MongoDB", "SQL", "Firebase", "Database Design"] },
    { category: "Tools", items: ["Git", "GitHub", "VSCode", "Postman"] }
  ];

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-10">
          Skills
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition"
            >
              <h3 className="text-xl font-bold mb-4 text-blue-600">
                {skill.category}
              </h3>
              
              <ul className="space-y-2">
                {skill.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="text-gray-700 dark:text-gray-300 flex items-center">
                    <span className="mr-2">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
