const Reflection = () => {
  const answers = [
    {
      question: "What tech stack did you choose and why?",
      answer: "I chose React.js with Vite for the frontend because it makes the portfolio sections reusable, fast to build, and easy to update. The backend uses Node.js and Express for the idea board API because it is lightweight, simple to deploy, and works well for REST endpoints. SQLite keeps the data layer simple for a small deployed project, and Render with GitHub deployment makes updates straightforward."
    },
    {
      question: "Where did the AI get confused, hallucinate, or write bad code, and how did you step in to fix it?",
      answer: "The AI initially used Tailwind-style utility classes even though Tailwind was not configured in the project. Because of that, the navbar links stacked vertically and image sizing classes did not apply. I fixed it by checking the actual project setup, replacing unsupported utility classes with real CSS, and verifying each change with a production build before deploying."
    },
    {
      question: "If you had another 2 hours to work on this, what would you add or improve?",
      answer: "I would improve the responsive polish, connect the contact form to a real email or backend submission flow, add project screenshots and live links, improve accessibility and SEO, and add basic tests for the API and main UI flows."
    }
  ];

  return (
    <section id="reflection" className="reflection-section">
      <div className="container">
        <h2>Project Reflection</h2>

        <div className="reflection-grid">
          {answers.map((item, index) => (
            <article className="reflection-card" key={index}>
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reflection;
