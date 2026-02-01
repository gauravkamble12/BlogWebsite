document.addEventListener("submit", async e => {
  if (!e.target.classList.contains("comment-form")) return;

  e.preventDefault();

  const form = e.target;
  const blogId = form.dataset.blog;
  const input = form.querySelector("input");

  const res = await fetch(`/comment/${blogId}/ajax`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input.value }),
  });

  const comment = await res.json();

  const container = form
    .closest(".blog-card")
    .querySelector(".comments");

  container.innerHTML += `
    <p><strong>${comment.user.name}:</strong> ${comment.text}</p>
  `;

  input.value = "";
});
