const Skills = () => {
  const skills = [
    { category: "Programming", items: ["Python", "JavaScript", "Java", "C++"] },
    { category: "Frontend", items: ["HTML5", "CSS3", "React.js", "Bootstrap"] },
    { category: "Backend", items: ["Django", "Flask", "Node.js", "Express.js", "REST APIs"] },
    { category: "AI/ML", items: ["Pandas", "NumPy", "Scikit-learn", "TensorFlow", "Keras", "OpenCV", "CNN", "Basic Generative AI"] },
    { category: "Databases", items: ["MySQL", "MongoDB", "SQLite"] },
    { category: "Tools", items: ["Git", "GitHub", "VS Code", "Jupyter Notebook"] }
  ];

  return (
    <section id="skills" className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-10">
          Skills
        </h2>

        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="skill-card"
            >
              <h3 className="text-xl font-bold mb-4">
                {skill.category}
              </h3>
              
              <ul className="space-y-2">
                {skill.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <span>✓</span>
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
